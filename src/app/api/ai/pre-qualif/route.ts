import { NextRequest, NextResponse } from 'next/server';

import { getOpenAIClient } from '@/lib/ai/openai-client';
import { getAuthScope } from '@/lib/auth-scope';
import { extractTextFromFile } from '@/lib/file-utils';

// --- Types ---

export interface PreQualifQuestion {
  id: number;
  formulation: string;
  elementsAttendus: string[];
  definitions: string[];
  exempleConcret: string;
  niveauCriticite: 'critique' | 'standard';
}

export interface PreQualifTheme {
  theme: string;
  questions: PreQualifQuestion[];
}

export interface PreQualifSynthese {
  forces: string[];
  pointsAttention: string[];
  pointsACreuser: string[];
}

export interface PreQualifQuestionnaire {
  titre: string;
  themes: PreQualifTheme[];
  synthese: PreQualifSynthese;
}

export interface PreQualifCV {
  nom: string;
  titreCv: string;
}

export interface PreQualifResult {
  questionnaire: PreQualifQuestionnaire;
  cv: PreQualifCV;
}

// --- SSE helpers ---

interface StreamMessage {
  type: 'progress' | 'complete' | 'error';
  content?: string;
  data?: unknown;
  message?: string;
  fullResponse?: string;
}

function sendSSE(
  controller: ReadableStreamDefaultController,
  message: StreamMessage
): void {
  try {
    const data = `data: ${JSON.stringify(message)}\n\n`;
    controller.enqueue(new TextEncoder().encode(data));
  } catch {
    const fallback = `data: ${JSON.stringify({
      type: 'error',
      message: 'Erreur de serialisation',
    })}\n\n`;
    controller.enqueue(new TextEncoder().encode(fallback));
  }
}

// --- Prompt builder ---

function buildPrompt(
  cvText: string,
  jobText: string,
  language: string
): string {
  const langLabel =
    language === 'en'
      ? 'ANGLAIS'
      : language === 'es'
      ? 'ESPAGNOL'
      : language === 'pt'
      ? 'PORTUGAIS'
      : 'FRANCAIS';

  return `Tu es Business Interview Coach, plateforme specialisee Banque-Assurance / ESN.
Ta mission : analyse un CV et une fiche de poste, puis genere un questionnaire d'entretien structure pour aider un Business Manager non-technique a evaluer un candidat.

**Entrees** :
1. CV du candidat :
${cvText}

2. Offre d'emploi ciblee :
${jobText}

Instructions :
- Lis et croise les documents pour detecter les competences cles requises (metier, tech, soft) et les ecarts ou incoherences dans le CV.
- Genere un questionnaire par theme : technique, fonctionnel, soft skills, etc.
- Pour chaque question, fournis :
  - La formulation
  - Les elements attendus dans la reponse
  - Une definition simple des termes techniques
  - Un exemple concret ou une analogie
  - Un niveau de criticite : standard ou critique
- Termine par une synthese claire : forces, points d'attention, points a creuser en entretien.

Contraintes :
- Reste pedagogique et structure
- Utilise un ${langLabel} professionnel clair
- Vulgarise les notions techniques : definitions et exemples

**FORMAT DE SORTIE OBLIGATOIRE** — JSON pur, rien d'autre :
{
  "cv": {
    "nom": "Nom du candidat",
    "titreCv": "Titre du CV"
  },
  "questionnaire": {
    "titre": "Questionnaire d'entretien – ...",
    "themes": [
      {
        "theme": "Nom du theme",
        "questions": [
          {
            "id": 1,
            "formulation": "...",
            "elementsAttendus": ["..."],
            "definitions": ["..."],
            "exempleConcret": "...",
            "niveauCriticite": "critique"
          }
        ]
      }
    ],
    "synthese": {
      "forces": ["..."],
      "pointsAttention": ["..."],
      "pointsACreuser": ["..."]
    }
  }
}

Les deux proprietes "questionnaire" ET "cv" sont OBLIGATOIRES.
Ne retourne RIEN d'autre que ce JSON.`;
}

