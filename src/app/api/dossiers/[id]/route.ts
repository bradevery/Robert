import { NextRequest, NextResponse } from 'next/server';

import { getAuthScope, scopeWhere } from '@/lib/auth-scope';
import { prisma } from '@/lib/prisma';

// GET - Fetch a specific dossier with all details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scope = await getAuthScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dossier = await prisma.dossier.findFirst({
      where: { id: params.id, ...scopeWhere(scope) },
      include: {
        client: true,
        candidates: {
          include: {
            candidate: true,
          },
        },
        aoAnalysis: true,
        propales: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!dossier) {
      return NextResponse.json({ error: 'Dossier not found' }, { status: 404 });
    }

    return NextResponse.json({ dossier });
  } catch (error) {
    console.error('Error fetching dossier:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dossier' },
      { status: 500 }
    );
  }
}

// PATCH - Update a dossier
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
    const { deadline, ...rest } = body;

    const existing = await prisma.dossier.findFirst({
      where: { id: params.id, ...scopeWhere(scope) },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Dossier not found' }, { status: 404 });
    }

    const dossier = await prisma.dossier.update({
      where: { id: params.id },
      data: {
        ...rest,
        ...(deadline && { deadline: new Date(deadline) }),
      },
      include: {
        client: {
          select: { id: true, name: true, logo: true },
        },
      },
    });

    return NextResponse.json({ dossier });
  } catch (error) {
    console.error('Error updating dossier:', error);
    return NextResponse.json(
      { error: 'Failed to update dossier' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a dossier
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scope = await getAuthScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.dossier.findFirst({
      where: { id: params.id, ...scopeWhere(scope) },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Dossier not found' }, { status: 404 });
    }

    // Delete related records first
    await prisma.$transaction([
      prisma.dossierCandidate.deleteMany({ where: { dossierId: params.id } }),
      prisma.aoAnalysis.deleteMany({ where: { dossierId: params.id } }),
      prisma.propale.deleteMany({ where: { dossierId: params.id } }),
      prisma.dossier.delete({ where: { id: params.id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting dossier:', error);
    return NextResponse.json(
      { error: 'Failed to delete dossier' },
      { status: 500 }
    );
  }
}
