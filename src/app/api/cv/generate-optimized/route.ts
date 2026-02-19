/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

import { CVData, JobData } from '@/types/cv-matcher';

interface OptimizedCVData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
    website?: string;
    summary: string;
  };
  experiences: Array<{
    id: string;
    title: string;
    company: string;
    startDate: string;
    endDate: string | 'Present';
    description: string;
  }>;
  education: Array<{
    id: string;
    degree: string;
    school: string;
    startDate: string;
    endDate: string;
    description?: string;
  }>;
  skills: Array<{
    id: string;
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    type: 'technical' | 'soft' | 'language';
  }>;
  projects?: Array<{
    id: string;
    name: string;
    technologies: string;
    startDate: string;
    endDate: string;
    url?: string;
    description: string;
  }>;
  certifications?: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
  languages?: Array<{
    id: string;
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'native';
  }>;
  interests?: Array<{
    id: string;
    name: string;
    category: 'hobby' | 'sport' | 'art' | 'technology' | 'volunteer' | 'other';
    description?: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const { cvData, jobData }: { cvData: CVData; jobData: JobData } =
      await request.json();

    if (!cvData || !jobData) {
      return NextResponse.json(
        { success: false, message: 'CV et job data requis' },
        { status: 400 }
      );
    }

    // Générer le CV optimisé basé sur l'analyse
    const optimizedCV = await generateOptimizedCV(cvData, jobData);

    return NextResponse.json({
      success: true,
      data: optimizedCV,
    });
  } catch (error) {
    console.error('Erreur génération CV optimisé:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

async function generateOptimizedCV(
  cvData: CVData,
  jobData: JobData
): Promise<OptimizedCVData> {
  // Extraire les compétences clés de l'offre d'emploi
  const jobKeywords = extractJobKeywords(jobData.description);
  const _cvKeywords = extractCVKeywords(cvData.raw_text);

  // Optimiser le résumé professionnel
  const optimizedSummary = optimizeSummary(cvData, jobData, jobKeywords);

  // Optimiser les expériences
  const optimizedExperiences = optimizeExperiences(
    cvData.content.experiences,
    jobData,
    jobKeywords
  );

  // Optimiser et prioriser les compétences
  const optimizedSkills = optimizeSkills(
    cvData.content.skills,
    jobData,
    jobKeywords
  );

  // Construire le CV optimisé
  const personalInfo = cvData.content.personalInfo;
  const locationStr =
    typeof personalInfo.location === 'object' && personalInfo.location
      ? `${(personalInfo.location as any).city || ''}, ${
          (personalInfo.location as any).country || ''
        }`.replace(/^, |, $/g, '')
      : (personalInfo.location as string);

  const optimizedCV: OptimizedCVData = {
    personalInfo: {
      firstName: personalInfo.firstName || '',
      lastName: personalInfo.lastName || '',
      email: personalInfo.email || '',
      phone: personalInfo.phone,
      location: locationStr,
      website: (personalInfo as any).website,
      summary: optimizedSummary,
    },
    experiences: optimizedExperiences,
    education: cvData.content.education.map((edu, index) => ({
      id: `edu_${index}`,
      degree: edu.degree,
      school: edu.school,
      startDate: edu.startDate,
      endDate: edu.endDate,
      description: edu.description,
    })),
    skills: optimizedSkills,
    projects: (cvData.content as any).projects?.map(
      (project: any, index: number) => ({
        id: `project_${index}`,
        name: project.name,
        technologies: project.technologies,
        startDate: project.startDate,
        endDate: project.endDate,
        url: project.url,
        description: optimizeProjectDescription(
          project.description,
          jobKeywords
        ),
      })
    ),
    certifications: (cvData.content as any).certifications?.map(
      (cert: any, index: number) => ({
        id: `cert_${index}`,
        name: cert.name,
        issuer: cert.issuer,
        date: cert.date,
        url: cert.url,
      })
    ),
    languages: (cvData.content as any).languages?.map(
      (lang: any, index: number) => ({
        id: `lang_${index}`,
        name: lang.name,
        level: lang.level as
          | 'beginner'
          | 'intermediate'
          | 'advanced'
          | 'native',
      })
    ),
    interests: (cvData.content as any).interests?.map(
      (interest: any, index: number) => ({
        id: `interest_${index}`,
        name: interest.name,
        category: interest.category as
          | 'hobby'
          | 'sport'
          | 'art'
          | 'technology'
          | 'volunteer'
          | 'other',
        description: interest.description,
      })
    ),
  };

  return optimizedCV;
}

function extractJobKeywords(jobDescription: string): string[] {
  const text = jobDescription.toLowerCase();

  // Mots-clés techniques et compétences communes
  const technicalKeywords = [
    'javascript',
    'python',
    'react',
    'node.js',
    'sql',
    'git',
    'docker',
    'aws',
    'typescript',
    'mongodb',
    'postgresql',
    'graphql',
    'redis',
    'kubernetes',
    'java',
    'c++',
    'angular',
    'vue.js',
    'express.js',
    'django',
    'flask',
    'project management',
    'data analysis',
    'excel',
    'powerpoint',
    'salesforce',
    'crm',
    'erp',
    'sap',
    'tableau',
    'agile',
    'scrum',
    'ci/cd',
    'devops',
  ];

  // Compétences comportementales
  const softSkills = [
    'communication',
    'leadership',
    'teamwork',
    'problem solving',
    'creativity',
    'adaptability',
    'time management',
    'critical thinking',
    'collaboration',
    'analytical skills',
    'attention to detail',
    'customer service',
    'negotiation',
    'presentation skills',
    'interpersonal skills',
  ];

  const allKeywords = [...technicalKeywords, ...softSkills];
  const foundKeywords = allKeywords.filter((keyword) => text.includes(keyword));

  return foundKeywords;
}

function extractCVKeywords(cvText: string): string[] {
  const words = cvText
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 3)
    .filter(
      (word) =>
        ![
          'avec',
          'dans',
          'pour',
          'sur',
          'par',
          'de',
          'du',
          'des',
          'le',
          'la',
          'les',
          'un',
          'une',
          'et',
          'ou',
          'mais',
          'donc',
          'car',
          'comme',
          'si',
          'que',
          'qui',
          'quoi',
          'dont',
          'où',
        ].includes(word)
    );

  return [...new Set(words)];
}

function optimizeSummary(
  cvData: CVData,
  jobData: JobData,
  jobKeywords: string[]
): string {
  const originalSummary = cvData.content.summary || '';
  const _jobTitle = jobData.title;
  const _company = jobData.company;

  // Identifier les compétences clés manquantes dans le résumé
  const summaryLower = originalSummary.toLowerCase();
  const missingKeywords = jobKeywords.filter(
    (keyword) => !summaryLower.includes(keyword)
  );

  // Créer un résumé optimisé
  let optimizedSummary = originalSummary;

  if (!optimizedSummary || optimizedSummary.length < 100) {
    // Créer un résumé basique s'il n'existe pas
    const experience = cvData.content.experiences[0];
    const skills = cvData.content.skills
      .slice(0, 3)
      .map((s) => s.name)
      .join(', ');

    optimizedSummary = `Professionnel expérimenté spécialisé en ${skills}. `;

    if (experience) {
      optimizedSummary += `Fort d'une expérience en tant que ${experience.title}, `;
    }

    optimizedSummary += `je possède une expertise solide dans ${missingKeywords
      .slice(0, 3)
      .join(', ')}. `;
    optimizedSummary += `Passionné par l'innovation et orienté résultats, je recherche à contribuer à la réussite d'une équipe dynamique.`;
  }

  // Intégrer les mots-clés manquants de manière naturelle
  if (missingKeywords.length > 0) {
    const keywordsToAdd = missingKeywords.slice(0, 2);
    optimizedSummary += ` Compétences additionnelles en ${keywordsToAdd.join(
      ' et '
    )}.`;
  }

  return optimizedSummary;
}

function optimizeExperiences(
  experiences: any[],
  jobData: JobData,
  jobKeywords: string[]
): Array<{
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string | 'Present';
  description: string;
}> {
  return experiences.map((exp, index) => {
    const optimizedDescription = optimizeExperienceDescription(
      exp.description,
      jobKeywords,
      jobData
    );

    return {
      id: `exp_${index}`,
      title: exp.title,
      company: exp.company,
      startDate: exp.startDate,
      endDate: exp.endDate,
      description: optimizedDescription,
    };
  });
}

function optimizeExperienceDescription(
  description: string,
  jobKeywords: string[],
  _jobData: JobData
): string {
  if (!description) return '';

  let optimizedDescription = description;

  // Remplacer les phrases passives par des verbes d'action
  const _actionVerbs = [
    'Développé',
    'Implémenté',
    'Géré',
    'Dirigé',
    'Créé',
    'Optimisé',
    'Amélioré',
    'Conçu',
    'Établi',
    'Coordonné',
    'Supervisé',
    'Réalisé',
    'Livré',
    'Augmenté',
  ];

  // Remplacer "Responsable de" par des verbes d'action
  optimizedDescription = optimizedDescription.replace(
    /responsable de/gi,
    'Géré'
  );
  optimizedDescription = optimizedDescription.replace(
    /en charge de/gi,
    'Dirigé'
  );

  // Ajouter des mots-clés pertinents s'ils ne sont pas présents
  const descriptionLower = optimizedDescription.toLowerCase();
  const missingKeywords = jobKeywords
    .filter(
      (keyword) => !descriptionLower.includes(keyword) && keyword.length > 3
    )
    .slice(0, 2);

  if (missingKeywords.length > 0) {
    optimizedDescription += ` Utilisation de ${missingKeywords.join(' et ')}.`;
  }

  return optimizedDescription;
}

function optimizeSkills(
  skills: any[],
  jobData: JobData,
  jobKeywords: string[]
): Array<{
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  type: 'technical' | 'soft' | 'language';
}> {
  const existingSkills = skills.map((skill) => ({
    id: `skill_${skill.name.replace(/\s+/g, '_').toLowerCase()}`,
    name: skill.name,
    level: skill.level as 'beginner' | 'intermediate' | 'advanced' | 'expert',
    type: skill.type as 'technical' | 'soft' | 'language',
  }));

  // Ajouter les compétences manquantes importantes de l'offre d'emploi
  const existingSkillNames = existingSkills.map((s) => s.name.toLowerCase());
  const missingJobSkills = jobKeywords
    .filter(
      (keyword) =>
        !existingSkillNames.some(
          (existing) => existing.includes(keyword) || keyword.includes(existing)
        )
    )
    .slice(0, 3); // Limiter à 3 compétences supplémentaires

  const additionalSkills = missingJobSkills.map((skill) => ({
    id: `skill_${skill.replace(/\s+/g, '_').toLowerCase()}`,
    name: skill.charAt(0).toUpperCase() + skill.slice(1),
    level: 'intermediate' as const,
    type: determinSkillType(skill),
  }));

  // Trier les compétences: d'abord celles de l'offre d'emploi, puis les autres
  const prioritizedSkills = [...existingSkills, ...additionalSkills].sort(
    (a, b) => {
      const aIsJobSkill = jobKeywords.some(
        (keyword) =>
          a.name.toLowerCase().includes(keyword) ||
          keyword.includes(a.name.toLowerCase())
      );
      const bIsJobSkill = jobKeywords.some(
        (keyword) =>
          b.name.toLowerCase().includes(keyword) ||
          keyword.includes(b.name.toLowerCase())
      );

      if (aIsJobSkill && !bIsJobSkill) return -1;
      if (!aIsJobSkill && bIsJobSkill) return 1;
      return 0;
    }
  );

  return prioritizedSkills;
}

function determinSkillType(skill: string): 'technical' | 'soft' | 'language' {
  const technicalKeywords = [
    'javascript',
    'python',
    'react',
    'node',
    'sql',
    'git',
    'docker',
    'aws',
    'typescript',
    'mongodb',
    'postgresql',
    'graphql',
    'redis',
    'kubernetes',
    'java',
    'angular',
    'vue',
    'express',
    'django',
    'flask',
    'data',
    'analysis',
  ];

  const softKeywords = [
    'communication',
    'leadership',
    'teamwork',
    'problem',
    'creativity',
    'adaptability',
    'time management',
    'critical thinking',
    'collaboration',
    'analytical',
    'attention',
    'customer',
    'negotiation',
    'presentation',
  ];

  const skillLower = skill.toLowerCase();

  if (technicalKeywords.some((keyword) => skillLower.includes(keyword))) {
    return 'technical';
  }

  if (softKeywords.some((keyword) => skillLower.includes(keyword))) {
    return 'soft';
  }

  return 'technical'; // Par défaut
}

function optimizeProjectDescription(
  description: string,
  jobKeywords: string[]
): string {
  if (!description) return '';

  let optimizedDescription = description;

  // Ajouter des mots-clés pertinents
  const descriptionLower = optimizedDescription.toLowerCase();
  const missingKeywords = jobKeywords
    .filter(
      (keyword) => !descriptionLower.includes(keyword) && keyword.length > 3
    )
    .slice(0, 1);

  if (missingKeywords.length > 0) {
    optimizedDescription += ` Technologies: ${missingKeywords.join(', ')}.`;
  }

  return optimizedDescription;
}
