/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { CVData } from '@/types/cv-matcher';

/**
 * API endpoint to parse LinkedIn profile using Lixit
 * Accepts LinkedIn profile URL and returns structured CV data
 */
export async function POST(request: NextRequest) {
  try {
    const { linkedinUrl } = await request.json();

    // Validation de l'URL LinkedIn
    const linkedinProfilLinkRegex =
      /^(https?:\/\/)?((www|[a-z]{2,3})\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?$/;

    if (!linkedinUrl || !linkedinProfilLinkRegex.test(linkedinUrl)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Veuillez entrer une URL LinkedIn valide',
        },
        { status: 400 }
      );
    }

    // Appel à l'API Lixit
    const lixitResponse = await fetch(
      `https://api.lix-it.com/v1/person?profile_link=${linkedinUrl}`,
      {
        method: 'GET',
        headers: {
          Authorization:
            process.env.LIXIT_API_KEY ||
            'DVXjF1Vmpnil9Qca9q5pOaDKqruXcz0HhYFif4Qr5xYhcaaLksXzA0HmUwdm',
        },
      }
    );

    if (!lixitResponse.ok) {
      throw new Error(`Erreur Lixit: ${lixitResponse.status}`);
    }

    const lixitData = await lixitResponse.json();

    if (!lixitData || !lixitData.data) {
      throw new Error('Aucune donnée récupérée depuis LinkedIn');
    }

    // Transformation des données Lixit vers notre format CVData
    const profileData = lixitData.data;

    // Extraction du nom d'utilisateur LinkedIn pour l'ID
    const usernameMatch = linkedinUrl.match(/\/in\/([A-Za-z0-9_-]+)/);
    const _username = usernameMatch ? usernameMatch[1] : 'linkedin-profile';

    const cvData: CVData = {
      id: uuidv4(),
      name: `${profileData.firstName} ${profileData.lastName} - LinkedIn Profile`,
      source: 'linkedin',
      content: {
        personalInfo: {
          fullName: `${profileData.firstName || ''} ${
            profileData.lastName || ''
          }`.trim(),
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          email: profileData.email || undefined,
          phone: profileData.phone || undefined,
          location: profileData.location
            ? {
                city: extractCityFromLocation(profileData.location),
                state: extractStateFromLocation(profileData.location),
                country: extractCountryFromLocation(profileData.location),
              }
            : undefined,
          urls: [
            {
              type: 'linkedin',
              url: linkedinUrl,
            },
          ],
        },
        experiences:
          profileData.experiences?.map((exp: any) => ({
            title: exp.title || '',
            company: exp.company || '',
            location: exp.location || '',
            startDate: formatDate(exp.startDate),
            endDate: formatDate(exp.endDate) || 'Present',
            description: exp.description || '',
            skills: extractSkillsFromDescription(exp.description || ''),
            achievements: extractAchievementsFromDescription(
              exp.description || ''
            ),
          })) || [],
        education:
          profileData.education?.map((edu: any) => ({
            degree: edu.degree || '',
            school: edu.school || '',
            fieldOfStudy: edu.fieldOfStudy || '',
            location: edu.location || '',
            startDate: formatDate(edu.startDate),
            endDate: formatDate(edu.endDate),
            grade: edu.grade || '',
            description: edu.description || '',
          })) || [],
        skills:
          profileData.skills?.map((skill: string) => ({
            name: skill,
            type: categorizeSkill(skill),
            category: categorizeSkill(skill),
          })) || [],
        summary: profileData.headline
          ? `${profileData.headline}\n\n${profileData.summary || ''}`.trim()
          : profileData.summary || '',
        extractedKeywords: [
          ...extractKeywordsFromProfile(profileData),
          ...(profileData.skills || []),
        ],
      },
      raw_text: generateRawTextFromProfile(profileData),
      processed_at: new Date().toISOString(),
    };

    // Dédoublonnage des mots-clés
    cvData.content.extractedKeywords = cvData.content.extractedKeywords.filter(
      (keyword, index, self) => self.indexOf(keyword) === index
    );

    return NextResponse.json({
      success: true,
      message: 'Profil LinkedIn analysé avec succès',
      data: cvData,
    });
  } catch (error) {
    console.error('Erreur parsing LinkedIn:', error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de l'analyse du profil LinkedIn",
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

/**
 * Fonctions utilitaires pour traiter les données LinkedIn
 */

function extractCityFromLocation(location: string): string {
  // Extrait la ville de la localisation (généralement avant la première virgule)
  return location.split(',')[0]?.trim() || '';
}

function extractStateFromLocation(location: string): string {
  const parts = location.split(',');
  return parts[1]?.trim() || '';
}

function extractCountryFromLocation(location: string): string {
  const parts = location.split(',');
  return parts[parts.length - 1]?.trim() || '';
}

function formatDate(dateString: string): string {
  if (!dateString) return '';

  // Tente de convertir différents formats de date en YYYY-MM-DD
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Retourne la chaîne originale si pas convertible
    }
    return date.toISOString().split('T')[0];
  } catch {
    return dateString;
  }
}

