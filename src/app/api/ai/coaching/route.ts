import { NextRequest, NextResponse } from 'next/server';

import { createChatCompletion } from '@/lib/ai/openai-client';
import { getAuthScope } from '@/lib/auth-scope';

export async function POST(request: NextRequest) {
  try {
    const scope = await getAuthScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ficheMission, cvCandidat, propaleContext } = await request.json();

    if (!ficheMission || !cvCandidat) {
      return NextResponse.json(
        { error: 'ficheMission et cvCandidat sont requis' },
        { status: 400 }
      );
    }

    const systemPrompt = `Tu es Robert Coaching, assistant spécialisé dans la préparation des candidats aux soutenances client pour les ESN et cabinets de conseil.

RÈGLES ABSOLUES :
- Ne génère AUCUNE information absente des données fournies (zéro hallucination)
- Base tes conseils UNIQUEMENT sur la fiche mission et le CV du candidat
- Réponds UNIQUEMENT en JSON valide

Tu dois générer un kit de coaching complet pour préparer le candidat à la soutenance client.`;

    const userPrompt = `=== FICHE MISSION ===
${
  typeof ficheMission === 'string'
    ? ficheMission
    : JSON.stringify(ficheMission, null, 2)
}

=== PROFIL CANDIDAT (CV) ===
${
  typeof cvCandidat === 'string'
    ? cvCandidat
    : JSON.stringify(cvCandidat, null, 2)
}

${
  propaleContext
    ? `=== CONTEXTE PROPALE ===\n${
        typeof propaleContext === 'string'
          ? propaleContext
          : JSON.stringify(propaleContext, null, 2)
      }`
    : ''
}

Génère un kit coaching complet en JSON avec cette structure exacte :
{
  "briefing": "Briefing mission complet et détaillé pour le candidat (contexte, enjeux, attentes client, culture, points d'attention)",
  "qa": [
    {
      "question": "Question probable du client",
      "answer": "Réponse type recommandée basée sur le profil du candidat",
      "category": "technique|fonctionnel|comportemental|motivation"
    }
  ],
  "fiche2min": "Texte de la fiche '2 minutes pour convaincre' - pitch structuré que le candidat peut utiliser pour se présenter en début de soutenance",
  "pointsForts": ["Point fort 1 du candidat par rapport à la mission", "..."],
  "risques": ["Risque/point faible à maîtriser 1", "..."],
  "conseilsPresentation": ["Conseil 1 pour la présentation", "..."]
}

IMPORTANT :
- Minimum 10 questions/réponses dans le Q&A
- Les réponses doivent être personnalisées au profil du candidat
- La fiche 2min doit être prête à l'emploi (le candidat peut la lire telle quelle)
- Les points forts doivent être factuels et vérifiables dans le CV`;

    const content = await createChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        model: 'gpt-4o-mini',
        temperature: 0.6,
        maxTokens: 4000,
        responseFormat: 'json',
      }
    );

    if (!content) {
      throw new Error('No response from AI');
    }

    const coachingKit = JSON.parse(content);
    return NextResponse.json({ coachingKit });
  } catch (error) {
    console.error('Error generating coaching kit:', error);
    return NextResponse.json(
      { error: 'Failed to generate coaching kit' },
      { status: 500 }
    );
  }
}
