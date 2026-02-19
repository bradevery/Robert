/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

import { getAuthScope, scopeWhere } from '@/lib/auth-scope';
import { prisma } from '@/lib/prisma';

// POST - Export a dossier as PDF or DOCX
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scope = await getAuthScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      format = 'pdf',
      includeConfidential = false,
      anonymize = false,
    } = body;

    if (!['pdf', 'docx'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be pdf or docx' },
        { status: 400 }
      );
    }

    // Fetch dossier with related data
    const dossier = (await prisma.dossier.findFirst({
      where: { id: params.id, ...scopeWhere(scope) },
      include: {
        client: {
          select: { id: true, name: true, logo: true, sector: true },
        },
        candidates: {
          include: {
            candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                title: true,
                email: true,
                phone: true,
                skills: true,
                yearsExperience: true,
                tjm: true,
                availability: true,
                photo: true,
              },
            },
          },
        },
      },
    })) as any;

    if (!dossier) {
      return NextResponse.json({ error: 'Dossier not found' }, { status: 404 });
    }

    // Process candidates based on options
    const processedCandidates = dossier.candidates.map((dc) => {
      const candidate = dc.candidate;

      if (anonymize) {
        return {
          ...candidate,
          firstName: `Candidat`,
          lastName: `${dc.candidate.id.slice(-4).toUpperCase()}`,
          email: includeConfidential ? candidate.email : null,
          phone: includeConfidential ? candidate.phone : null,
          photo: null,
        };
      }

      if (!includeConfidential) {
        return {
          ...candidate,
          email: null,
          phone: null,
          tjm: null,
        };
      }

      return candidate;
    });

    // Build export data
    const exportData = {
      title: dossier.title,
      reference: dossier.reference,
      status: dossier.status,
      client: dossier.client,
      description: dossier.description,
      requiredSkills: dossier.requiredSkills,
      preferredSkills: dossier.preferredSkills,
      deadline: dossier.deadline,
      candidates: processedCandidates,
      exportedAt: new Date().toISOString(),
      exportOptions: {
        format,
        includeConfidential,
        anonymize,
      },
    };

    // Generate export based on format
    if (format === 'pdf') {
      // Create a simple HTML representation for PDF
      const _html = generateDossierHTML(exportData);

      // In production, you would use a PDF library like puppeteer, pdfkit, or @react-pdf/renderer
      // For now, we return the data as JSON with appropriate headers
      // The client can render this using a PDF library

      return new NextResponse(JSON.stringify(exportData), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${dossier.title.replace(
            /[^a-z0-9]/gi,
            '_'
          )}.json"`,
          'X-Export-Format': 'pdf-data',
        },
      });
    }

    if (format === 'docx') {
      // For DOCX, return structured data
      // In production, use a library like docx-templates or officegen
      return new NextResponse(JSON.stringify(exportData), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${dossier.title.replace(
            /[^a-z0-9]/gi,
            '_'
          )}.json"`,
          'X-Export-Format': 'docx-data',
        },
      });
    }

    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  } catch (error) {
    console.error('Error exporting dossier:', error);
    return NextResponse.json(
      { error: 'Failed to export dossier' },
      { status: 500 }
    );
  }
}

function generateDossierHTML(data: {
  title: string;
  reference?: string | null;
  client?: { name: string; sector?: string | null } | null;
  description?: string | null;
  requiredSkills?: string[];
  preferredSkills?: string[];
  candidates: Array<{
    firstName?: string;
    lastName?: string;
    title?: string | null;
    skills?: string[];
    yearsOfExperience?: number | null;
  }>;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${data.title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #1a1a1a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
    h2 { color: #374151; margin-top: 30px; }
    .meta { color: #6b7280; font-size: 14px; margin-bottom: 20px; }
    .skills { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill { background: #e5e7eb; padding: 4px 12px; border-radius: 16px; font-size: 12px; }
    .candidate { border: 1px solid #e5e7eb; padding: 16px; margin: 12px 0; border-radius: 8px; }
    .candidate-name { font-weight: bold; font-size: 16px; }
    .candidate-title { color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <h1>${data.title}</h1>
  <div class="meta">
    ${data.reference ? `<p>Référence: ${data.reference}</p>` : ''}
    ${
      data.client
        ? `<p>Client: ${data.client.name}${
            data.client.sector ? ` - ${data.client.sector}` : ''
          }</p>`
        : ''
    }
  </div>

  ${data.description ? `<p>${data.description}</p>` : ''}

  ${
    data.requiredSkills && data.requiredSkills.length > 0
      ? `
    <h2>Compétences requises</h2>
    <div class="skills">
      ${data.requiredSkills
        .map((s) => `<span class="skill">${s}</span>`)
        .join('')}
    </div>
  `
      : ''
  }

  ${
    data.preferredSkills && data.preferredSkills.length > 0
      ? `
    <h2>Compétences souhaitées</h2>
    <div class="skills">
      ${data.preferredSkills
        .map((s) => `<span class="skill">${s}</span>`)
        .join('')}
    </div>
  `
      : ''
  }

  <h2>Candidats (${data.candidates.length})</h2>
  ${data.candidates
    .map(
      (c) => `
    <div class="candidate">
      <div class="candidate-name">${c.firstName} ${c.lastName}</div>
      <div class="candidate-title">${c.title || ''} ${
        c.yearsOfExperience ? `- ${c.yearsOfExperience} ans d'expérience` : ''
      }</div>
      ${
        c.skills && c.skills.length > 0
          ? `
        <div class="skills" style="margin-top: 8px;">
          ${c.skills.map((s) => `<span class="skill">${s}</span>`).join('')}
        </div>
      `
          : ''
      }
    </div>
  `
    )
    .join('')}
</body>
</html>
  `;
}
