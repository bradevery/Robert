'use client';

interface RewriteResult {
  basics: {
    title: string;
    summary: string;
  };
  experiences: Array<{
    company: string;
    role: string;
    description: string;
    improvementsMade: string[];
  }>;
  skills: {
    technical: string[];
    soft: string[];
  };
  language: string;
}

interface OrganizationBranding {
  name: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  pitch?: string;
}

export async function exportReviewToPPTX(
  review: RewriteResult,
  organization?: OrganizationBranding
) {
  const PptxGenJS = (await import('pptxgenjs')).default;
  const pptx = new PptxGenJS();

  // Branding Defaults
  const primaryColor = organization?.primaryColor || '#9333ea'; // Purple for reviewer
  const secondaryColor = organization?.secondaryColor || '#7e22ce';
  const companyName = organization?.name || 'Robert.IA';

  // Metadata
  pptx.author = companyName;
  pptx.company = companyName;
  pptx.title = `CV Optimisé - ${review.basics.title}`;

  // --- Master Slide ---
  pptx.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: 'FFFFFF' },
    objects: [
      {
        rect: { x: 0, y: 0, w: '100%', h: 0.8, fill: { color: primaryColor } },
      },
      {
        rect: {
          x: 0,
          y: '95%',
          w: '100%',
          h: 0.4,
          fill: { color: secondaryColor },
        },
      },
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
      {
        text: {
          text: { type: 'number' },
          options: { x: '90%', y: '96%', color: 'FFFFFF', fontSize: 10 },
        },
      },
    ],
  });

  // --- Title Slide ---
  let slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  slide.addText('CV Optimisé', {
    x: 0.5,
    y: 2,
    fontSize: 32,
    color: primaryColor,
    bold: true,
    align: 'center',
  });
  slide.addText(review.basics.title, {
    x: 0.5,
    y: 3,
    fontSize: 24,
    color: '333333',
    align: 'center',
  });

  if (review.basics.summary) {
    slide.addText(review.basics.summary, {
      x: 1,
      y: 4,
      w: '80%',
      h: 2,
      fontSize: 12,
      color: '666666',
      align: 'center',
      italic: true,
    });
  }

  // --- Skills Slide ---
  slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  slide.addText('Compétences Optimisées', {
    x: 0.5,
    y: 1,
    fontSize: 24,
    color: primaryColor,
    bold: true,
  });

  slide.addText('Hard Skills', {
    x: 0.5,
    y: 1.8,
    fontSize: 18,
    color: '333333',
    bold: true,
  });
  slide.addText(review.skills.technical.join(', '), {
    x: 0.5,
    y: 2.3,
    w: '90%',
    h: 1.5,
    fontSize: 12,
    color: '333333',
  });

  slide.addText('Soft Skills', {
    x: 0.5,
    y: 4,
    fontSize: 18,
    color: '333333',
    bold: true,
  });
  slide.addText(review.skills.soft.join(', '), {
    x: 0.5,
    y: 4.5,
    w: '90%',
    h: 1.5,
    fontSize: 12,
    color: '333333',
  });

  // --- Experiences Slides ---
  review.experiences.forEach((exp) => {
    slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    slide.addText(exp.role, {
      x: 0.5,
      y: 1,
      fontSize: 20,
      color: primaryColor,
      bold: true,
    });
    slide.addText(exp.company, {
      x: 0.5,
      y: 1.5,
      fontSize: 16,
      color: secondaryColor,
    });

    slide.addText(exp.description, {
      x: 0.5,
      y: 2.2,
      w: '60%',
      h: 4,
      fontSize: 11,
      color: '333333',
      valign: 'top',
    });

    // Improvements box
    slide.addShape(pptx.ShapeType.rect, {
      x: 7,
      y: 2.2,
      w: 2.5,
      h: 4,
      fill: { color: 'F3E8FF' },
    });
    slide.addText('Améliorations', {
      x: 7.1,
      y: 2.3,
      fontSize: 12,
      color: primaryColor,
      bold: true,
    });

    let yPos = 2.8;
    exp.improvementsMade.forEach((imp) => {
      slide.addText(imp, {
        x: 7.1,
        y: yPos,
        w: 2.3,
        h: 0.5,
        fontSize: 10,
        color: '333333',
      });
      yPos += 0.6;
    });
  });

  // Save
  const fileName = `CV_Optimise_${new Date().toISOString().slice(0, 10)}.pptx`;
  await pptx.writeFile({ fileName });
}
