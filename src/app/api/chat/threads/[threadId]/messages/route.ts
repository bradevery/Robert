'use server';

import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

// POST - Add a message to a thread
export async function POST(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const { threadId } = params;
    const body = await request.json();
    const { role, content, metadata } = body;

    if (!role || !content) {
      return NextResponse.json(
        { error: 'role and content are required' },
        { status: 400 }
      );
    }

    // Verify thread exists
    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // Create message and update thread timestamp
    const [message] = await prisma.$transaction([
      prisma.chatMessage.create({
        data: {
          threadId,
          role,
          content,
          metadata: metadata || {},
        },
      }),
      prisma.chatThread.update({
        where: { id: threadId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error adding message:', error);
    return NextResponse.json(
      { error: 'Failed to add message' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific message
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json(
        { error: 'messageId is required' },
        { status: 400 }
      );
    }

    await prisma.chatMessage.delete({
      where: { id: messageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
