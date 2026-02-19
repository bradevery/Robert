import { NextRequest, NextResponse } from 'next/server';

import { getAuthScope, scopeWhere } from '@/lib/auth-scope';
import { prisma } from '@/lib/prisma';

// GET - Fetch a specific client
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scope = await getAuthScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await prisma.client.findFirst({
      where: { id: params.id, ...scopeWhere(scope) },
      include: {
        contacts: true,
        dossiers: {
          orderBy: { updatedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

// PATCH - Update a client
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

    const existing = await prisma.client.findFirst({
      where: { id: params.id, ...scopeWhere(scope) },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const client = await prisma.client.update({
      where: { id: params.id },
      data: body,
      include: {
        contacts: true,
      },
    });

    return NextResponse.json({ client });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a client
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scope = await getAuthScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.client.findFirst({
      where: { id: params.id, ...scopeWhere(scope) },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    await prisma.client.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}
