import { NextRequest, NextResponse } from 'next/server';

import { getAuthScope, scopeWhere } from '@/lib/auth-scope';
import { prisma } from '@/lib/prisma';

// GET - Fetch all dossiers with optional filtering
export async function GET(request: NextRequest) {
  try {
    const scope = await getAuthScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where = {
      ...scopeWhere(scope),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { reference: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(status && { status }),
      ...(clientId && { clientId }),
    };

    const [dossiers, total] = await Promise.all([
      prisma.dossier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          client: {
            select: { id: true, name: true, logo: true },
          },
          _count: {
            select: { candidates: true },
          },
        },
      }),
      prisma.dossier.count({ where }),
    ]);

    return NextResponse.json({
      dossiers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching dossiers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dossiers' },
      { status: 500 }
    );
  }
}

// POST - Create a new dossier
export async function POST(request: NextRequest) {
  try {
    const scope = await getAuthScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      reference,
      clientId,
      description,
      requirements,
      skills,
      budget,
      deadline,
      status,
    } = body;

    if (!title || !clientId) {
      return NextResponse.json(
        { error: 'title and clientId are required' },
        { status: 400 }
      );
    }

    // Generate reference if not provided
    const generatedReference =
      reference || `DOS-${Date.now().toString(36).toUpperCase()}`;

    const dossier = await prisma.dossier.create({
      data: {
        userId: scope.userId,
        orgId: scope.organizationId,
        title,
        reference: generatedReference,
        clientId,
        description,
        requiredSkills: requirements || [],
        preferredSkills: skills || [],
        budget,
        deadline: deadline ? new Date(deadline) : undefined,
        status: status || 'draft',
      },
      include: {
        client: {
          select: { id: true, name: true, logo: true },
        },
      },
    });

    return NextResponse.json({ dossier }, { status: 201 });
  } catch (error) {
    console.error('Error creating dossier:', error);
    return NextResponse.json(
      { error: 'Failed to create dossier' },
      { status: 500 }
    );
  }
}
