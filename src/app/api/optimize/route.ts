import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, type, jobDescription } = await request.json();

    // For demo purposes, we'll simulate AI optimization
    // In production, this would call OpenAI/Mistral API
    const optimizedContent = await optimizeWithAI(text, type, jobDescription);

    return NextResponse.json({
      optimizedContent,
      improvements: [
        "Ajout de verbes d'action plus percutants",
        'Quantification des résultats obtenus',
        "Adaptation au secteur d'activité ciblé",
        'Optimisation des mots-clés ATS',
      ],
      atsScoreImprovement: Math.floor(Math.random() * 15) + 5,
    });
  } catch (error) {
    console.error("Erreur d'optimisation IA:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'optimisation" },
      { status: 500 }
    );
  }
}

async function optimizeWithAI(
  text: string,
  type: string,
  _jobDescription?: string
): Promise<string> {
  // Simulation de l'optimisation IA
  // En production, on utiliserait l'API OpenAI ou Mistral

  const optimizations = {
    summary: [
      "Développeur Full Stack passionné et expérimenté avec 5+ années d'expertise en React, Node.js et Python. Spécialisé dans l'architecture microservices et le développement d'applications web haute performance, ayant dirigé avec succès des équipes techniques et livré des solutions scalables pour plus de 10,000 utilisateurs actifs.",
      "Expert technique Full Stack avec un track record prouvé de 5 ans dans le développement d'applications web modernes. Maîtrise avancée de React, Node.js et Python avec une expertise particulière en architecture microservices et optimisation des performances. Leader technique ayant encadré des équipes et délivré des solutions robustes utilisées par des milliers d'utilisateurs.",
    ],
    experience: [
      text
        .replace(/Développement/g, 'Conception et développement')
        .replace(/Optimisation/g, 'Optimisation stratégique')
        .replace(/Leadership/g, 'Leadership technique et encadrement')
        .replace(/Architecture/g, 'Architecture et implémentation'),
      text
        .replace(/•/g, '▪')
        .replace(/clients/g, 'clients actifs')
        .replace(/équipe/g, 'équipe pluridisciplinaire')
        .replace(/microservices/g, 'architecture microservices cloud-native'),
    ],
    skills: text,
    education: text
      .replace(/Projet de fin d'études/g, 'Projet de recherche appliquée')
      .replace(
        /machine learning/g,
        'intelligence artificielle et machine learning'
      ),
  };

  const typeOptimizations = optimizations[
    type as keyof typeof optimizations
  ] || [text];
  return Array.isArray(typeOptimizations)
    ? typeOptimizations[Math.floor(Math.random() * typeOptimizations.length)]
    : typeOptimizations;
}
