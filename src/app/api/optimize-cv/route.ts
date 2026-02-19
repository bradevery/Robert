/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

// Fonction d'optimisation simplifiée sans IA pour l'instant
function optimizeCVSimple(
  cvText: string,
  jobText: string,
  matchResult: any
): string {
  // Extraction des mots-clés de l'offre d'emploi
  const jobKeywords = jobText
    .toLowerCase()
    .split(/[\s,;.!?]+/)
    .filter((word) => word.length > 3)
    .filter(
      (word) =>
        ![
          'nous',
          'recherchons',
          'avec',
          'pour',
          'dans',
          'une',
          'des',
          'les',
          'du',
          'de',
          'la',
          'le',
        ].includes(word)
    );

  // Optimisation basique du CV
  let optimizedCv = cvText;

  // Ajouter des mots-clés manquants si nécessaire
  const cvLower = cvText.toLowerCase();
  const missingKeywords = jobKeywords.filter(
    (keyword) => !cvLower.includes(keyword)
  );

  if (missingKeywords.length > 0 && matchResult.improvements) {
    optimizedCv += '\n\n--- OPTIMISATIONS SUGGÉRÉES ---\n';
    optimizedCv += `Mots-clés à intégrer: ${missingKeywords
      .slice(0, 5)
      .join(', ')}\n`;

    if (matchResult.improvements.length > 0) {
      optimizedCv += '\nAméliorations recommandées:\n';
      matchResult.improvements.forEach((improvement: string, index: number) => {
        optimizedCv += `${index + 1}. ${improvement}\n`;
      });
    }
  }

  // Ajouter un en-tête d'optimisation
  const header = `CV OPTIMISÉ POUR L'OFFRE D'EMPLOI
Score de matching: ${
    matchResult.overallScore
      ? (matchResult.overallScore * 100).toFixed(1) + '%'
      : 'Non calculé'
  }
Niveau: ${matchResult.matchLevel || 'Non déterminé'}

`;

  return header + optimizedCv;
}

export async function POST(request: NextRequest) {
  try {
    const { cvText, jobText, matchResult } = await request.json();

    if (!cvText || !jobText || !matchResult) {
      return NextResponse.json(
        { success: false, error: 'Missing cvText, jobText, or matchResult' },
        { status: 400 }
      );
    }

    console.log("🚀 Début de l'optimisation du CV...");

    // Pour l'instant, utilisons l'optimisation simplifiée
    // TODO: Intégrer Mistral AI quand les dépendances seront résolues
    const optimizedCv = optimizeCVSimple(cvText, jobText, matchResult);

    console.log('✅ Optimisation du CV terminée avec succès');

    return NextResponse.json({
      success: true,
      data: { optimizedCv },
    });
  } catch (error) {
    console.error('Erreur optimisation CV:', error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de l'optimisation du CV",
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
