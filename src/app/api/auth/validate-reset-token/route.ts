import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

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
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Validate reset token error:', error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
