/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResumeData } from '@/lib/reactive-resume-schema';
import {
  convertRatingToLevel,
  createDateRange,
  generateId,
} from '@/lib/reactive-resume-utils';

import { Resume } from '@/stores/resume-simple';

// Convert Resume-simple format to ResumeData format for templates
export const convertResumeToResumeData = (resume: Resume): ResumeData => {
  const { basics, sections, metadata } = resume.data;

  return {
    basics: {
      name: basics.name || '',
      headline: basics.label || '',
      email: basics.email || '',
      phone: basics.phone || '',
      location: `${basics.location?.city || ''}, ${
        basics.location?.country || ''
      }`.replace(', ', ''),
      url: { href: '', label: '' },
      customFields: [
        // Stocker les informations de thème dans customFields pour la rétrocompatibilité
        {
          id: 'theme-primary',
          icon: 'palette',
          name: 'theme',
          value: metadata?.theme?.primary || '#dc2626',
        },
        {
          id: 'font-family',
          icon: 'text',
          name: 'font',
          value: metadata?.typography?.font?.family || 'IBM Plex Serif',
        },
      ],
      picture: {
        url: '',
        size: 128,
        aspectRatio: 1,
        borderRadius: 0,
        effects: {
          hidden: true,
          border: false,
          grayscale: false,
        },
      },
    },
    sections: {
      summary: {
        id: 'summary',
        name: 'Résumé',
        content: basics.summary || '',
        visible: true,
        columns: 1,
      },
      profiles: {
        id: 'profiles',
        name: 'Profils',
        items: [],
        visible: true,
        columns: 1,
      },
      experience: {
        id: 'experience',
        name: 'Expérience professionnelle',
        items: (sections.experience?.items || []).map((exp: any) => ({
          id: exp.id || generateId('exp'),
          company: exp.company || '',
          position: exp.position || '',
          location: exp.location || '',
          date: createDateRange(exp.startDate, exp.endDate),
          summary: exp.summary || '',
          url: { href: '', label: '' },
          visible: true,
        })),
        visible: sections.experience?.visible !== false,
        columns: 1,
        separateLinks: false,
      },
      education: {
        id: 'education',
        name: 'Formation',
        items: (sections.education?.items || []).map((edu: any) => ({
          id: edu.id || generateId('edu'),
          institution: edu.institution || '',
          area: edu.area || '',
          studyType: edu.studyType || '',
          score: edu.score || '',
          date: createDateRange(edu.startDate, edu.endDate),
          summary: '',
          url: { href: '', label: '' },
          visible: true,
        })),
        visible: sections.education?.visible !== false,
        columns: 1,
        separateLinks: false,
      },
      awards: {
        id: 'awards',
        name: 'Récompenses',
        items: (sections.awards?.items || []).map((award: any) => ({
          id: award.id || generateId('award'),
          title: award.title || '',
          awarder: award.awarder || '',
          date: award.date || '',
          summary: award.summary || '',
          url: { href: award.url || '', label: '' },
          visible: true,
        })),
        visible: sections.awards?.visible !== false,
        columns: 1,
        separateLinks: false,
      },
      certifications: {
        id: 'certifications',
        name: 'Certifications',
        items: (sections.certifications?.items || []).map((cert: any) => ({
          id: cert.id || generateId('cert'),
          name: cert.name || '',
          issuer: cert.issuer || '',
          date: cert.date || '',
          summary: cert.summary || '',
          url: { href: cert.url || '', label: '' },
          visible: true,
        })),
        visible: sections.certifications?.visible !== false,
        columns: 1,
        separateLinks: false,
      },
      skills: {
        id: 'skills',
        name: 'Compétences',
        items: (sections.skills?.items || []).map((skill: any) => ({
          id: skill.id || generateId('skill'),
          name: skill.name || '',
          description: '',
          level: convertRatingToLevel(skill.level),
          keywords: [],
          visible: true,
        })),
        visible: sections.skills?.visible !== false,
        columns: 1,
        separateLinks: false,
      },
      interests: {
        id: 'interests',
        name: "Centres d'intérêt",
        items: (sections.interests?.items || []).map((interest: any) => ({
          id: interest.id || generateId('interest'),
          name: interest.name || '',
          keywords: interest.keywords || [],
          visible: true,
        })),
        visible: sections.interests?.visible !== false,
        columns: 1,
        separateLinks: false,
      },
      publications: {
        id: 'publications',
        name: 'Publications',
        items: [],
        visible: sections.publications?.visible !== false,
        columns: 1,
        separateLinks: false,
      },
      volunteer: {
        id: 'volunteer',
        name: 'Bénévolat',
        items: (sections.volunteer?.items || []).map((vol: any) => ({
          id: vol.id || generateId('volunteer'),
          organization: vol.organization || '',
          position: vol.position || '',
          location: vol.location || '',
          date: createDateRange(vol.startDate, vol.endDate),
          summary: vol.summary || '',
          url: { href: vol.url || '', label: '' },
          visible: true,
        })),
        visible: sections.volunteer?.visible !== false,
        columns: 1,
        separateLinks: false,
      },
      languages: {
        id: 'languages',
        name: 'Langues',
        items: (sections.languages?.items || []).map((lang: any) => ({
          id: lang.id || generateId('lang'),
          name: lang.language || '',
          description: '',
          level: convertRatingToLevel(lang.fluency),
          visible: true,
        })),
        visible: sections.languages?.visible !== false,
        columns: 1,
        separateLinks: false,
      },
      projects: {
        id: 'projects',
        name: 'Projets',
        items: (sections.projects?.items || []).map((project: any) => ({
          id: project.id || generateId('project'),
          name: project.name || '',
          description: project.description || '',
          date: createDateRange(project.startDate, project.endDate),
          summary: '',
          keywords: project.keywords || [],
          url: { href: project.url || '', label: '' },
          visible: true,
        })),
        visible: sections.projects?.visible !== false,
        columns: 1,
        separateLinks: false,
      },
      references: {
        id: 'references',
        name: 'Références',
        items: [],
        visible: sections.references?.visible !== false,
        columns: 1,
        separateLinks: false,
      },
      custom: {},
    },
  };
};

// Convert ResumeData back to Resume format (for editing)
export const convertResumeDataToResume = (
  _resumeData: ResumeData
): Partial<Resume> => {
  // This conversion can be implemented when needed for bi-directional sync
  return {};
};
