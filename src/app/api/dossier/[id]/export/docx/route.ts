import Docxtemplater from 'docxtemplater';
import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import PizZip from 'pizzip';

import { prisma } from '@/lib/prisma';

import { auth } from '@/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const dossierId = params.id;

  // Fetch dossier data
  const dossier = await prisma.dossier.findUnique({
    where: { id: dossierId },
    include: {
      candidates: {
        include: {
          candidate: true,
        },
      },
      client: true,
      propales: true,
    },
  });

  if (!dossier) {
    return new NextResponse('Dossier not found', { status: 404 });
  }

  // Load a template (Placeholder mechanism - normally fetched from DB/S3)
  const templatePath = path.resolve(
    process.cwd(),
    'public',
    'templates',
    'default.docx'
  );

  if (!fs.existsSync(templatePath)) {
    // If no template file, we'll return a JSON response with data to prove the endpoint connects
    // and instruct the user to upload a template.
    return NextResponse.json(
      {
        error: 'Template file not found',
        message: "Please upload a 'default.docx' to 'public/templates/'.",
        dossierData: {
          title: dossier.title,
          client: dossier.client?.name,
          candidates: dossier.candidates.length,
        },
      },
      { status: 404 }
    );
  }

  try {
    const content = fs.readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Render the document
    doc.render({
      title: dossier.title,
      clientName: dossier.client?.name || 'Client',
      date: new Date().toLocaleDateString(),
      candidates: dossier.candidates.map((c) => ({
        firstName: c.candidate.firstName,
        lastName: c.candidate.lastName,
        title: c.candidate.title,
        summary: c.candidate.summary,
      })),
    });

    const buf = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    return new NextResponse(buf, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Dossier-${
          dossier.reference || dossierId
        }.docx"`,
      },
    });
  } catch (error) {
    console.error('Error generating DOCX:', error);
    return new NextResponse('Error generating document', { status: 500 });
  }
}