// --- Route handler ---

export async function POST(request: NextRequest) {
  const scope = await getAuthScope();
  if (!scope) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const cvFile = formData.get('cvFile') as File | null;
    const cvText = formData.get('cvText') as string | null;
    const jobFile = formData.get('jobFile') as File | null;
    const jobText = formData.get('jobText') as string | null;
    const language = (formData.get('language') as string) || 'fr';

    // Resolve CV text
    let resolvedCvText = '';
    if (cvFile && cvFile.size > 0) {
      const buffer = await cvFile.arrayBuffer();
      resolvedCvText = await extractTextFromFile(buffer, cvFile.type);
    } else if (cvText && cvText.trim().length > 0) {
      resolvedCvText = cvText.trim();
    }

    if (resolvedCvText.length < 30) {
      return NextResponse.json(
        { error: 'CV requis (fichier ou texte, min 30 caracteres)' },
        { status: 400 }
      );
    }

    // Resolve job description text
    let resolvedJobText = '';
    if (jobFile && jobFile.size > 0) {
      const buffer = await jobFile.arrayBuffer();
      resolvedJobText = await extractTextFromFile(buffer, jobFile.type);
    } else if (jobText && jobText.trim().length > 0) {
      resolvedJobText = jobText.trim();
    }

    if (resolvedJobText.length < 30) {
      return NextResponse.json(
        { error: 'Description de poste requise (min 30 caracteres)' },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(resolvedCvText, resolvedJobText, language);
    const openai = getOpenAIClient();

    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = '';
        let completed = false;
        let chunkCount = 0;

        try {
          sendSSE(controller, {
            type: 'progress',
            content: 'Initialisation de la generation...',
          });

          const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            stream: true,
            temperature: 0.7,
            max_tokens: 8000,
            response_format: { type: 'json_object' },
            messages: [{ role: 'user', content: prompt }],
          });

          const timeout = setTimeout(() => {
            if (!completed) {
              sendSSE(controller, {
                type: 'error',
                message: "Delai d'attente depasse",
              });
              controller.close();
            }
          }, 300_000);

          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullResponse += content;
              chunkCount++;

              if (chunkCount % 3 === 0) {
                const progress = Math.min(Math.floor(chunkCount / 2), 90);
                sendSSE(controller, {
                  type: 'progress',
                  content: `Generation en cours... (${progress}%)`,
                  fullResponse,
                });
              }
            }

            const finishReason = chunk.choices[0]?.finish_reason;
            if (finishReason === 'stop' || finishReason === 'length') {
              clearTimeout(timeout);
              completed = true;
              break;
            }
          }

          if (completed && fullResponse.trim()) {
            try {
              const parsed = JSON.parse(fullResponse);
              sendSSE(controller, {
                type: 'complete',
                data: { success: true, data: parsed, message: 'success' },
              });
            } catch (parseError) {
              sendSSE(controller, {
                type: 'error',
                message: `Erreur de format JSON: ${
                  parseError instanceof Error ? parseError.message : 'unknown'
                }`,
                fullResponse: fullResponse.substring(0, 1000),
              });
            }
          } else if (!completed) {
            sendSSE(controller, {
              type: 'error',
              message: "Le flux s'est termine de maniere inattendue",
            });
          } else {
            sendSSE(controller, {
              type: 'error',
              message: "Reponse vide d'OpenAI",
            });
          }

          clearTimeout(timeout);
        } catch (error) {
          sendSSE(controller, {
            type: 'error',
            message: error instanceof Error ? error.message : 'Erreur interne',
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Pre-Qualif API Error:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la pre-qualification',
        details: error instanceof Error ? error.message : 'Unknown',
      },
      { status: 500 }
    );
  }
}
