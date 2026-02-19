import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getValidatedJson } from '@/lib/ai/get-validated-json';
import { SYSTEM_PROMPTS } from '@/lib/ai/openai-client';

export interface AOAnalysisResult {
  summary: string;
  context: string;
  issues: Array<string>;
  requiredSkills: Array<{ skill: string; priority: 'high' | 'medium' | 'low' }>;
  preferredSkills: Array<{ skill: string; priority: 'medium' | 'low' }>;
  requiredProfiles: Array<{
    title: string;
    count: number;
    seniority: string;
    description: string;
  }>;
  risks: Array<{
    type: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
  }>;
  specificClauses: {
    penalties: string | null;
    onCall: string | null;
  };
  opportunities: Array<{ type: string; description: string }>;
  goNoGoScore: number;
  goNoGoReasons: Array<{ reason: string; impact: 'positive' | 'negative' }>;
  extractedBudget: number | null;
  budgetAnalysis: string;
  keyDates: Array<{ type: string; date: string; description: string }>;
  evaluationCriteria: Array<{ criterion: string; weight: number }>;
  evidence: Array<{ claim: string; sourceText: string; sourceType: 'ao' }>;
}

const AOAnalysisSchema = z.object({
  summary: z.string(),
  context: z.string(),
  issues: z.array(z.string()),
  requiredSkills: z.array(
    z.object({ skill: z.string(), priority: z.enum(['high', 'medium', 'low']) })
  ),
  preferredSkills: z.array(
    z.object({ skill: z.string(), priority: z.enum(['medium', 'low']) })
  ),
  requiredProfiles: z.array(
    z.object({
      title: z.string(),
      count: z.number(),
      seniority: z.string(),
      description: z.string(),
    })
  ),
  risks: z.array(
    z.object({
      type: z.string(),
      description: z.string(),
      severity: z.enum(['high', 'medium', 'low']),
    })
  ),
  specificClauses: z.object({
    penalties: z.string().nullable(),
    onCall: z.string().nullable(),
  }),
  opportunities: z.array(
    z.object({ type: z.string(), description: z.string() })
  ),
  goNoGoScore: z.number(),
  goNoGoReasons: z.array(
    z.object({ reason: z.string(), impact: z.enum(['positive', 'negative']) })
  ),
  extractedBudget: z.number().nullable(),
  budgetAnalysis: z.string(),
  keyDates: z.array(
    z.object({ type: z.string(), date: z.string(), description: z.string() })
  ),
  evaluationCriteria: z.array(
    z.object({ criterion: z.string(), weight: z.number() })
  ),
  evidence: z.array(
    z.object({
      claim: z.string(),
      sourceText: z.string(),
      sourceType: z.literal('ao'),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, fileName, dossierId } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Le contenu du document est requis' },
        { status: 400 }
      );
    }

    const userPrompt = `Analyse cet appel d'offres (AO) et extrais toutes les informations structurées demandées.
Agis comme un expert Bid Manager senior.

Document: ${fileName || 'AO'}
Contenu:
${content}

INSTRUCTIONS SPÉCIFIQUES:
1. **Synthèse Exécutive** ("summary"): Fournis un résumé professionnel et détaillé (150-200 mots) couvrant l'essentiel du besoin.
2. **Contexte** ("context"): Décris le contexte du client et du projet (secteur, historique, motivation).
3. **Enjeux** ("issues"): Liste les enjeux business et techniques majeurs du projet.
4. **Risques Cachés** ("specificClauses"):
   - Recherche EXPLICITEMENT les clauses de pénalités (retard, SLA) -> champ "penalties".
   - Recherche EXPLICITEMENT les obligations d'astreinte ou d'intervention HNO -> champ "onCall".
   - Si absent, mets null.
5. **Risques Généraux** ("risks"): Analyse les risques juridiques, financiers, techniques et organisationnels.

Réponds en JSON avec la structure suivante:
{
  "summary": "Synthèse exécutive détaillée...",
  "context": "Contexte du projet...",
  "issues": ["Enjeu 1", "Enjeu 2"...],
  "requiredSkills": [{"skill": "nom", "priority": "high|medium|low"}],
  "preferredSkills": [{"skill": "nom", "priority": "medium|low"}],
  "requiredProfiles": [{"title": "titre", "count": 1, "seniority": "Junior|Confirmé|Senior|Expert", "description": "description"}],
  "risks": [{"type": "Juridique|Technique|Financier|Organisationnel", "description": "description", "severity": "high|medium|low"}],
  "specificClauses": {
    "penalties": "Description des pénalités ou null",
    "onCall": "Description des astreintes ou null"
  },
  "opportunities": [{"type": "type", "description": "description"}],
  "goNoGoScore": 0-100,
  "goNoGoReasons": [{"reason": "raison", "impact": "positive|negative"}],
  "extractedBudget": null ou montant en euros,
  "budgetAnalysis": "analyse du budget",
  "keyDates": [{"type": "deadline|start|other", "date": "YYYY-MM-DD", "description": "description"}],
  "evaluationCriteria": [{"criterion": "critère", "weight": 0-100}],
  "evidence": [{"claim": "fait", "sourceText": "extrait exact", "sourceType": "ao"}]
}`;

    const baseMessages = [
      { role: 'system', content: SYSTEM_PROMPTS.aoReader },
      { role: 'user', content: userPrompt },
    ] as const;

    const analysis = await getValidatedJson<AOAnalysisResult>(
      baseMessages,
      AOAnalysisSchema
    );

    return NextResponse.json({
      success: true,
      analysis,
      dossierId,
    });
  } catch (error) {
    console.error('AO Reader API Error:', error);
    return NextResponse.json(
      {
        error: "Erreur lors de l'analyse de l'AO",
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
