'use server';

import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

// GET - Fetch a specific thread with messages
export async function GET(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const { threadId } = params;

    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    return NextResponse.json({ thread });
  } catch (error) {
    console.error('Error fetching thread:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thread' },
      { status: 500 }
    );
  }
}

// PATCH - Update thread title or metadata
export async function PATCH(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const { threadId } = params;
    const body = await request.json();
    const { title, module, dossierId } = body;

    const thread = await prisma.chatThread.update({
      where: { id: threadId },
      data: {
        ...(title && { title }),
        ...(module !== undefined && { module }),
        ...(dossierId !== undefined && { dossierId }),
      },
    });

    return NextResponse.json({ thread });
  } catch (error) {
    console.error('Error updating thread:', error);
    return NextResponse.json(
      { error: 'Failed to update thread' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a thread and its messages
export async function DELETE(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const { threadId } = params;

    // Delete messages first (cascade should handle this, but being explicit)
    await prisma.chatMessage.deleteMany({
      where: { threadId },
    });

    await prisma.chatThread.delete({
      where: { id: threadId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting thread:', error);
    return NextResponse.json(
      { error: 'Failed to delete thread' },
      { status: 500 }
    );
  }
}
