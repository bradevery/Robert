import { NextResponse } from 'next/server';
import { z } from 'zod';

import prisma from '@/lib/prisma';

const verifyEmailSchema = z.object({
  token: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = verifyEmailSchema.parse(body);

    // Find user with verification token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 400 });
    }

    // Already verified
    if (user.emailVerified) {
      return NextResponse.json({ success: true });
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 400 });
    }

    console.error('Verify email error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}
