import { NextRequest, NextResponse } from 'next/server';

import { extractFrenchContextualKeywords } from '@/lib/ai/mistral-client';

// Configuration simplifiée du matching authentique
const config = {
  weights: {
    tech: {
      technical: 0.4,
      experience: 0.2,
      education: 0.1,
      softSkills: 0.15,
      cultural: 0.1,
      authenticity: 0.05,
    },
    default: {
      technical: 0.3,
      experience: 0.25,
      education: 0.15,
      softSkills: 0.15,
      cultural: 0.1,
      authenticity: 0.05,
    },
  },
  thresholds: {
    overOptimization: 0.2,
    genericPhrases: 2,
  },
  frenchContext: {
    diplomaEquivalences: true,
    culturalMatching: true,
    regionalPreferences: true,
    languageLevels: true,
  },
};

// Fonction de matching simplifiée
async function performSimpleMatching(cvText: string, jobText: string) {
  try {
    // 1. Extraction des données contextuelles
    const [cvData, jobData] = await Promise.all([
      extractFrenchContextualKeywords(cvText, 'cv'),
      extractFrenchContextualKeywords(jobText, 'job'),
    ]);

    // 2. Calcul du score de matching simplifié
    let technicalScore = 0;
    let experienceScore = 0;
    let educationScore = 0;
    let softSkillsScore = 0;
    let culturalScore = 0;

    // Matching des compétences techniques
    const cvSkills = cvData.hardSkills?.map((s) => s.name.toLowerCase()) || [];
    const jobSkills =
      jobData.hardSkills?.map((s) => s.name.toLowerCase()) || [];
    const matchedSkills = cvSkills.filter((skill) =>
      jobSkills.some(
        (jobSkill) => jobSkill.includes(skill) || skill.includes(jobSkill)
      )
    );
    technicalScore =
      jobSkills.length > 0 ? matchedSkills.length / jobSkills.length : 0;

    // Matching de l'expérience
    const cvExperience = cvData.experience?.totalYears || 0;
    const jobExperience = jobData.experience?.totalYears || 0;
    experienceScore =
      jobExperience > 0 ? Math.min(cvExperience / jobExperience, 1) : 0.5;

    // Matching de l'éducation
    const cvEducation = cvData.education?.level || '';
    const jobEducation = jobData.education?.level || '';
    educationScore =
      cvEducation && jobEducation
        ? cvEducation.toLowerCase().includes(jobEducation.toLowerCase())
          ? 1
          : 0.5
        : 0.5;

    // Matching des soft skills
    const cvSoftSkills =
      cvData.softSkills?.map((s) =>
        typeof s === 'string' ? s.toLowerCase() : s.name?.toLowerCase()
      ) || [];
    const jobSoftSkills =
      jobData.softSkills?.map((s) =>
        typeof s === 'string' ? s.toLowerCase() : s.name?.toLowerCase()
      ) || [];
    const matchedSoftSkills = cvSoftSkills.filter((skill) =>
      jobSoftSkills.some(
        (jobSkill) => jobSkill.includes(skill) || skill.includes(jobSkill)
      )
    );
    softSkillsScore =
      jobSoftSkills.length > 0
        ? matchedSoftSkills.length / jobSoftSkills.length
        : 0.5;

    // Matching culturel
    const cvCulture = cvData.culture?.values || [];
    const jobCulture = jobData.culture?.values || [];
    const matchedCulture = cvCulture.filter((value) =>
      jobCulture.some(
        (jobValue) =>
          jobValue.toLowerCase().includes(value.toLowerCase()) ||
          value.toLowerCase().includes(jobValue.toLowerCase())
      )
    );
    culturalScore =
      jobCulture.length > 0 ? matchedCulture.length / jobCulture.length : 0.5;

    // Calcul du score global
    const weights = config.weights.default;
    const overallScore =
      technicalScore * weights.technical +
      experienceScore * weights.experience +
      educationScore * weights.education +
      softSkillsScore * weights.softSkills +
      culturalScore * weights.cultural;

    // Détermination du niveau de match
    let matchLevel = 'Faible';
    if (overallScore >= 0.8) matchLevel = 'Excellent';
    else if (overallScore >= 0.6) matchLevel = 'Bon';
    else if (overallScore >= 0.4) matchLevel = 'Moyen';

    // Génération des points forts et améliorations
    const strengths = [];
    const improvements = [];

    if (technicalScore >= 0.7) {
      strengths.push(
        `Compétences techniques bien alignées (${(technicalScore * 100).toFixed(
          0
        )}% de correspondance)`
      );
    } else {
      improvements.push(`Améliorer les compétences techniques manquantes`);
    }

    if (experienceScore >= 0.8) {
      strengths.push(`Expérience professionnelle adéquate`);
    } else if (experienceScore < 0.5) {
      improvements.push(
        `Mettre en avant des projets personnels ou formations pour compenser l'expérience`
      );
    }

    if (educationScore >= 0.8) {
      strengths.push(`Formation adaptée au poste`);
    } else {
      improvements.push(
        `Mettre en avant des formations complémentaires ou certifications`
      );
    }

    if (softSkillsScore >= 0.6) {
      strengths.push(`Soft skills pertinentes identifiées`);
    } else {
      improvements.push(
        `Développer et mettre en avant les soft skills demandées`
      );
    }

    if (culturalScore >= 0.6) {
      strengths.push(`Alignement culturel avec l'entreprise`);
    } else {
      improvements.push(`Adapter le CV à la culture d'entreprise`);
    }

    // Prochaines étapes
    const nextSteps = [
      "Optimiser le CV avec les mots-clés de l'offre",
      'Quantifier les réalisations passées',
      "Adapter le profil professionnel à l'offre",
      'Mettre en avant les compétences les plus pertinentes',
    ];

    return {
      overallScore,
      matchLevel,
      strengths,
      improvements,
      nextSteps,
      breakdown: {
        technical: technicalScore,
        experience: experienceScore,
        education: educationScore,
        softSkills: softSkillsScore,
        cultural: culturalScore,
      },
      authenticity: {
        globalScore: 0.8, // Score d'authenticité simulé
        issues: [],
        recommendations: ['Maintenir un ton professionnel et authentique'],
      },
    };
  } catch (error) {
    console.error('Erreur lors du matching:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { cvText, jobText } = await request.json();

    // Validation des données d'entrée
    if (!cvText || !jobText) {
      return NextResponse.json(
        {
          success: false,
          error: "Les textes CV et offre d'emploi sont requis",
        },
        { status: 400 }
      );
    }

    if (cvText.length < 50 || jobText.length < 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'Les textes doivent contenir au moins 50 caractères',
        },
        { status: 400 }
      );
    }

    console.log("🚀 Début de l'analyse authentique...");

    // Effectuer l'analyse
    const result = await performSimpleMatching(cvText, jobText);

    console.log('✅ Analyse authentique terminée avec succès');

    return NextResponse.json({
      success: true,
      data: {
        summary: result,
        score: result,
        authenticity: result.authenticity,
        suggestions: result.nextSteps.map((step) => ({
          type: 'improvement',
          content: step,
          priority: 'medium',
        })),
      },
      cached: false,
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'analyse authentique:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de l'analyse de matching",
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Endpoint pour vérifier la santé de l'API
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
}
