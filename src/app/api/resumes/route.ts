/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

import { getAuthScope } from '@/lib/auth-scope';
import { prisma } from '@/lib/prisma';

// GET - Fetch all resumes
export async function GET() {
  try {
    const scope = await getAuthScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: scope.userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        isPublic: true,
        isLocked: true,
        atsScore: true,
        metadata: true,
      },
    });

    return NextResponse.json({ resumes });
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resumes' },
      { status: 500 }
    );
  }
}

// POST - Create a new resume (Dossier de Compétences)
export async function POST(request: NextRequest) {
  try {
    const scope = await getAuthScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, candidateId, clientId, description } = body;

    // 1. Fetch Candidate Data if provided
    let candidateData: any = {};
    if (candidateId) {
      const candidate = await prisma.candidate.findUnique({
        where: { id: candidateId },
      });
      if (candidate) {
        candidateData = {
          basics: {
            firstName: candidate.firstName,
            lastName: candidate.lastName,
            email: candidate.email,
            phone: candidate.phone,
            title: candidate.title,
            summary: candidate.summary || candidate.notes,
            location: candidate.location,
          },
          // Map other candidate fields to resume sections as needed
          sections: {
            skills: {
              id: 'skills',
              name: 'Compétences',
              type: 'skills',
              visible: true,
              items: candidate.skills.map((skill, index) => ({
                id: `skill-${index}`,
                name: skill,
                level: '',
              })),
            },
            languages: {
              id: 'languages',
              name: 'Langues',
              type: 'languages',
              visible: true,
              items: Array.isArray(candidate.languages)
                ? candidate.languages
                : [],
            },
          },
        };
      }
    }

    // 2. Create Resume
    const resume = await prisma.resume.create({
      data: {
        userId: scope.userId,
        title:
          title ||
          (candidateData?.basics?.firstName
            ? `Dossier - ${candidateData.basics.firstName} ${candidateData.basics.lastName}`
            : 'Nouveau Dossier'),
        slug: `dossier-${Date.now()}`, // Simple slug generation
        data: candidateData,
        metadata: {
          clientId,
          candidateId,
          description,
        },
      },
    });

    // 3. Link Resume to Candidate if applicable
    if (candidateId) {
      await prisma.candidate.update({
        where: { id: candidateId },
        data: { resumeId: resume.id },
      });
    }

    return NextResponse.json({ resume }, { status: 201 });
  } catch (error) {
    console.error('Error creating resume:', error);
    return NextResponse.json(
      { error: 'Failed to create resume' },
      { status: 500 }
    );
  }
}
