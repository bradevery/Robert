import { NextRequest, NextResponse } from 'next/server';

import { getAuthScope, scopeWhere } from '@/lib/auth-scope';
import { prisma } from '@/lib/prisma';

// GET - Fetch all clients with optional filtering
export async function GET(request: NextRequest) {
  try {
    const scope = await getAuthScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where = {
      ...scopeWhere(scope),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { sector: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(status && { status: status as 'prospect' | 'active' | 'inactive' }),
    };

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          contacts: true,
          _count: {
            select: { dossiers: true },
          },
        },
      }),
      prisma.client.count({ where }),
    ]);

    return NextResponse.json({
      clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST - Create a new client
export async function POST(request: NextRequest) {
  try {
    const scope = await getAuthScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, sector, website, address, logo, status, notes, contacts } =
      body;

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const client = await prisma.client.create({
      data: {
        userId: scope.userId,
        orgId: scope.organizationId,
        name,
        sector,
        website,
        address,
        logo,
        status: status || 'prospect',
        notes,
        contacts: contacts?.length
          ? {
              create: contacts,
            }
          : undefined,
      },
      include: {
        contacts: true,
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