function categorizeSkill(skill: string): 'technical' | 'soft' | 'language' {
  const technicalSkills = [
    'JavaScript',
    'Python',
    'Java',
    'React',
    'Vue',
    'Angular',
    'Node.js',
    'TypeScript',
    'PHP',
    'C++',
    'C#',
    'Swift',
    'Kotlin',
    'Go',
    'Rust',
    'HTML',
    'CSS',
    'SASS',
    'SCSS',
    'Bootstrap',
    'Tailwind',
    'MongoDB',
    'MySQL',
    'PostgreSQL',
    'Redis',
    'SQL',
    'AWS',
    'Azure',
    'GCP',
    'Docker',
    'Kubernetes',
    'Jenkins',
    'Git',
    'GitHub',
    'GitLab',
    'API',
    'REST',
    'GraphQL',
    'Machine Learning',
    'AI',
    'Data Science',
    'Analytics',
    'Photoshop',
    'Figma',
    'Adobe',
    'Sketch',
  ];

  const languages = [
    'English',
    'French',
    'Spanish',
    'German',
    'Italian',
    'Portuguese',
    'Chinese',
    'Japanese',
    'Korean',
    'Arabic',
    'Russian',
    'Anglais',
    'Français',
    'Espagnol',
    'Allemand',
    'Italien',
    'Chinois',
    'Japonais',
    'Arabe',
    'Russe',
  ];

  const skillLower = skill.toLowerCase();

  if (languages.some((lang) => skillLower.includes(lang.toLowerCase()))) {
    return 'language';
  }

  if (technicalSkills.some((tech) => skillLower.includes(tech.toLowerCase()))) {
    return 'technical';
  }

  return 'soft';
}

