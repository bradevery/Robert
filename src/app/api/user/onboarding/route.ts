import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getAuthScope } from '@/lib/auth-scope';
import prisma from '@/lib/prisma';

const onboardingSchema = z.object({
  step: z.number().optional(),
  done: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  try {
    const scope = await getAuthScope();

    if (!scope) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { step: _step, done: _done } = onboardingSchema.parse(body);

    const userId = scope.userId;

    // Check if UserSettings exists
    const settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (settings) {
      await prisma.userSettings.update({
        where: { userId },
        data: {},
      });
    } else {
      await prisma.userSettings.create({
        data: { userId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    console.error('Onboarding update error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const scope = await getAuthScope();

    if (!scope) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const settings = await prisma.userSettings.findUnique({
      where: { userId: scope.userId },
    });

    return NextResponse.json({
      step: 1, // Default to step 1
      done: false,
      ...settings,
    });
  } catch (error) {
    console.error('Onboarding get error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}
