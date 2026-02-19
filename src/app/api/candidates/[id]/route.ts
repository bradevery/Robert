import { NextRequest, NextResponse } from 'next/server';

import { getAuthScope, scopeWhere } from '@/lib/auth-scope';
import { prisma } from '@/lib/prisma';

// GET - Fetch a specific candidate
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scope = await getAuthScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const candidate = await prisma.candidate.findFirst({
      where: { id: params.id, ...scopeWhere(scope) },
      include: {
        dossierCandidates: {
          include: {
            dossier: true,
          },
        },
        documents: true,
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ candidate });
  } catch (error) {
    console.error('Error fetching candidate:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidate' },
      { status: 500 }
    );
  }
}

// PATCH - Update a candidate
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

    const existing = await prisma.candidate.findFirst({
      where: { id: params.id, ...scopeWhere(scope) },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    const candidate = await prisma.candidate.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json({ candidate });
  } catch (error) {
    console.error('Error updating candidate:', error);
    return NextResponse.json(
      { error: 'Failed to update candidate' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a candidate
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scope = await getAuthScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.candidate.findFirst({
      where: { id: params.id, ...scopeWhere(scope) },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    await prisma.candidate.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    return NextResponse.json(
      { error: 'Failed to delete candidate' },
      { status: 500 }
    );
  }
}