function extractSkillsFromDescription(description: string): string[] {
  const skillKeywords = [
    'React',
    'Vue',
    'Angular',
    'JavaScript',
    'TypeScript',
    'Node.js',
    'Python',
    'Java',
    'PHP',
    'C++',
    'C#',
    'AWS',
    'Azure',
    'Docker',
    'Kubernetes',
    'MongoDB',
    'MySQL',
    'PostgreSQL',
    'Git',
    'Agile',
    'Scrum',
  ];

  const foundSkills: string[] = [];
  const lowerDescription = description.toLowerCase();

  skillKeywords.forEach((skill) => {
    if (lowerDescription.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });

  return foundSkills;
}

function extractAchievementsFromDescription(description: string): string[] {
  const achievements: string[] = [];

  // Recherche de patterns d'accomplissements (pourcentages, nombres, etc.)
  const achievementPatterns = [
    /\b(\d+)%\s*(?:increase|improvement|growth|réduction|augmentation|amélioration)/gi,
    /\b(?:led|managed|directed|supervisé|dirigé|géré)\s+(?:a\s+)?team\s+of\s+(\d+)/gi,
    /\b(?:saved|économisé|gagné)\s+\$?(\d+[,.]?\d*[KMBkmb]?)/gi,
    /\b(?:generated|généré|créé)\s+\$?(\d+[,.]?\d*[KMBkmb]?)/gi,
  ];

  achievementPatterns.forEach((pattern) => {
    const matches = description.match(pattern);
    if (matches) {
      achievements.push(...matches);
    }
  });

  return achievements;
}

function extractKeywordsFromProfile(profileData: any): string[] {
  const keywords: string[] = [];

  // Extraction depuis le headline
  if (profileData.headline) {
    const headlineKeywords = profileData.headline
      .split(/[,|&-]/)
      .map((keyword: string) => keyword.trim())
      .filter((keyword: string) => keyword.length > 2);
    keywords.push(...headlineKeywords);
  }

  // Extraction depuis le summary
  if (profileData.summary) {
    const summaryKeywords = extractTechnicalTerms(profileData.summary);
    keywords.push(...summaryKeywords);
  }

  // Extraction depuis les expériences
  if (profileData.experiences) {
    profileData.experiences.forEach((exp: any) => {
      if (exp.title) keywords.push(exp.title);
      if (exp.company) keywords.push(exp.company);
      if (exp.description) {
        const expKeywords = extractTechnicalTerms(exp.description);
        keywords.push(...expKeywords);
      }
    });
  }

  return keywords;
}

function extractTechnicalTerms(text: string): string[] {
  const technicalPatterns = [
    /\b(?:React|Vue|Angular|JavaScript|TypeScript|Node\.js|Python|Java|PHP|C\+\+|C#)\b/gi,
    /\b(?:AWS|Azure|GCP|Docker|Kubernetes|Jenkins|Git|MongoDB|MySQL|PostgreSQL)\b/gi,
    /\b(?:Agile|Scrum|Kanban|DevOps|CI\/CD|API|REST|GraphQL)\b/gi,
    /\b(?:Machine Learning|AI|Data Science|Analytics|Big Data)\b/gi,
  ];

  const terms: string[] = [];
  technicalPatterns.forEach((pattern) => {
    const matches = text.match(pattern);
    if (matches) {
      terms.push(...matches);
    }
  });

  return terms;
}

function generateRawTextFromProfile(profileData: any): string {
  let rawText = '';

  // Informations personnelles
  if (profileData.firstName || profileData.lastName) {
    rawText += `${profileData.firstName} ${profileData.lastName}\n`;
  }

  if (profileData.headline) {
    rawText += `${profileData.headline}\n\n`;
  }

  if (profileData.location) {
    rawText += `Location: ${profileData.location}\n\n`;
  }

  if (profileData.summary) {
    rawText += `Summary:\n${profileData.summary}\n\n`;
  }

  // Expériences
  if (profileData.experiences && profileData.experiences.length > 0) {
    rawText += 'Experience:\n';
    profileData.experiences.forEach((exp: any) => {
      rawText += `${exp.title} at ${exp.company}\n`;
      if (exp.startDate || exp.endDate) {
        rawText += `${exp.startDate} - ${exp.endDate || 'Present'}\n`;
      }
      if (exp.description) {
        rawText += `${exp.description}\n`;
      }
      rawText += '\n';
    });
  }

  // Formation
  if (profileData.education && profileData.education.length > 0) {
    rawText += 'Education:\n';
    profileData.education.forEach((edu: any) => {
      rawText += `${edu.degree} ${
        edu.fieldOfStudy ? 'in ' + edu.fieldOfStudy : ''
      } from ${edu.school}\n`;
      if (edu.startDate || edu.endDate) {
        rawText += `${edu.startDate} - ${edu.endDate}\n`;
      }
      rawText += '\n';
    });
  }

  // Compétences
  if (profileData.skills && profileData.skills.length > 0) {
    rawText += 'Skills:\n';
    rawText += profileData.skills.join(', ') + '\n\n';
  }

  return rawText;
}
