/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

import {
  CVData,
  JobData,
  JobscanAnalysis,
  RecruiterTip,
  SearchabilityIssue,
  SkillComparison,
} from '@/types/cv-matcher';

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

    // Analyser le CV et l'offre d'emploi pour générer les résultats Jobscan-like
    const analysis = await generateJobscanAnalysis(cvData, jobData);

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Erreur analyse Jobscan:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

async function generateJobscanAnalysis(
  cvData: CVData,
  jobData: JobData
): Promise<JobscanAnalysis> {
  // Simulation d'une analyse complète basée sur les images Jobscan

  // Extraire les mots-clés du CV et de l'offre
  const cvKeywords = extractKeywords(cvData.raw_text);
  const jobKeywords = extractKeywords(jobData.description);

  // Calculer le match rate
  const matchRate = calculateMatchRate(cvKeywords, jobKeywords);

  // Analyser les compétences hard et soft
  const hardSkillsAnalysis = analyzeHardSkills(cvData, jobData);
  const softSkillsAnalysis = analyzeSoftSkills(cvData, jobData);

  // Générer les issues de searchability
  const searchabilityIssues = generateSearchabilityIssues(cvData, jobData);

  // Générer les conseils de recruteur
  const recruiterTips = generateRecruiterTips(cvData, jobData);

  // Analyser le formatage
  const formattingAnalysis = analyzeFormatting(cvData);

  return {
    matchRate: {
      score: matchRate,
      level: matchRate >= 80 ? 'High' : matchRate >= 60 ? 'Medium' : 'Low',
    },
    sections: {
      searchability: {
        score: 75,
        issues: searchabilityIssues,
        tips: [
          "Utilisez des mots-clés de l'offre d'emploi dans votre CV",
          'Assurez-vous que vos informations de contact sont facilement lisibles',
          'Utilisez des titres de section standards comme "Expérience professionnelle"',
        ],
      },
      hardSkills: hardSkillsAnalysis,
      softSkills: softSkillsAnalysis,
      recruiterTips: {
        score: 70,
        tips: recruiterTips,
      },
      formatting: formattingAnalysis,
    },
    comparison: {
      resume: {
        skills: cvData.content.skills.map((s) => s.name),
        keywords: cvKeywords,
        experience: cvData.content.experiences.map((e) => e.title),
        education: cvData.content.education.map((e) => e.degree),
      },
      jobDescription: {
        requirements: jobData.requirements,
        skills: jobData.extractedKeywords,
        keywords: jobKeywords,
        qualifications: jobData.parsed.qualifications.required,
      },
    },
  };
}

function extractKeywords(text: string): string[] {
  // Simulation d'extraction de mots-clés
  const words = text
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

  return [...new Set(words)].slice(0, 50);
}

function calculateMatchRate(
  cvKeywords: string[],
  jobKeywords: string[]
): number {
  const commonKeywords = cvKeywords.filter((keyword) =>
    jobKeywords.some(
      (jobKeyword) =>
        jobKeyword.includes(keyword) || keyword.includes(jobKeyword)
    )
  );

  return Math.round(
    (commonKeywords.length / Math.max(jobKeywords.length, 1)) * 100
  );
}

function analyzeHardSkills(cvData: CVData, jobData: JobData): any {
  const hardSkills = [
    'JavaScript',
    'Python',
    'React',
    'Node.js',
    'SQL',
    'Git',
    'Docker',
    'AWS',
    'TypeScript',
    'MongoDB',
    'PostgreSQL',
    'GraphQL',
    'Redis',
    'Kubernetes',
    'Java',
    'C++',
    'Angular',
    'Vue.js',
    'Express.js',
    'Django',
    'Flask',
    'business consulting',
    'project management',
    'data analysis',
    'Excel',
    'PowerPoint',
    'Salesforce',
    'CRM',
    'ERP',
    'SAP',
    'Tableau',
  ];

  const cvSkills = cvData.content.skills.map((s) => s.name.toLowerCase());
  const jobText = jobData.description.toLowerCase();

  const comparison: SkillComparison[] = hardSkills
    .map((skill) => {
      const skillLower = skill.toLowerCase();
      const inResume = cvSkills.some(
        (cvSkill) =>
          cvSkill.includes(skillLower) || skillLower.includes(cvSkill)
      );
      const inJob = jobText.includes(skillLower);

      // Échapper les caractères spéciaux regex
      const escapedSkill = skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const frequency = (jobText.match(new RegExp(escapedSkill, 'g')) || [])
        .length;

      return {
        skill,
        inResume,
        inJob,
        frequency,
        importance: frequency > 2 ? 'high' : frequency > 0 ? 'medium' : 'low',
      };
    })
    .filter((skill) => skill.inJob || skill.inResume);

  const matched = comparison.filter(
    (skill) => skill.inResume && skill.inJob
  ).length;
  const missing = comparison.filter(
    (skill) => skill.inJob && !skill.inResume
  ).length;

  return {
    score: Math.round((matched / Math.max(comparison.length, 1)) * 100),
    total: comparison.length,
    matched,
    missing,
    comparison,
    tips: [
      "Ajoutez les compétences techniques manquantes mentionnées dans l'offre",
      'Quantifiez vos compétences avec des exemples concrets',
      "Utilisez les mêmes termes techniques que l'offre d'emploi",
    ],
  };
}

