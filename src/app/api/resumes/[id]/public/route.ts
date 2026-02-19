import { NextRequest, NextResponse } from 'next/server';

import { getAuthScope } from '@/lib/auth-scope';
import prismadb from '@/lib/prisma.db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scope = await getAuthScope();

    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isPublic } = await request.json();

    const resume = await prismadb.resume.findFirst({
      where: {
        id: params.id,
        userId: scope.userId,
      },
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Générer un slug unique si le CV devient public
    let slug = resume.slug;
    if (isPublic && !slug) {
      slug = `${resume.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
    }

    // Mettre à jour le CV
    const updatedResume = await prismadb.resume.update({
      where: { id: params.id },
      data: {
        isPublic,
        slug: slug || null,
      },
    });

    return NextResponse.json(updatedResume);
  } catch (error) {
    console.error('Error updating resume public status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Récupérer le CV public
    const resume = await prismadb.resume.findFirst({
      where: {
        id: params.id,
        isPublic: true,
      },
      include: {
        user: {
          select: {
            name: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Enregistrer la vue
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await prismadb.resumeView.create({
      data: {
        resumeId: resume.id,
        ipAddress,
        userAgent,
      },
    });

    // Récupérer le nombre total de vues
    const viewCount = await prismadb.resumeView.count({
      where: { resumeId: resume.id },
    });

    return NextResponse.json({
      ...resume,
      viewCount,
    });
  } catch (error) {
    console.error('Error fetching public resume:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
