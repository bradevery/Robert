import { NextRequest, NextResponse } from 'next/server';

import { getAuthScope, scopeWhere } from '@/lib/auth-scope';
import { prisma } from '@/lib/prisma';

// POST - Add a candidate to a dossier
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
    const { candidateId, matchScore, notes, status } = body;

    if (!candidateId) {
      return NextResponse.json(
        { error: 'candidateId is required' },
        { status: 400 }
      );
    }

    const dossier = await prisma.dossier.findFirst({
      where: { id: params.id, ...scopeWhere(scope) },
      select: { id: true },
    });

    if (!dossier) {
      return NextResponse.json({ error: 'Dossier not found' }, { status: 404 });
    }

    // Check if already exists
    const existing = await prisma.dossierCandidate.findFirst({
      where: {
        dossierId: params.id,
        candidateId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Candidate already added to this dossier' },
        { status: 409 }
      );
    }

    const dossierCandidate = await prisma.dossierCandidate.create({
      data: {
        dossierId: params.id,
        candidateId,
        matchScore,
        notes,
        status: status || 'proposed',
      },
      include: {
        candidate: true,
      },
    });

    return NextResponse.json({ dossierCandidate }, { status: 201 });
  } catch (error) {
    console.error('Error adding candidate to dossier:', error);
    return NextResponse.json(
      { error: 'Failed to add candidate to dossier' },
      { status: 500 }
    );
  }
}

// PATCH - Update a candidate's matchScore in a dossier
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scope = await getAuthScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { candidateId, matchScore } = body;

    if (!candidateId || matchScore == null) {
      return NextResponse.json(
        { error: 'candidateId and matchScore are required' },
        { status: 400 }
      );
    }

    const dossier = await prisma.dossier.findFirst({
      where: { id: params.id, ...scopeWhere(scope) },
      select: { id: true },
    });

    if (!dossier) {
      return NextResponse.json({ error: 'Dossier not found' }, { status: 404 });
    }

    const updated = await prisma.dossierCandidate.updateMany({
      where: {
        dossierId: params.id,
        candidateId,
      },
      data: {
        matchScore: Math.round(matchScore),
      },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { error: 'Candidate not found in this dossier' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating match score:', error);
    return NextResponse.json(
      { error: 'Failed to update match score' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a candidate from a dossier
export async function DELETE(request: NextRequest) {
  try {
    const scope = await getAuthScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');

    if (!candidateId) {
      return NextResponse.json(
        { error: 'candidateId is required' },
        { status: 400 }
      );
    }

    const dossierId = request.url
      .split('/dossiers/')[1]
      .split('/candidates')[0];
    const dossier = await prisma.dossier.findFirst({
      where: { id: dossierId, ...scopeWhere(scope) },
      select: { id: true },
    });

    if (!dossier) {
      return NextResponse.json({ error: 'Dossier not found' }, { status: 404 });
    }

    await prisma.dossierCandidate.deleteMany({
      where: {
        dossierId,
        candidateId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing candidate from dossier:', error);
    return NextResponse.json(
      { error: 'Failed to remove candidate from dossier' },
      { status: 500 }
    );
  }
}
