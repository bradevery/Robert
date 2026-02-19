import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { getAuthScope } from '@/lib/auth-scope';
import { sendCandidateInvitationEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, title, dossierId } = body;

    if (!email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    const scope = await getAuthScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [firstName, ...rest] = String(name || '')
      .trim()
      .split(' ');
    const lastName = rest.join(' ') || 'Candidat';

    const candidate = email
      ? await prisma.candidate.upsert({
          where: { email },
          create: {
            userId: scope.userId,
            orgId: scope.organizationId,
            firstName: firstName || 'Candidat',
            lastName,
            email,
            title: title || 'Non specifie',
            skills: [],
            tools: [],
            certifications: [],
            languages: [],
          },
          update: {
            firstName: firstName || 'Candidat',
            lastName,
            title: title || undefined,
          },
        })
      : null;

    const invitation = await prisma.candidateInvitation.create({
      data: {
        candidateId: candidate?.id,
        dossierId: dossierId || null,
        email,
        name,
        orgId: scope.organizationId,
        token: uuidv4(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.notification.create({
      data: {
        userId: scope.userId,
        type: 'info',
        title: 'Invitation envoyee',
        message: `Invitation envoyee a ${email}`,
        link: '/mes-candidats',
      },
    });

    // Fetch dossier title for the email if dossierId is provided
    let dossierTitle: string | undefined;
    if (dossierId) {
      const dossier = await prisma.dossier.findUnique({
        where: { id: dossierId },
        select: { title: true },
      });
      dossierTitle = dossier?.title ?? undefined;
    }

    // Send invitation email (non-blocking)
    sendCandidateInvitationEmail(
      email,
      name || 'Candidat',
      invitation.token,
      dossierTitle
    ).catch((err) => console.error('Failed to send invitation email:', err));

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    );
  }
}
