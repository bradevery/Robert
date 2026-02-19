/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

interface ATSCriteria {
  label: string;
  weight: number;
  score: number;
  status: 'passed' | 'warning' | 'failed';
  suggestions?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { cvData, jobDescription } = await request.json();

    const analysis = await analyzeATS(cvData, jobDescription);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Erreur d'analyse ATS:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'analyse ATS" },
      { status: 500 }
    );
  }
}

async function analyzeATS(
  cvData: any,
  jobDescription?: string
): Promise<{
  overallScore: number;
  criteria: ATSCriteria[];
  recommendations: string[];
  compatibleSystems: string[];
}> {
  // Critères d'évaluation ATS
  const criteria: ATSCriteria[] = [
    {
      label: 'Structure ATS compatible',
      weight: 25,
      score: checkStructure(cvData),
      status: checkStructure(cvData) >= 20 ? 'passed' : 'warning',
      suggestions: [
        'Utiliser des titres de section standards',
        'Éviter les tableaux complexes',
        'Structurer clairement les dates',
      ],
    },
    {
      label: 'Mots-clés optimisés',
      weight: 30,
      score: checkKeywords(cvData, jobDescription),
      status:
        checkKeywords(cvData, jobDescription) >= 25 ? 'passed' : 'warning',
      suggestions: [
        'Ajouter plus de mots-clés techniques',
        "Inclure des termes du secteur d'activité",
        'Varier les synonymes des compétences',
      ],
    },
    {
      label: 'Format de dates cohérent',
      weight: 15,
      score: checkDateFormat(cvData),
      status: checkDateFormat(cvData) >= 12 ? 'passed' : 'failed',
      suggestions: [
        'Utiliser le format MM/AAAA',
        'Être cohérent dans tout le CV',
        'Éviter les dates relatives',
      ],
    },
    {
      label: 'Sections recommandées',
      weight: 20,
      score: checkSections(cvData),
      status: checkSections(cvData) >= 15 ? 'passed' : 'warning',
      suggestions: [
        'Ajouter une section Compétences',
        'Inclure la formation',
        'Mentionner les langues parlées',
      ],
    },
    {
      label: 'Longueur appropriée',
      weight: 10,
      score: checkLength(cvData),
      status: checkLength(cvData) >= 8 ? 'passed' : 'warning',
      suggestions: [
        'Maintenir 1-2 pages maximum',
        'Synthétiser les expériences anciennes',
        'Privilégier la qualité à la quantité',
      ],
    },
  ];

  const overallScore = criteria.reduce(
    (sum, criterion) => sum + criterion.score,
    0
  );

  const recommendations = [
    'Intégrer plus de mots-clés du secteur technologique',
    'Quantifier davantage vos réalisations avec des chiffres',
    "Adapter le vocabulaire selon l'offre d'emploi ciblée",
    'Optimiser la densité des mots-clés sans sur-optimisation',
  ];

  const compatibleSystems = [
    'Workday ATS',
    'Greenhouse',
    'BambooHR',
    'SmartRecruiters',
    'Taleo Oracle',
    'iCIMS',
  ];

  return {
    overallScore,
    criteria,
    recommendations,
    compatibleSystems,
  };
}

function checkStructure(cvData: any): number {
  // Simulation de vérification de structure
  let score = 0;

  if (cvData?.personal) score += 5;
  if (cvData?.experience) score += 8;
  if (cvData?.education) score += 4;
  if (cvData?.skills) score += 5;
  if (cvData?.languages) score += 3;

  return Math.min(score, 25);
}

function checkKeywords(cvData: any, _jobDescription?: string): number {
  // Simulation de vérification des mots-clés
  const techKeywords = [
    'React',
    'Node.js',
    'Python',
    'JavaScript',
    'TypeScript',
    'Docker',
    'Kubernetes',
    'PostgreSQL',
    'MongoDB',
    'AWS',
  ];

  const cvText = JSON.stringify(cvData).toLowerCase();
  const keywordCount = techKeywords.filter((keyword) =>
    cvText.includes(keyword.toLowerCase())
  ).length;

  return Math.min((keywordCount / techKeywords.length) * 30, 30);
}

function checkDateFormat(_cvData: any): number {
  // Simulation de vérification du format des dates
  return 15; // Assumons que le format est correct
}

function checkSections(cvData: any): number {
  // Vérification des sections obligatoires
  let score = 0;
  const requiredSections = ['personal', 'experience', 'education', 'skills'];

  requiredSections.forEach((section) => {
    if (cvData?.[section]) score += 5;
  });

  return Math.min(score, 20);
}

function checkLength(cvData: any): number {
  // Simulation de vérification de longueur
  const contentLength = JSON.stringify(cvData).length;

  if (contentLength > 1000 && contentLength < 5000) return 10;
  if (contentLength > 500 && contentLength < 6000) return 8;
  return 5;
}
