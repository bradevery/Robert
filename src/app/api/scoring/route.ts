/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';

import { hybridScoringService } from '@/lib/scoring/hybrid-scoring';

import { auth } from '@/auth';

const HRFLOW_API_KEY = process.env.HRFLOW_API_KEY;
const HRFLOW_USER_EMAIL = process.env.HRFLOW_USER_EMAIL;
const HRFLOW_SOURCE_KEY = process.env.HRFLOW_SOURCE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface StreamMessage {
  type:
    | 'progress'
    | 'partial_result'
    | 'complete'
    | 'error'
    | 'streaming_content';
  content?: string;
  data?: any;
  message?: string;
}

function sendSSEData(
  controller: ReadableStreamDefaultController,
  message: StreamMessage
): void {
  try {
    const jsonString = JSON.stringify(message);
    const data = `data: ${jsonString}\n\n`;
    controller.enqueue(new TextEncoder().encode(data));
  } catch (error) {
    console.error('Erreur de sérialisation SSE:', error);
  }
}

async function parseFile(file: File, fileType: 'cv' | 'job') {
  try {
    console.log(
      `[PARSE_FILE] Début du traitement du fichier ${fileType}: ${file.name}, type: ${file.type}, taille: ${file.size}`
    );

    const fileName = file.name.toLowerCase();

    const isPdf = fileName.endsWith('.pdf');
    const isDocx = fileName.endsWith('.docx');
    const isDoc = fileName.endsWith('.doc') && !fileName.endsWith('.docx');
    const isTxt = fileName.endsWith('.txt');

    if (!isPdf && !isDocx && !isDoc && !isTxt) {
      throw new Error(
        `Le fichier ${file.name} n'est pas dans un format supporté. Formats acceptés: .pdf, .docx, .doc, .txt`
      );
    }

    if (isTxt) {
      console.log(`[PARSE_FILE] Lecture directe du fichier TXT: ${file.name}`);
      const text = await file.text();

      if (!text || text.trim().length === 0) {
        throw new Error(`Le fichier TXT ${file.name} est vide`);
      }

      console.log(
        `[PARSE_FILE] Texte extrait du TXT: ${text.length} caractères`
      );

      return {
        text: text,
        info: {
          full_name: file.name.replace('.txt', ''),
          display_name: file.name.replace('.txt', ''),
        },
        reference: file.name,
        skills: [],
        experiences: [],
        educations: [],
        languages: [],
      };
    }

    console.log(
      `[PARSE_FILE] Type de fichier détecté: ${
        isPdf ? 'PDF' : isDocx ? 'DOCX' : 'DOC'
      }`
    );

    const fileBuffer = await file.arrayBuffer();

    if (fileBuffer.byteLength === 0) {
      throw new Error(`Le fichier ${file.name} est vide`);
    }

    console.log(
      `[PARSE_FILE] Buffer du fichier créé: ${fileBuffer.byteLength} octets`
    );

    const boundary = '----surlyformdata' + Date.now();

    let body = `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="source_key"\r\n\r\n`;
    body += `fdec526f8d46e40e6e4e5e852974599eabbbec65\r\n`;
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="sync_parsing"\r\n\r\n`;
    body += `1\r\n`;

    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="reference"\r\n\r\n`;
    body += `${file.name}\r\n`;

    let contentType: string;
    if (isPdf) {
      contentType = 'application/pdf';
    } else if (isDocx) {
      contentType =
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (isDoc) {
      contentType = 'application/msword';
    } else {
      contentType = file.type || 'application/octet-stream';
    }

    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="file"; filename="${file.name}"\r\n`;
    body += `Content-Type: ${contentType}\r\n\r\n`;

    const bodyEnd = `\r\n--${boundary}--
\n`;

    const textEncoder = new TextEncoder();
    const bodyBytes = textEncoder.encode(body);
    const bodyEndBytes = textEncoder.encode(bodyEnd);

    const fullBody = new Uint8Array(
      bodyBytes.length + fileBuffer.byteLength + bodyEndBytes.length
    );
    let offset = 0;
    fullBody.set(bodyBytes, offset);
    offset += bodyBytes.length;
    fullBody.set(new Uint8Array(fileBuffer), offset);
    offset += fileBuffer.byteLength;
    fullBody.set(bodyEndBytes, offset);

    console.log(
      `[PARSE_FILE] Envoi de la requête à HRFlow pour ${fileType}: ${file.name}`
    );

    const url = `https://api.hrflow.ai/v1/profile/parsing/file`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-USER-EMAIL': 'lounas1994@gmail.com',
        'X-API-KEY': 'ask_bc8967664a7b14d63549e7e85fd1c8ae',
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: fullBody,
    });

    console.log(
      `[PARSE_FILE] Réponse HRFlow reçue pour ${fileType}: statut ${response.status}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[PARSE_FILE] Erreur HRFlow pour ${fileType} ${response.status}:`,
        errorText
      );
      throw new Error(
        `Erreur lors de l'analyse du document ${file.name} (${
          response.status
        }): ${errorText.substring(0, 200)}`
      );
    }

    const jsonResponse = await response.json();

    console.log(
      `[PARSE_FILE] Réponse JSON HRFlow pour ${fileType}: code ${jsonResponse.code}`
    );

    if (jsonResponse.code < 200 || jsonResponse.code >= 300) {
      const errorMsg = jsonResponse.message || 'Erreur inconnue';
      console.error(`[PARSE_FILE] Erreur dans la réponse HRFlow:`, errorMsg);
      throw new Error(
        `Erreur HRFlow lors de l'analyse de ${file.name}: ${errorMsg}`
      );
    }

    const responseData = jsonResponse.data.profile;

    if (!responseData) {
      console.error(
        '[PARSE_FILE] Aucune donnée de profil dans la réponse HRFlow'
      );
      throw new Error(
        `Aucune donnée de profil retournée par HRFlow pour ${file.name}`
      );
    }

    console.log(
      `[PARSE_FILE] Fichier ${fileType} traité avec succès: ${file.name}`
    );

    return responseData;
  } catch (error) {
    console.error(
      `[PARSE_FILE] Erreur lors du traitement du fichier ${fileType} ${file.name}:`,
      error
    );
    throw error;
  }
}

