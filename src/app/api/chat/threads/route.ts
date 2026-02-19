'use server';

import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

// GET - Fetch all threads for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const threadModule = searchParams.get('module');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const threads = await prisma.chatThread.findMany({
      where: {
        userId,
        ...(threadModule && { module: threadModule }),
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ threads });
  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  }
}

// POST - Create a new thread
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      title,
      module: threadModule,
      dossierId,
      initialMessage,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const thread = await prisma.chatThread.create({
      data: {
        userId,
        title: title || 'Nouvelle conversation',
        module: threadModule,
        dossierId,
        messages: initialMessage
          ? {
              create: {
                role: initialMessage.role,
                content: initialMessage.content,
                metadata: initialMessage.metadata || {},
              },
            }
          : undefined,
      },
      include: {
        messages: true,
      },
    });

    return NextResponse.json({ thread });
  } catch (error) {
    console.error('Error creating thread:', error);
    return NextResponse.json(
      { error: 'Failed to create thread' },
      { status: 500 }
    );
  }
}
