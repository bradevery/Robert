import { NextRequest, NextResponse } from 'next/server';

import { getAuthScope } from '@/lib/auth-scope';
import { prisma } from '@/lib/prisma';

// GET - Fetch organization ESN profile
export async function GET() {
  try {
    const scope = await getAuthScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!scope.organizationId) {
      return NextResponse.json({ organization: null });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: scope.organizationId },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        country: true,
        primaryColor: true,
        secondaryColor: true,
        fontFamily: true,
        pitch: true,
        siret: true,
        website: true,
        tonCommunication: true,
      },
    });

    return NextResponse.json({ organization });
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}

// PUT - Update organization ESN profile
export async function PUT(request: NextRequest) {
  try {
    const scope = await getAuthScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      logoUrl,
      primaryColor,
      secondaryColor,
      fontFamily,
      pitch,
      siret,
      website,
      tonCommunication,
    } = body;

    // If user has no org, create one
    if (!scope.organizationId) {
      const slug = (name || 'mon-esn')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const organization = await prisma.organization.create({
        data: {
          name: name || 'Mon ESN',
          slug: `${slug}-${Date.now()}`,
          logoUrl,
          primaryColor: primaryColor || '#2563EB',
          secondaryColor: secondaryColor || '#1E40AF',
          fontFamily: fontFamily || 'Inter',
          pitch,
          siret,
          website,
          tonCommunication: tonCommunication || 'professionnel',
          users: { connect: { id: scope.userId } },
          members: {
            create: {
              userId: scope.userId,
              role: 'owner',
              status: 'active',
            },
          },
        },
      });

      // Link user to org
      await prisma.user.update({
        where: { id: scope.userId },
        data: { organizationId: organization.id },
      });

      return NextResponse.json({ organization });
    }

    // Update existing org
    const organization = await prisma.organization.update({
      where: { id: scope.organizationId },
      data: {
        ...(name !== undefined && { name }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(primaryColor !== undefined && { primaryColor }),
        ...(secondaryColor !== undefined && { secondaryColor }),
        ...(fontFamily !== undefined && { fontFamily }),
        ...(pitch !== undefined && { pitch }),
        ...(siret !== undefined && { siret }),
        ...(website !== undefined && { website }),
        ...(tonCommunication !== undefined && { tonCommunication }),
      },
    });

    return NextResponse.json({ organization });
  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}
