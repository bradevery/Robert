import { NextRequest, NextResponse } from 'next/server';

import { getAuthScope } from '@/lib/auth-scope';
import { prisma } from '@/lib/prisma';

// GET - Fetch user settings
export async function GET(_request: NextRequest) {
  try {
    const scope = await getAuthScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = scope.userId;

    const settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      // Return default settings
      return NextResponse.json({
        settings: {
          theme: 'light',
          language: 'fr',
          notifications: {
            emailNewMatch: true,
            emailWeeklyDigest: true,
            emailCandidateUpdate: false,
            pushNewMatch: true,
            pushMessages: true,
            pushReminders: false,
            marketingEmails: false,
          },
          defaultCVTemplate: 'modern',
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const scope = await getAuthScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = scope.userId;
    const { userId: _ignored, ...settingsData } = body;

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: settingsData,
      create: {
        userId,
        ...settingsData,
      },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
