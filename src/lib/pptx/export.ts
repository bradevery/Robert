'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Resume } from '@/stores/resume-simple';

interface OrganizationBranding {
  name: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  pitch?: string;
}

export async function exportToPPTX(
  resume: Resume,
  organization?: OrganizationBranding
) {
  const PptxGenJS = (await import('pptxgenjs')).default;
  const pptx = new PptxGenJS();

  // Branding Defaults
  const primaryColor = organization?.primaryColor || '#2563EB';
  const secondaryColor = organization?.secondaryColor || '#1E40AF';
  const companyName = organization?.name || 'Robert.IA';
  const _logoUrl = organization?.logoUrl;

  // Metadata
  pptx.author = companyName;
  pptx.company = companyName;
  pptx.title = resume.title || `CV - ${resume.data.basics.name}`;

  // --- Master Slide ---
  pptx.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: 'FFFFFF' },
    objects: [
      // Header Bar
      {
        rect: { x: 0, y: 0, w: '100%', h: 0.8, fill: { color: primaryColor } },
      },
      // Footer Bar
      {
        rect: {
          x: 0,
          y: '95%',
          w: '100%',
          h: 0.4,
          fill: { color: secondaryColor },
        },
      },
      // Logo (Placeholder if URL is blob, hard to handle in browser without conversion)
      // For now we skip logo image processing to avoid CORS/Blob issues in this MVP step
      {
        text: {
          text: companyName,
          options: {
            x: 0.5,
            y: 0.2,
            color: 'FFFFFF',
            fontSize: 14,
            bold: true,
          },
        },
      },
      // Page Number
      {
        text: {
          text: { type: 'number' },
          options: { x: '90%', y: '96%', color: 'FFFFFF', fontSize: 10 },
        },
      },
    ],
  });

  // --- Title Slide ---
  const slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  const basics = resume.data.basics;

  // Name
  slide.addText(basics.name, {
    x: 0.5,
    y: 2,
    w: '90%',
    h: 1,
    fontSize: 36,
    color: primaryColor,
    bold: true,
    align: 'center',
  });

  // Label / Title
  if (basics.label) {
    slide.addText(basics.label, {
      x: 0.5,
      y: 3,
      w: '90%',
      h: 0.5,
      fontSize: 18,
      color: secondaryColor,
      align: 'center',
    });
  }

  // Contact Info
  const contactText = [
    basics.email,
    basics.phone,
    basics.location?.city
      ? `${basics.location.city}, ${basics.location.country}`
      : '',
  ]
    .filter(Boolean)
    .join(' | ');

  slide.addText(contactText, {
    x: 0.5,
    y: 3.8,
    w: '90%',
    h: 0.5,
    fontSize: 12,
    color: '666666',
    align: 'center',
  });

  // Summary
  if (basics.summary) {
    slide.addText(basics.summary, {
      x: 1,
      y: 5,
      w: '80%',
      h: 2,
      fontSize: 11,
      color: '333333',
      align: 'left',
      valign: 'top',
    });
  }

  // --- Content Slides ---
  // We will iterate over sections and add them to slides.
  // For simplicity, we create a new slide for each major section or group them.

  const sections = resume.data.sections;

  // 1. Experience
  if (
    sections.experience &&
    sections.experience.visible &&
    sections.experience.items.length > 0
  ) {
    addSectionSlide(
      pptx,
      'Expérience Professionnelle',
      sections.experience.items,
      primaryColor,
      (item) => ({
        title: item.company,
        subtitle: item.position,
        date: `${item.startDate} - ${item.endDate}`,
        description: item.summary || item.description,
        bullets: item.highlights,
      })
    );
  }

  // 2. Education
  if (
    sections.education &&
    sections.education.visible &&
    sections.education.items.length > 0
  ) {
    addSectionSlide(
      pptx,
      'Formation',
      sections.education.items,
      primaryColor,
      (item) => ({
        title: item.institution,
        subtitle: item.degree || item.studyType,
        date: `${item.startDate} - ${item.endDate}`,
        description: item.description,
        bullets: item.bullets,
      })
    );
  }

  // 3. Skills
  if (
    sections.skills &&
    sections.skills.visible &&
    sections.skills.items.length > 0
  ) {
    const skillsSlide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    skillsSlide.addText('Compétences', {
      x: 0.5,
      y: 1,
      fontSize: 24,
      color: primaryColor,
      bold: true,
    });

    const skillsText = sections.skills.items.map((s: any) => s.name).join(', ');
    skillsSlide.addText(skillsText, {
      x: 0.5,
      y: 2,
      w: '90%',
      h: 4,
      fontSize: 12,
      color: '333333',
      valign: 'top',
    });
  }

  // Save
  const fileName = `${basics.name.replace(/\s+/g, '_')}_CV.pptx`;
  await pptx.writeFile({ fileName });
}

function addSectionSlide(
  pptx: PptxGenJS,
  sectionTitle: string,
  items: any[],
  titleColor: string,
  mapper: (item: any) => {
    title: string;
    subtitle?: string;
    date?: string;
    description?: string;
    bullets?: string[];
  }
) {
  let slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  slide.addText(sectionTitle, {
    x: 0.5,
    y: 1,
    fontSize: 24,
    color: titleColor,
    bold: true,
  });

  let yPos = 1.8;
  const margin = 0.5;
  const contentWidth = 9;

  items.forEach((item, _index) => {
    const data = mapper(item);

    // Check if we need a new slide
    if (yPos > 6.5) {
      slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
      slide.addText(`${sectionTitle} (suite)`, {
        x: 0.5,
        y: 1,
        fontSize: 24,
        color: titleColor,
        bold: true,
      });
      yPos = 1.8;
    }

    // Title & Date
    slide.addText(data.title, {
      x: margin,
      y: yPos,
      w: contentWidth * 0.7,
      h: 0.4,
      fontSize: 14,
      bold: true,
    });
    if (data.date) {
      slide.addText(data.date, {
        x: margin + contentWidth * 0.7,
        y: yPos,
        w: contentWidth * 0.3,
        h: 0.4,
        fontSize: 12,
        align: 'right',
        color: '666666',
      });
    }
    yPos += 0.4;

    // Subtitle
    if (data.subtitle) {
      slide.addText(data.subtitle, {
        x: margin,
        y: yPos,
        w: contentWidth,
        h: 0.3,
        fontSize: 12,
        italic: true,
        color: '444444',
      });
      yPos += 0.3;
    }

    // Description
    if (data.description) {
      slide.addText(data.description, {
        x: margin,
        y: yPos,
        w: contentWidth,
        h: 0.5,
        fontSize: 11,
        color: '333333',
      });
      yPos += 0.5; // Estimate height
    }

    // Bullets
    if (data.bullets && data.bullets.length > 0) {
      data.bullets.forEach((bullet) => {
        if (!bullet) return;
        slide.addText(bullet, {
          x: margin + 0.2,
          y: yPos,
          w: contentWidth - 0.2,
          h: 0.3,
          fontSize: 10,
          color: '333333',
          bullet: true,
        });
        yPos += 0.3;
      });
    }

    yPos += 0.3; // Spacing between items
  });
}
