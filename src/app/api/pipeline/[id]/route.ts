import { NextRequest, NextResponse } from 'next/server';

import { getAuthScope } from '@/lib/auth-scope';
import { prisma } from '@/lib/prisma';

// GET - Fetch a specific pipeline session
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scope = await getAuthScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await prisma.pipelineSession.findFirst({
      where: {
        id: params.id,
        userId: scope.userId,
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error fetching pipeline session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pipeline session' },
      { status: 500 }
    );
  }
}

// PATCH - Update a pipeline session (advance step, save data)
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
    const {
      currentStep,
      status,
      ficheMission,
      scoreResult,
      prequalifData,
      dcHarmonise,
      cvOptimise,
      propaleData,
      coachingData,
      selectedCandidateId,
      dossierId,
    } = body;

    // Verify ownership
    const existing = await prisma.pipelineSession.findFirst({
      where: { id: params.id, userId: scope.userId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = await prisma.pipelineSession.update({
      where: { id: params.id },
      data: {
        ...(currentStep !== undefined && { currentStep }),
        ...(status !== undefined && { status }),
        ...(ficheMission !== undefined && { ficheMission }),
        ...(scoreResult !== undefined && { scoreResult }),
        ...(prequalifData !== undefined && { prequalifData }),
        ...(dcHarmonise !== undefined && { dcHarmonise }),
        ...(cvOptimise !== undefined && { cvOptimise }),
        ...(propaleData !== undefined && { propaleData }),
        ...(coachingData !== undefined && { coachingData }),
        ...(selectedCandidateId !== undefined && { selectedCandidateId }),
        ...(dossierId !== undefined && { dossierId }),
      },
    });

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error updating pipeline session:', error);
    return NextResponse.json(
      { error: 'Failed to update pipeline session' },
      { status: 500 }
    );
  }
}
