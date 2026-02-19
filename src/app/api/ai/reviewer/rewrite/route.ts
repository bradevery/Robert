import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getValidatedJson } from '@/lib/ai/get-validated-json';

const RewrittenCVSchema = z.object({
  basics: z.object({
    title: z.string(),
    summary: z.string(),
  }),
  experiences: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      description: z.string(),
      improvementsMade: z.array(z.string()),
    })
  ),
  skills: z.object({
    technical: z.array(z.string()),
    soft: z.array(z.string()),
  }),
  language: z.string(),
});

export type RewrittenCV = z.infer<typeof RewrittenCVSchema>;

const SYSTEM_PROMPT = `Tu es Robert, un expert international en recrutement et optimisation de CV.
Ton objectif est de réécrire un CV pour qu'il corresponde parfaitement à une Offre d'Emploi (AO) donnée.

RÈGLES D'OR :
1. VÉRITÉ : Ne jamais inventer d'expériences ou de compétences. Se baser uniquement sur le CV fourni.
2. ALIGNEMENT : Utiliser le vocabulaire et les mots-clés de l'AO.
3. IMPACT : Reformuler les descriptions en mode "Action -> Résultat". Utiliser des verbes d'action forts.
4. QUALITÉ : Corriger toutes les fautes d'orthographe et de syntaxe.
5. LANGUE : Si l'AO est en anglais, le CV doit être en anglais. Si l'AO est en français, le CV doit être en français.

TA MISSION :
- Réécrire le Titre du profil pour qu'il matche l'intitulé du poste (si cohérent).
- Réécrire le Résumé (Summary) pour mettre en avant l'adéquation candidat/poste.
- Réécrire chaque Expérience :
    - Transformer les listes de tâches en réalisations concrètes.
    - Intégrer les mots-clés de l'AO naturellement.
    - Mettre en avant les hard skills demandés.
- Lister les compétences techniques et soft skills pertinentes.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cvText, jobDescription } = body;

    if (!cvText || !jobDescription) {
      return NextResponse.json(
        { error: 'CV et description de poste requis' },
        { status: 400 }
      );
    }

    const userPrompt = `
CV ORIGINAL :
${cvText.substring(0, 10000)}

OFFRE D'EMPLOI (AO) :
${jobDescription.substring(0, 5000)}

Instructions :
Réécris ce CV pour qu'il soit le candidat idéal pour cette offre.
Reformule les expériences pour qu'elles soient percutantes.
Retourne le résultat au format JSON structuré.
`;

    // Use a custom system prompt if SYSTEM_PROMPTS.reviewer is generic analysis
    const actualMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ] as const;

    const result = await getValidatedJson<RewrittenCV>(
      actualMessages,
      RewrittenCVSchema,
      {
        temperature: 0.3, // Lower temperature for more focused rewriting
        model: 'gpt-4o', // Prefer strict model for writing tasks
      }
    );

    return NextResponse.json({
      success: true,
      rewritten: result,
    });
  } catch (error) {
    console.error('CV Rewrite API Error:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la réécriture du CV',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
