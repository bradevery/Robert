import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { sendVerificationEmail } from '@/lib/email';
import prisma from '@/lib/prisma';

const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte existe déjà avec cet email' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create verification token
    const emailVerificationToken = crypto.randomUUID();

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email: email.toLowerCase(),
        password: hashedPassword,
        emailVerificationToken,
        emailVerified: false,
      },
    });

    // Send verification email (non-blocking — don't let email failure block registration)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    sendVerificationEmail(user.email!, firstName, emailVerificationToken).catch(
      (err) => console.error('Failed to send verification email:', err)
    );

    return NextResponse.json({
      success: true,
      message: 'Compte créé. Vérifiez votre email.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 }
    );
  }
}
