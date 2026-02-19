'use client';

import { ProposalResult } from '@/stores/proposal-store';

interface OrganizationBranding {
  name: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  pitch?: string;
}

export async function exportProposalToPPTX(
  proposal: ProposalResult,
  organization?: OrganizationBranding
) {
  const PptxGenJS = (await import('pptxgenjs')).default;
  const pptx = new PptxGenJS();

  // Branding Defaults
  const primaryColor = organization?.primaryColor || '#ea580c'; // Orange default for proposal
  const secondaryColor = organization?.secondaryColor || '#9a3412';
  const companyName = organization?.name || 'Robert.IA';

  // Metadata
  pptx.author = companyName;
  pptx.company = companyName;
  pptx.title = proposal.titre || 'Proposition Commerciale';

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
      // Company Name
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
  let slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  slide.addText(proposal.titre, {
    x: 0.5,
    y: 2,
    w: '90%',
    h: 1.5,
    fontSize: 32,
    color: primaryColor,
    bold: true,
    align: 'center',
  });

  if (proposal.contexteMission) {
    slide.addText(proposal.contexteMission, {
      x: 1,
      y: 4,
      w: '80%',
      h: 2,
      fontSize: 14,
      color: '444444',
      align: 'center',
      italic: true,
    });
  }

  // --- Profil Candidat ---
  slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  slide.addText('Profil Candidat', {
    x: 0.5,
    y: 1,
    fontSize: 24,
    color: primaryColor,
    bold: true,
  });
  slide.addText(proposal.profilCandidat, {
    x: 0.5,
    y: 1.8,
    w: '90%',
    h: 4,
    fontSize: 14,
    color: '333333',
    valign: 'top',
  });

  // --- Adéquation Besoin ---
  if (proposal.adequationBesoin?.bulletPoints?.length) {
    slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    slide.addText('Adéquation au Besoin', {
      x: 0.5,
      y: 1,
      fontSize: 24,
      color: primaryColor,
      bold: true,
    });

    let yPos = 1.8;
    proposal.adequationBesoin.bulletPoints.forEach((point) => {
      slide.addText(point, {
        x: 0.7,
        y: yPos,
        w: '85%',
        h: 0.5,
        fontSize: 14,
        color: '333333',
        bullet: true,
      });
      yPos += 0.6;
    });
  }

  // --- Impact & Valeur ---
  if (proposal.impactValeur?.bulletPoints?.length) {
    slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    slide.addText('Impact & Valeur Ajoutée', {
      x: 0.5,
      y: 1,
      fontSize: 24,
      color: primaryColor,
      bold: true,
    });

    let yPos = 1.8;
    proposal.impactValeur.bulletPoints.forEach((point) => {
      slide.addText(point, {
        x: 0.7,
        y: yPos,
        w: '85%',
        h: 0.5,
        fontSize: 14,
        color: '333333',
        bullet: true,
      });
      yPos += 0.6;
    });
  }

  // Save
  const fileName = `Propale_${new Date().toISOString().slice(0, 10)}.pptx`;
  await pptx.writeFile({ fileName });
}