function analyzeSoftSkills(cvData: CVData, jobData: JobData): any {
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
    'project management',
  ];

  const cvText = cvData.raw_text.toLowerCase();
  const jobText = jobData.description.toLowerCase();

  const comparison: SkillComparison[] = softSkills
    .map((skill) => {
      const skillLower = skill.toLowerCase();
      const inResume = cvText.includes(skillLower);
      const inJob = jobText.includes(skillLower);

      // Échapper les caractères spéciaux regex
      const escapedSkill = skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const frequency = (jobText.match(new RegExp(escapedSkill, 'g')) || [])
        .length;

      return {
        skill,
        inResume,
        inJob,
        frequency,
        importance: frequency > 1 ? 'high' : frequency > 0 ? 'medium' : 'low',
      };
    })
    .filter((skill) => skill.inJob || skill.inResume);

  const matched = comparison.filter(
    (skill) => skill.inResume && skill.inJob
  ).length;
  const missing = comparison.filter(
    (skill) => skill.inJob && !skill.inResume
  ).length;

  return {
    score: Math.round((matched / Math.max(comparison.length, 1)) * 100),
    total: comparison.length,
    matched,
    missing,
    comparison,
    tips: [
      'Illustrez vos soft skills avec des exemples concrets',
      "Utilisez des mots d'action pour décrire vos réalisations",
      "Intégrez les soft skills de l'offre dans vos descriptions d'expérience",
    ],
  };
}

function generateSearchabilityIssues(
  cvData: CVData,
  jobData: JobData
): SearchabilityIssue[] {
  const issues: SearchabilityIssue[] = [];

  // ATS Tip
  issues.push({
    type: 'ATS_tip',
    severity: 'high',
    title: 'ATS Tip',
    description:
      "Adding this job's company name and web address can help us provide you ATS-specific tips.",
    suggestion: 'Update scan information',
    status: 'error',
  });

  // Vérifier les informations de contact
  if (!cvData.content.personalInfo.email) {
    issues.push({
      type: 'contact_info',
      severity: 'high',
      title: 'Contact Information',
      description:
        'We did not find an address in your resume. Recruiters use your address to validate your location for job matches.',
      suggestion: 'Add your address to your resume',
      status: 'error',
    });
  } else {
    issues.push({
      type: 'contact_info',
      severity: 'low',
      title: 'Contact Information',
      description:
        'You provided your email. Recruiters use your email to contact you for job matches.',
      suggestion: '',
      status: 'success',
    });

    if (cvData.content.personalInfo.phone) {
      issues.push({
        type: 'contact_info',
        severity: 'low',
        title: 'Contact Information',
        description: 'You provided your phone number.',
        suggestion: '',
        status: 'success',
      });
    }
  }

  // Vérifier le résumé/summary
  if (cvData.content.summary && cvData.content.summary.length > 100) {
    issues.push({
      type: 'summary',
      severity: 'low',
      title: 'Summary',
      description:
        "We found a summary section on your resume. Good job! The summary provides a quick overview of the candidate's qualifications, helping recruiters and hiring managers promptly grasp the value the candidate can offer in the position.",
      suggestion: '',
      status: 'success',
    });
  }

  // Vérifier les en-têtes de section
  const hasEducationSection =
    cvData.content.education && cvData.content.education.length > 0;
  const hasExperienceSection =
    cvData.content.experiences && cvData.content.experiences.length > 0;

  if (!hasEducationSection) {
    issues.push({
      type: 'section_headings',
      severity: 'high',
      title: 'Section Headings',
      description:
        'We couldn\'t find an "Education" section in your resume. Ensure your resume includes an education section labeled as "Education" to ensure ATS can accurately recognize your academic qualifications.',
      suggestion: 'Add an Education section to your resume',
      status: 'error',
    });
  }

  if (!hasExperienceSection) {
    issues.push({
      type: 'section_headings',
      severity: 'high',
      title: 'Section Headings',
      description:
        'Name your experience section "Work History" or "Professional Experience" for ATS to recognize work sections.',
      suggestion: 'Add a proper Work Experience section',
      status: 'error',
    });

    issues.push({
      type: 'section_headings',
      severity: 'high',
      title: 'Section Headings',
      description:
        'Your Work Experience section appears empty. We recommend that this section should showcase at least one listing, even if it is just an internship or a personal project.',
      suggestion: 'Add work experience entries',
      status: 'error',
    });
  }

  // Vérifier la correspondance du titre de poste
  const jobTitle = jobData.title.toLowerCase();
  const cvHasJobTitle = cvData.raw_text.toLowerCase().includes(jobTitle);

  if (!cvHasJobTitle) {
    issues.push({
      type: 'job_title_match',
      severity: 'high',
      title: 'Job Title Match',
      description: `The job title '${jobData.title}' from the job description was not found in your resume. We recommend having the exact title of the job for which you're applying in your resume. This ensures you'll be found when a recruiter searches by job title. If you haven't held this position before, include it as part of your summary statement.`,
      suggestion: 'Update scan information',
      status: 'error',
    });
  }

  // Date Formatting
  issues.push({
    type: 'date_formatting',
    severity: 'low',
    title: 'Date Formatting',
    description:
      'The dates in your work experience section are properly formatted.',
    suggestion: '',
    status: 'success',
  });

  // Education Match
  if (hasEducationSection) {
    issues.push({
      type: 'education_match',
      severity: 'low',
      title: 'Education Match',
      description:
        'Your education matches the preferred education listed in the job description.',
      suggestion: 'Update required education level',
      status: 'success',
    });
  }

  return issues;
}

