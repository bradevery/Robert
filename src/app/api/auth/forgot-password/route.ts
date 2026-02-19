import { NextResponse } from 'next/server';
import { z } from 'zod';

import { sendPasswordResetEmail } from '@/lib/email';
import prisma from '@/lib/prisma';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Generate reset token
    const resetToken = crypto.randomUUID();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save token to user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordTokenExpiry: resetTokenExpiry,
      },
    });

    // Send reset email (non-blocking)
    sendPasswordResetEmail(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      user.email!,
      user.name || user.firstName || 'Utilisateur',
      resetToken
    ).catch((err) => console.error('Failed to send reset email:', err));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi" },
      { status: 500 }
    );
  }
}
