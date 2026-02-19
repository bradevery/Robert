/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { CVData } from '@/types/cv-matcher';

/**
 * API endpoint to parse CV using Hrflow.ai
 * Accepts PDF, DOC, DOCX files and returns structured CV data
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: 'Veuillez choisir un fichier à analyser',
        },
        { status: 400 }
      );
    }

    // Validation du fichier
    const maxSize = 5; // 5MB
    const maxFileSize = maxSize * 1048576;

    if (file.size >= maxFileSize) {
      return NextResponse.json(
        {
          success: false,
          message: `La taille maximale permise est de ${maxSize} MB`,
        },
        { status: 400 }
      );
    }

    const allowedFileTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const fileName = file.name;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    const isValidByExtension = ['pdf', 'doc', 'docx'].includes(
      fileExtension || ''
    );
    const isValidByMimeType = allowedFileTypes.includes(file.type);

    if (!isValidByExtension && !isValidByMimeType) {
      return NextResponse.json(
        {
          success: false,
          message: 'Le fichier doit être en PDF, DOC ou DOCX',
        },
        { status: 400 }
      );
    }

    // Préparation de la requête Hrflow
    const hrflowFormData = new FormData();
    hrflowFormData.append('file', file);
    hrflowFormData.append(
      'source_key',
      process.env.HRFLOW_SOURCE_KEY ||
        'fdec526f8d46e40e6e4e5e852974599eabbbec65'
    );

    // Appel à l'API Hrflow
    const hrflowResponse = await fetch(
      'https://api.hrflow.ai/v1/profile/parsing/file',
      {
        method: 'POST',
        headers: {
          'X-USER-EMAIL':
            process.env.HRFLOW_USER_EMAIL || 'lounas1994@gmail.com',
          'X-API-KEY':
            process.env.HRFLOW_API_KEY ||
            'ask_bc8967664a7b14d63549e7e85fd1c8ae',
        },
        body: hrflowFormData,
      }
    );

    if (!hrflowResponse.ok) {
      throw new Error(`Erreur Hrflow: ${hrflowResponse.status}`);
    }

    const hrflowData = await hrflowResponse.json();

    if (hrflowData.code !== 201 && hrflowData.code !== 202) {
      throw new Error('Erreur lors du parsing du CV');
    }

    // Transformation des données Hrflow vers notre format
    const cvData: CVData = {
      id: uuidv4(),
      name: fileName,
      source: 'upload',
      content: {
        personalInfo: {
          fullName: hrflowData.data.profile.info.full_name || '',
          firstName: hrflowData.data.profile.info.first_name || '',
          lastName: hrflowData.data.profile.info.last_name || '',
          email: hrflowData.data.profile.info.email || undefined,
          phone: hrflowData.data.profile.info.phone || undefined,
          location: hrflowData.data.profile.info.location
            ? {
                city: hrflowData.data.profile.info.location.fields.city || '',
                state: hrflowData.data.profile.info.location.fields.state || '',
                country:
                  hrflowData.data.profile.info.location.fields.country || '',
              }
            : undefined,
          urls:
            hrflowData.data.profile.info.urls?.map((url: any) => ({
              type: url.type,
              url: url.url,
            })) || [],
        },
        experiences:
          hrflowData.data.profile.experiences?.map((exp: any) => ({
            title: exp.title || '',
            company: exp.company || '',
            location: exp.location?.text || '',
            startDate: exp.date_start || '',
            endDate: exp.date_end || '',
            description: exp.description || '',
            skills: exp.skills?.map((skill: any) => skill.name) || [],
            achievements: exp.tasks?.map((task: any) => task.name) || [],
          })) || [],
        education:
          hrflowData.data.profile.educations?.map((edu: any) => ({
            degree: edu.title || '',
            school: edu.school || '',
            fieldOfStudy: edu.description || '',
            location: edu.location?.text || '',
            startDate: edu.date_start || '',
            endDate: edu.date_end || '',
            grade: '',
            description: edu.description || '',
          })) || [],
        skills:
          hrflowData.data.profile.skills?.map((skill: any) => ({
            name: skill.name,
            type: skill.type === 'hard' ? 'technical' : 'soft',
            category: skill.type,
          })) || [],
        summary: hrflowData.data.profile.info.summary || '',
        extractedKeywords:
          hrflowData.data.profile.tasks?.map((task: any) => task.name) || [],
      },
      raw_text: hrflowData.data.parsing.text || '',
      processed_at: new Date().toISOString(),
    };

    // Calcul de keywords supplémentaires basé sur le contenu
    const additionalKeywords = extractKeywordsFromText(cvData.raw_text);
    cvData.content.extractedKeywords = [
      ...cvData.content.extractedKeywords,
      ...additionalKeywords,
    ].filter((keyword, index, self) => self.indexOf(keyword) === index); // Dédoublonnage

    return NextResponse.json({
      success: true,
      message: 'CV analysé avec succès',
      data: cvData,
    });
  } catch (error) {
    console.error('Erreur parsing CV:', error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de l'analyse du CV",
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

/**
 * Fonction utilitaire pour extraire des mots-clés supplémentaires du texte
 */
function extractKeywordsFromText(text: string): string[] {
  // Technologies et compétences communes
  const techKeywords = [
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
    'Swift',
    'Kotlin',
    'Flutter',
    'React Native',
    'HTML',
    'CSS',
    'SASS',
    'SCSS',
    'Bootstrap',
    'Tailwind',
    'MongoDB',
    'MySQL',
    'PostgreSQL',
    'SQLite',
    'Redis',
    'AWS',
    'Azure',
    'GCP',
    'Docker',
    'Kubernetes',
    'Jenkins',
    'Git',
    'GitHub',
    'GitLab',
    'Jira',
    'Confluence',
    'Agile',
    'Scrum',
    'Kanban',
    'DevOps',
    'CI/CD',
    'Machine Learning',
    'AI',
    'Data Science',
    'Analytics',
    'Figma',
    'Adobe',
    'Photoshop',
    'Illustrator',
  ];

  const foundKeywords: string[] = [];
  const lowercaseText = text.toLowerCase();

  techKeywords.forEach((keyword) => {
    if (lowercaseText.includes(keyword.toLowerCase())) {
      foundKeywords.push(keyword);
    }
  });

  // Extraction de patterns spécifiques (années d'expérience, certifications, etc.)
  const experienceMatches = text.match(
    /(\d+)\s*(?:ans?|years?)\s*(?:d[''']?expérience|experience)/gi
  );
  if (experienceMatches) {
    foundKeywords.push(...experienceMatches.map((match) => match.trim()));
  }

  // Certifications communes
  const certificationKeywords = [
    'AWS Certified',
    'Azure Certified',
    'Google Cloud',
    'PMP',
    'Scrum Master',
    'CISSP',
    'CompTIA',
    'ITIL',
    'Six Sigma',
  ];

  certificationKeywords.forEach((cert) => {
    if (lowercaseText.includes(cert.toLowerCase())) {
      foundKeywords.push(cert);
    }
  });

  return foundKeywords;
}
