import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import prisma from '@/lib/prisma';

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    // Find user with valid token
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(password, 12);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la réinitialisation' },
      { status: 500 }
    );
  }
}