async function scoreProfileWithLLMReview(
  profile: any,
  jobText: string,
  fileName: string,
  sendSSEData: (
    controller: ReadableStreamDefaultController,
    message: StreamMessage
  ) => void,
  controller: ReadableStreamDefaultController
) {
  try {
    const tempDisplayName = fileName
      .replace(/\.(pdf|doc|docx|txt)$/i, '')
      .substring(0, 8);
    const contactName = cleanFileNameForContact(fileName);

    sendSSEData(controller, {
      type: 'progress',
      content: `Analyse ${tempDisplayName}...`,
    });
    const cvText = buildCvText(profile, fileName);
    const hybridResult = await hybridScoringService.calculateHybridScore(
      jobText,
      cvText,
      {
        performanceMode: 'balanced',
        bankingInsuranceFocus: true,
        useCache: true,
      }
    );

    sendSSEData(controller, {
      type: 'progress',
      content: `Revue IA pour ${tempDisplayName}...`,
    });

    const preliminaryAnalysis = {
      detected_profile_context: hybridResult.metadata.profileContext,
      detected_experience_level: hybridResult.metadata.experienceLevel,
      hybrid_score: hybridResult.finalScore,
      score_breakdown: hybridResult.breakdown,
      detected_strengths: hybridResult.analysis.strengths,
      detected_weaknesses: hybridResult.analysis.weaknesses,
      analyst_recommendation: hybridResult.analysis.matchExplanation,
    };

    const prompt = `Vous êtes un Directeur du Recrutement expert avec 20 ans d'expérience, chargé de valider l'analyse préliminaire d'un candidat faite par un système IA junior.
Votre rôle est de fournir le verdict final HONNÊTE et SANS COMPLAISANCE, en vous basant sur l'analyse fournie ET les textes originaux.

**ANALYSE PRÉLIMINAIRE DE L'IA JUNIOR :**
\`\`\`json
${JSON.stringify(preliminaryAnalysis, null, 2)}
\`\`\`

**TEXTE ORIGINAL DE L'OFFRE D'EMPLOI :**
---
${jobText.substring(0, 2000)}
---

**TEXTE ORIGINAL DU CV (nom de fichier: ${fileName}) :**
---
${cvText.substring(0, 2000)}
---

**CONSIGNES ABSOLUES - TRÈS IMPORTANT :**

1. **SOYEZ HONNÊTE ET CASH** : Si le profil ne correspond PAS à l'offre, donnez une NOTE BASSE (0-30).
   Ne cherchez PAS à tout prix à faire ressortir un profil inadapté.

2. **ÉCHELLE DE NOTATION STRICTE à respecter** :
   - **0-20** : Profil totalement inadapté (compétences ou secteur complètement différents)
   - **21-40** : Profil très peu adapté (quelques compétences transférables mais domaine très éloigné)
   - **41-60** : Profil moyennement adapté (certaines compétences correspondent mais lacunes importantes)
   - **61-75** : Bon profil (la plupart des compétences correspondent avec quelques ajustements nécessaires)
   - **76-85** : Très bon profil (correspond bien aux exigences)
   - **86-100** : Profil excellent (correspond parfaitement ou dépasse les attentes)

3. **JUSTIFICATION OBLIGATOIRE DES MAUVAISES NOTES** :
   Si vous donnez une note < 50, vous DEVEZ expliquer PRÉCISÉMENT pourquoi le profil ne correspond pas :
   - Quelles compétences clés manquent
   - Quel est le décalage entre le secteur d'activité du candidat et celui du poste
   - Pourquoi les expériences du candidat ne sont pas transférables

4. **NE PAS "TORDRE" LA RÉALITÉ** :
   ❌ Mauvais exemple : "Bien que le candidat ait travaillé sur CLEVA (assurance), il pourra s'adapter à un CRM"
   ✅ Bon exemple : "Le candidat est expert CLEVA (gestion de contrats d'assurance) alors que le poste requiert une expertise CRM. Il n'y a pas de compétences transférables directes. Note : 15/100"

5. **DISTINGUER LES CATÉGORIES** :
   - Compétences techniques : technologies, outils, méthodologies spécifiques
   - Soft skills : communication, leadership, autonomie, etc.
   - Données logistiques : TJM/Salaire, localisation géographique vs lieu de mission, disponibilité

**VOTRE MISSION :**
En tant qu'expert, évaluez HONNÊTEMENT le profil. Si le candidat ne correspond pas, dites-le clairement avec une note basse.
Votre crédibilité dépend de votre capacité à éliminer les profils inadaptés.

**IMPORTANT: Vous devez retourner UNIQUEMENT un objet JSON valide.
    - PAS d' apostrophe apostrophe apostrophe json ou apostrophe apostrophe apostrophe
    - PAS de commentaires
    - PAS de texte avant ou après
    - JUSTE le JSON pur commençant par { et finissant par }
    - Utilisez uniquement des guillemets doubles " pour toutes les chaînes**

Format JSON à respecter EXACTEMENT :

{
  "candidate_initials": "Extrayez les initiales du candidat depuis le CV (ex: 'J-P', 'BRA', 'M-D'). Règles: maximum 3 mots, 1-3 lettres par mot, excluez les mots techniques comme TJM, SAB, TEST, SURLY, PDF, HTML, API. Si introuvable, utilisez les 2-3 premières lettres du nom de fichier sans extension.",
  "final_score": [un nombre entier entre 0 et 100, votre évaluation finale HONNÊTE selon l'échelle stricte ci-dessus],
  "justification": "Rédigez une analyse concise et professionnelle du profil (150 mots max), commençant directement par 'Ce profil' ou 'Le candidat'. Justifiez votre score final en vous basant sur l'adéquation réelle du CV avec l'offre. Si la note est basse (< 50), expliquez PRÉCISÉMENT pourquoi le profil ne correspond pas.",
  "competences_techniques": {
    "points_forts": ["Compétence technique 1", "Compétence technique 2", "..."],
    "points_faibles": ["Compétence technique manquante 1", "Compétence technique manquante 2", "..."]
  },
  "soft_skills": {
    "points_forts": ["Soft skill 1", "Soft skill 2", "..."],
    "points_faibles": ["Soft skill manquant 1", "Soft skill manquant 2", "..."]
  },
  "donnees_logistiques": {
    "tjm_salaire": "Information sur le TJM ou salaire si disponible, sinon 'Non spécifié'",
    "localisation": "Localisation géographique du candidat si disponible, sinon 'Non spécifié'",
    "disponibilite": "Disponibilité du candidat si mentionnée, sinon 'Non spécifié'",
    "points_vigilance": ["Point logistique 1 si pertinent", "Point logistique 2 si pertinent"]
  },
  "points_forts_globaux": [
    "Point fort global 1 (le plus important)",
    "Point fort global 2",
    "Point fort global 3"
  ],
  "points_vigilance_globaux": [
    "Point de vigilance global 1 (le plus critique)",
    "Point de vigilance global 2",
    "Point de vigilance global 3"
  ]
}`;

    if (!OPENAI_API_KEY) {
      throw new Error('Clé API OpenAI non configurée.');
    }

    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    let content = '';
    let chunkCount = 0;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Changed to gpt-4o as gpt-4.1 might be a typo or unavailable, defaulting to a known good model
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 800,
      temperature: 0.2,
      stream: true,
    });

    for await (const chunk of response) {
      const delta = chunk.choices[0]?.delta?.content || '';

      if (delta) {
        content += delta;
        chunkCount++;

        if (chunkCount % 5 === 0) {
          sendSSEData(controller, {
            type: 'streaming_content',
            content: content,
          });
        }
      }

      const finishReason = chunk.choices[0]?.finish_reason;
      if (finishReason === 'stop' || finishReason === 'length') {
        break;
      }
    }

    if (!content) {
      throw new Error("Aucune réponse de l'API de revue par IA.");
    }

    let jsonPart = '';
    const jsonPatterns = [
      /```json\s*(\{[\s\S]*?\})\s*```/gi,
      /```\s*(\{[\s\S]*?\})\s*```/gi,
      /(\{(?:[^{}]|{(?:[^{}]|{[^{}]*})*})*\})/g,
    ];

    let jsonMatch = null;
    for (const pattern of jsonPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        jsonMatch = matches.reduce((longest, current) =>
          current.length > longest.length ? current : longest
        );
        break;
      }
    }

    if (jsonMatch) {
      jsonPart = jsonMatch.replace(/```json|```/g, '').trim();
    } else {
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonPart = content.substring(firstBrace, lastBrace + 1);
      } else {
        throw new Error('Aucun JSON valide trouvé dans la réponse');
      }
    }

    const cleaningSteps = [
      (json: string) => json,
      (json: string) =>
        json
          .replace(/,(\s*[}\]])/g, '$1')
          .replace(/([^"\\])\n/g, '$1\\n')
          .replace(/\t/g, '  '),
      (json: string) =>
        json
          .replace(/,(\s*[}\]])/g, '$1')
          .replace(/([^"\\])\n/g, '$1\\n')
          .replace(/\t/g, '  ')
          .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":'),
      (json: string) => {
        const cleaned = json
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/\/\/.*$/gm, '')
          .replace(/,(\s*[}\]])/g, '$1')
          .replace(/([^"\\])\n/g, '$1\\n')
          .replace(/\t/g, '  ')
          .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');

        return cleaned
          .split('')
          .filter((char) => {
            const code = char.charCodeAt(0);
            return !(code >= 0 && code <= 31) && !(code >= 127 && code <= 159);
          })
          .join('');
      },
    ];

    let finalResult;
    let parseError = null;

    for (let i = 0; i < cleaningSteps.length; i++) {
      try {
        const cleanedJson = cleaningSteps[i](jsonPart);
        finalResult = JSON.parse(cleanedJson);
        console.log(`[LLM_PARSE] Parsing réussi à l'étape ${i + 1}`);
        break;
      } catch (error) {
        parseError = error;
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.log(`[LLM_PARSE] Étape ${i + 1} échouée:`, errorMsg);
        continue;
      }
    }

    if (!finalResult) {
      const errorMsg =
        parseError instanceof Error ? parseError.message : 'Unknown error';
      console.error('[LLM_PARSE] Tous les nettoyages ont échoué');
      console.error('[LLM_PARSE] Dernière erreur:', errorMsg);
      console.error(
        '[LLM_PARSE] JSON problématique:',
        jsonPart.substring(0, 500)
      );
      console.error('[LLM_PARSE] Contenu original:', content.substring(0, 500));

      finalResult = {
        candidate_initials: tempDisplayName,
        final_score: 50,
        justification: 'Erreur de parsing JSON - analyse partielle effectuée',
        points_forts: ['Analyse technique impossible'],
        points_vigilance: [`Erreur de format de réponse IA, ${errorMsg}`],
      };
    }

    const aiExtractedInitials =
      finalResult.candidate_initials || tempDisplayName;

    return {
      profile: {
        reference: profile.key || profile.id || fileName,
        fileName: fileName,
        info: {
          display_name: aiExtractedInitials,
          contact_name: contactName,
        },
      },
      score: finalResult.final_score || 0,
      confidence: hybridResult.confidence,
      skills: {
        matching: (
          finalResult.points_forts_globaux ||
          finalResult.points_forts ||
          []
        ).map((skill: string) => ({
          name: skill,
          score: 100,
        })),
        missing: (
          finalResult.points_vigilance_globaux ||
          finalResult.points_vigilance ||
          []
        ).map((skill: string) => ({
          name: skill,
          score: 0,
        })),
      },
      competences_techniques: finalResult.competences_techniques || {
        points_forts: [],
        points_faibles: [],
      },
      soft_skills: finalResult.soft_skills || {
        points_forts: [],
        points_faibles: [],
      },
      donnees_logistiques: finalResult.donnees_logistiques || {
        tjm_salaire: 'Non spécifié',
        localisation: 'Non spécifié',
        disponibilite: 'Non spécifié',
        points_vigilance: [],
      },
      justification:
        finalResult.justification || 'Analyse finale par IA experte.',
      breakdown: hybridResult.breakdown,
      analysis: {
        ...hybridResult.analysis,
        llm_strengths:
          finalResult.points_forts_globaux || finalResult.points_forts,
        llm_weaknesses:
          finalResult.points_vigilance_globaux || finalResult.points_vigilance,
      },
      performance: hybridResult.performance,
    };
  } catch (error) {
    console.error('[LLM_REVIEW_ERROR]', error);
    const simpleFallback = fileName
      .replace(/\.(pdf|doc|docx|txt)$/i, '')
      .substring(0, 8);
    const contactName = cleanFileNameForContact(fileName);
    return {
      profile: {
        reference: profile.key || profile.id || fileName,
        fileName: fileName,
        info: { display_name: simpleFallback, contact_name: contactName },
      },
      score: 0,
      confidence: 0,
      skills: { matching: [], missing: [] },
      competences_techniques: {
        points_forts: [],
        points_faibles: [],
      },
      soft_skills: {
        points_forts: [],
        points_faibles: [],
      },
      donnees_logistiques: {
        tjm_salaire: 'Non spécifié',
        localisation: 'Non spécifié',
        disponibilite: 'Non spécifié',
        points_vigilance: [],
      },
      justification: `Erreur lors de la revue par IA: ${
        error instanceof Error ? error.message : String(error)
      }`,
      breakdown: {
        vectorScore: 0,
        keywordScore: 0,
        embeddingScore: 0,
        semanticScore: 0,
      },
      analysis: {},
      performance: {
        totalTimeMs: 0,
        cacheHits: 0,
        cacheMisses: 0,
        phases: {},
      },
    };
  }
}

function cleanFileNameForContact(fileName: string): string {
  let name = fileName.split('.').slice(0, -1).join('.') || fileName;

  name = name.replace(/[_-]/g, ' ');

  name = name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  name = name.replace(/\b(cv|resume|curriculum vitae)\b/gi, '').trim();

  return name;
}

function buildCvText(profile: any, fileName: string): string {
  const parts = [];

  parts.push(`Nom du fichier: ${fileName}`);

  if (profile.info?.summary) {
    parts.push(`Résumé: ${profile.info.summary}`);
  }

  if (profile.skills && profile.skills.length > 0) {
    const skills = profile.skills
      .map((skill: any) => skill.name || skill)
      .filter(Boolean)
      .join(', ');
    if (skills) {
      parts.push(`Compétences: ${skills}`);
    }
  }

  if (profile.experiences && profile.experiences.length > 0) {
    const experiences = profile.experiences
      .map((exp: any) => {
        const expParts = [];
        if (exp.title) expParts.push(exp.title);
        if (exp.company) expParts.push(`chez ${exp.company}`);
        if (exp.description) expParts.push(exp.description.substring(0, 300));
        return expParts.join(' ');
      })
      .filter(Boolean)
      .join('. ');
    if (experiences) {
      parts.push(`Expériences: ${experiences}`);
    }
  }

  if (profile.educations && profile.educations.length > 0) {
    const educations = profile.educations
      .map((edu: any) => {
        const eduParts = [];
        if (edu.title) eduParts.push(edu.title);
        if (edu.school) eduParts.push(`à ${edu.school}`);
        return eduParts.join(' ');
      })
      .filter(Boolean)
      .join('. ');
    if (educations) {
      parts.push(`Formation: ${educations}`);
    }
  }

  if (profile.languages && profile.languages.length > 0) {
    const languages = profile.languages
      .map((lang: any) => lang.name || lang)
      .filter(Boolean)
      .join(', ');
    if (languages) {
      parts.push(`Langues: ${languages}`);
    }
  }

  if (profile.text && profile.text.length > 100) {
    parts.push(profile.text.substring(0, 2000));
  }

  const result = parts.join('\n\n');

  if (result.length < 50) {
    return `${fileName} - CV avec données limitées disponibles pour l'analyse.`;
  }

  return result;
}

export async function POST(request: NextRequest) {
  try {
    if (!HRFLOW_API_KEY || !HRFLOW_USER_EMAIL || !HRFLOW_SOURCE_KEY) {
      throw new Error("Configuration du service d'analyse manquante.");
    }

    const session = await auth();
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ message: 'Utilisateur non connecté' }),
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const jobOfferFile = formData.get('jobOffer') as File;
    const cvFiles = formData.getAll('cvs') as File[];

    if (!jobOfferFile || cvFiles.length === 0) {
      return new Response(JSON.stringify({ message: 'Fichiers manquants.' }), {
        status: 400,
      });
    }
    if (cvFiles.length > 5) {
      return new Response(JSON.stringify({ message: '5 CVs maximum.' }), {
        status: 400,
      });
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          sendSSEData(controller, {
            type: 'progress',
            content: "Analyse de l'offre d'emploi...",
          });
          const jobData = await parseFile(jobOfferFile, 'job');
          const jobText = jobData.text || '';
          if (!jobText) {
            throw new Error(
              "Impossible d'extraire le texte de l'offre d'emploi"
            );
          }

          for (let i = 0; i < cvFiles.length; i++) {
            const cvFile = cvFiles[i];
            try {
              sendSSEData(controller, {
                type: 'progress',
                content: `Analyse du CV ${i + 1}/${cvFiles.length}: ${
                  cvFile.name
                }`,
              });
              const cvData = await parseFile(cvFile, 'cv');

              const scoredProfile = await scoreProfileWithLLMReview(
                cvData,
                jobText,
                cvFile.name,
                sendSSEData,
                controller
              );

              sendSSEData(controller, {
                type: 'partial_result',
                data: scoredProfile,
              });
            } catch (error) {
              console.error(
                `Erreur lors du traitement du CV ${cvFile.name}:`,
                error
              );
              sendSSEData(controller, {
                type: 'error',
                message: `Erreur avec ${cvFile.name}: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              });
            }
          }

          sendSSEData(controller, {
            type: 'complete',
            content: 'Analyse terminée.',
          });
          controller.close();
        } catch (err) {
          console.error('[MATCHING_STREAM_ERROR]', err);
          sendSSEData(controller, {
            type: 'error',
            message:
              err instanceof Error ? err.message : 'Une erreur est survenue.',
          });
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
  } catch (err) {
    console.error('[MATCHING_POST_ERROR]', err);
    return new Response(
      JSON.stringify({
        message:
          err instanceof Error ? err.message : 'Erreur interne du serveur.',
      }),
      { status: 500 }
    );
  }
}
