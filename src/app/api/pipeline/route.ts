import { NextResponse } from 'next/server';

import { getAuthScope } from '@/lib/auth-scope';
import { prisma } from '@/lib/prisma';

// GET - List pipeline sessions for current user
export async function GET() {
  try {
    const scope = await getAuthScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await prisma.pipelineSession.findMany({
      where: {
        userId: scope.userId,
        status: { in: ['active', 'paused'] },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching pipeline sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pipeline sessions' },
      { status: 500 }
    );
  }
}

// POST - Create a new pipeline session
export async function POST() {
  try {
    const scope = await getAuthScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await prisma.pipelineSession.create({
      data: {
        userId: scope.userId,
        orgId: scope.organizationId,
        currentStep: 1,
        status: 'active',
      },
    });

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error creating pipeline session:', error);
    return NextResponse.json(
      { error: 'Failed to create pipeline session' },
      { status: 500 }
    );
  }
}