function generateRecruiterTips(
  cvData: CVData,
  _jobData: JobData
): RecruiterTip[] {
  const tips: RecruiterTip[] = [];

  // Job Level Match
  tips.push({
    type: 'job_level_match',
    severity: 'medium',
    title: 'Job Level Match',
    description:
      "No specific years of experience were found in this job description. Focus on matching your skills and qualifications to the role's requirements. Consider how your experience, regardless of duration, aligns with the job's key responsibilities before applying.",
    suggestion: 'Review job requirements and align your experience accordingly',
    status: 'warning',
  });

  // Measurable Results
  const metricsRegex =
    /\d+%|\d+\+|\$\d+|increased|improved|reduced|saved|managed|led|achieved|generated|grew|delivered/gi;
  const metricsMatches = cvData.raw_text.match(metricsRegex) || [];
  const metricsCount = metricsMatches.length;

  tips.push({
    type: 'measurable_results',
    severity: metricsCount >= 5 ? 'low' : 'medium',
    title: 'Measurable Results',
    description: `We found ${metricsCount} mentions of measurable results in your resume. Consider adding at least 5 specific achievements or impact you had in your job (e.g. time saved, increase in sales, etc).`,
    suggestion:
      metricsCount >= 5
        ? 'View Measurable Results'
        : 'Add more quantified achievements with specific numbers and percentages',
    status: metricsCount >= 5 ? 'success' : 'warning',
  });

  // Resume Tone
  const negativePhrases = ['responsible for', 'duties included', 'helped with'];
  const hasNegativeTone = negativePhrases.some((phrase) =>
    cvData.raw_text.toLowerCase().includes(phrase)
  );

  tips.push({
    type: 'resume_tone',
    severity: 'low',
    title: 'Resume Tone',
    description: hasNegativeTone
      ? 'Consider using more action-oriented language instead of passive phrases'
      : 'The tone of your resume is generally positive and no common cliches and buzzwords were found. Good job!',
    suggestion: hasNegativeTone
      ? 'Replace passive phrases with action verbs like "Led", "Achieved", "Delivered"'
      : 'Continue using strong action verbs',
    status: hasNegativeTone ? 'warning' : 'success',
  });

  // Web Presence
  const hasLinkedIn = cvData.raw_text.toLowerCase().includes('linkedin');
  const hasWebsite = /https?:\/\/|www\./i.test(cvData.raw_text);

  tips.push({
    type: 'web_presence',
    severity: hasLinkedIn || hasWebsite ? 'low' : 'medium',
    title: 'Web Presence',
    description:
      hasLinkedIn || hasWebsite
        ? 'Great! You included your online presence in your resume'
        : 'Consider adding a website or Linkedin url to build your web credibility. Recruiters appreciate the convenience and credibility associated with a professional website.',
    suggestion:
      hasLinkedIn || hasWebsite
        ? 'Keep your online profiles updated and professional'
        : 'Add your LinkedIn profile URL to increase credibility',
    status: hasLinkedIn || hasWebsite ? 'success' : 'error',
  });

  // Word Count
  const wordCount = cvData.raw_text.split(/\s+/).length;
  const isOptimalLength = wordCount >= 200 && wordCount <= 800;

  tips.push({
    type: 'word_count',
    severity: isOptimalLength ? 'low' : 'medium',
    title: 'Word Count',
    description: `There are ${wordCount} words in your resume, which is ${
      wordCount < 200 ? 'under' : wordCount > 800 ? 'over' : 'within'
    } the suggested range for relevance and ease of reading reasons.`,
    suggestion:
      wordCount < 200
        ? 'Consider adding more detailed descriptions of your achievements'
        : wordCount > 800
        ? 'Consider condensing your resume for better readability'
        : 'Your resume length is optimal',
    status: isOptimalLength ? 'success' : 'warning',
  });

  return tips;
}

function analyzeFormatting(_cvData: CVData): any {
  return {
    score: 90,
    layout: {
      status: 'pass' as const,
      message:
        'Your resume has a clean, professional layout that is easy to read',
      suggestion: 'Great work on the formatting!',
    },
    fontCheck: {
      status: 'pass' as const,
      message: 'Font choices are professional and ATS-friendly',
    },
    pageSetup: {
      status: 'pass' as const,
      message: 'Page margins and spacing are appropriate for ATS parsing',
    },
  };
}
