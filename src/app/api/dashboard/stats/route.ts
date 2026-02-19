import { NextResponse } from 'next/server';

import { getAuthScope, scopeWhere } from '@/lib/auth-scope';
import { prisma } from '@/lib/prisma';

// GET - Fetch dashboard statistics
export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const scope = await getAuthScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      totalDossiers,
      dossiersThisMonth,
      completedDossiers,
      inProgressDossiers,
      totalCandidates,
      newCandidatesThisMonth,
      totalClients,
      activeClients,
      recentDossiers,
      recentCandidates,
      recentInvitations,
      pendingInvitationsCount,
      expiringInvitations,
      unreadNotificationsCount,
      recentNotifications,
      draftDossiers,
      sentDossiers,
      lowScoreDossiers,
      staleInProgressDossiers,
    ] = await Promise.all([
      prisma.dossier.count({ where: { ...scopeWhere(scope) } }),
      prisma.dossier.count({
        where: {
          ...scopeWhere(scope),
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.dossier.count({
        where: { status: 'won', ...scopeWhere(scope) },
      }),
      prisma.dossier.count({
        where: { status: 'inProgress', ...scopeWhere(scope) },
      }),
      prisma.candidate.count({ where: { ...scopeWhere(scope) } }),
      prisma.candidate.count({
        where: {
          ...scopeWhere(scope),
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.client.count({ where: { ...scopeWhere(scope) } }),
      prisma.client.count({
        where: { status: 'active', ...scopeWhere(scope) },
      }),
      // Recent dossiers with client info
      prisma.dossier.findMany({
        take: 10,
        orderBy: { updatedAt: 'desc' },
        where: { ...scopeWhere(scope) },
        include: {
          client: {
            select: { id: true, name: true, logo: true },
          },
          _count: {
            select: { candidates: true },
          },
        },
      }),
      // Recent candidates
      prisma.candidate.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        where: { ...scopeWhere(scope) },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          title: true,
          status: true,
          availability: true,
          updatedAt: true,
        },
      }),
      prisma.candidateInvitation.findMany({
        take: 5,
        orderBy: { sentAt: 'desc' },
        where: scope.organizationId
          ? { orgId: scope.organizationId }
          : { candidate: { userId: scope.userId } },
        include: {
          candidate: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.candidateInvitation.count({
        where: scope.organizationId
          ? { status: 'pending', orgId: scope.organizationId }
          : { status: 'pending', candidate: { userId: scope.userId } },
      }),
      prisma.candidateInvitation.findMany({
        take: 5,
        orderBy: { expiresAt: 'asc' },
        where: {
          status: 'pending',
          ...(scope.organizationId
            ? { orgId: scope.organizationId }
            : { candidate: { userId: scope.userId } }),
          expiresAt: { lte: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000) },
        },
        include: {
          candidate: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.notification.count({
        where: { userId: scope.userId, isRead: false },
      }),
      prisma.notification.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        where: { userId: scope.userId },
        select: {
          id: true,
          title: true,
          message: true,
          createdAt: true,
        },
      }),
      prisma.dossier.findMany({
        take: 3,
        orderBy: { updatedAt: 'desc' },
        where: { status: 'draft', ...scopeWhere(scope) },
        include: {
          client: { select: { name: true } },
        },
      }),
      prisma.dossier.findMany({
        take: 3,
        orderBy: { updatedAt: 'desc' },
        where: { status: 'submitted', ...scopeWhere(scope) },
        include: {
          client: { select: { name: true } },
        },
      }),
      prisma.dossier.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        where: { score: { lt: 60 }, ...scopeWhere(scope) },
        include: {
          client: { select: { name: true } },
        },
      }),
      prisma.dossier.findMany({
        take: 5,
        orderBy: { updatedAt: 'asc' },
        where: {
          status: 'inProgress',
          updatedAt: { lt: sevenDaysAgo },
          ...scopeWhere(scope),
        },
        include: {
          client: { select: { name: true } },
        },
      }),
    ]);

    // Transform dossiers to match frontend expectations
    const dossiers = recentDossiers.map((dossier) => ({
      id: dossier.id,
      candidateName: `${dossier._count.candidates} candidat(s)`,
      candidateEmail: '',
      title: dossier.title,
      client: dossier.client?.name,
      template: 'Template Standard',
      status: mapDossierStatus(dossier.status),
      completionRate: calculateCompletionRate(
        dossier.status,
        dossier.matchedProfiles,
        dossier.requiredProfiles
      ),
      lastModified: dossier.updatedAt.toISOString().split('T')[0],
      createdAt: dossier.createdAt.toISOString().split('T')[0],
    }));

    // Mock invitations for now (could be expanded with a real invitation model)
    const invitations = recentInvitations.map((invitation) => ({
      id: invitation.id,
      candidateName: invitation.candidate
        ? `${invitation.candidate.firstName} ${invitation.candidate.lastName}`
        : invitation.name ?? 'Candidat',
      candidateEmail: invitation.email,
      status: invitation.status,
      sentAt: invitation.sentAt.toISOString(),
      expiresAt: invitation.expiresAt.toISOString(),
    }));

    const avgCompletionRate = recentDossiers.length
      ? Math.round(
          recentDossiers.reduce((sum, dossier) => {
            if (dossier.requiredProfiles === 0) return sum + 50;
            return (
              sum +
              Math.min(
                100,
                Math.round(
                  (dossier.matchedProfiles / dossier.requiredProfiles) * 100
                )
              )
            );
          }, 0) / recentDossiers.length
        )
      : 0;

    const completedDurations = recentDossiers
      .filter(
        (dossier) => dossier.status === 'won' || dossier.status === 'submitted'
      )
      .map(
        (dossier) => dossier.updatedAt.getTime() - dossier.createdAt.getTime()
      );
    const avgCreationTimeMinutes = completedDurations.length
      ? Math.round(
          completedDurations.reduce((sum, ms) => sum + ms, 0) /
            completedDurations.length /
            (1000 * 60)
        )
      : 0;

    return NextResponse.json({
      stats: {
        totalDCs: totalDossiers,
        dossiersThisMonth,
        pendingInvitations: pendingInvitationsCount,
        completedThisMonth: completedDossiers,
        templatesCount: 4, // Mock for now
        totalCandidates,
        newCandidatesThisMonth,
        totalClients,
        activeClients,
        inProgressDossiers,
        avgCreationTimeMinutes,
        avgCompletionRate,
      },
      dossiers,
      invitations,
      templates: [
        {
          id: '1',
          name: 'Template Standard',
          usageCount: totalDossiers,
          lastUsed: new Date().toISOString().split('T')[0],
        },
        {
          id: '2',
          name: 'Template BNP Paribas',
          client: 'BNP Paribas',
          usageCount: 0,
          lastUsed: new Date().toISOString().split('T')[0],
        },
        {
          id: '3',
          name: 'Template Société Générale',
          client: 'Société Générale',
          usageCount: 0,
          lastUsed: new Date().toISOString().split('T')[0],
        },
        {
          id: '4',
          name: 'Template AXA',
          client: 'AXA',
          usageCount: 0,
          lastUsed: new Date().toISOString().split('T')[0],
        },
      ],
      pipeline: {
        draft: {
          count: await prisma.dossier.count({ where: { status: 'draft' } }),
          items: draftDossiers.map((dossier) => ({
            id: dossier.id,
            title: dossier.title,
            client: dossier.client?.name ?? null,
            updatedAt: dossier.updatedAt.toISOString(),
          })),
        },
        in_progress: {
          count: inProgressDossiers,
          items: recentDossiers
            .filter((dossier) => dossier.status === 'inProgress')
            .slice(0, 3)
            .map((dossier) => ({
              id: dossier.id,
              title: dossier.title,
              client: dossier.client?.name ?? null,
              updatedAt: dossier.updatedAt.toISOString(),
            })),
        },
        completed: {
          count: completedDossiers,
          items: recentDossiers
            .filter((dossier) => dossier.status === 'won')
            .slice(0, 3)
            .map((dossier) => ({
              id: dossier.id,
              title: dossier.title,
              client: dossier.client?.name ?? null,
              updatedAt: dossier.updatedAt.toISOString(),
            })),
        },
        sent: {
          count: sentDossiers.length,
          items: sentDossiers.map((dossier) => ({
            id: dossier.id,
            title: dossier.title,
            client: dossier.client?.name ?? null,
            updatedAt: dossier.updatedAt.toISOString(),
          })),
        },
      },
      alerts: [
        ...expiringInvitations.map((invitation) => ({
          id: `invite-${invitation.id}`,
          type: 'invite_expiring',
          title: `Invitation expire bientot`,
          description: invitation.candidate
            ? `${invitation.candidate.firstName} ${invitation.candidate.lastName}`
            : invitation.name ?? invitation.email,
          severity: 'warning',
          ctaLabel: 'Relancer',
          ctaHref: '/mes-candidats',
        })),
        ...staleInProgressDossiers.map((dossier) => ({
          id: `stale-${dossier.id}`,
          type: 'stale',
          title: `Dossier en attente: ${dossier.title}`,
          description: 'Aucune mise a jour depuis 7 jours',
          severity: 'warning',
          ctaLabel: 'Relancer',
          ctaHref: `/mes-dossiers/${dossier.id}`,
        })),
        ...lowScoreDossiers.map((dossier) => ({
          id: `score-${dossier.id}`,
          type: 'low_score',
          title: `Score faible: ${dossier.title}`,
          description: `Score ${dossier.score ?? 0}/100`,
          severity: 'danger',
          ctaLabel: 'Revoir',
          ctaHref: `/mes-dossiers/${dossier.id}`,
        })),
      ],
      recentDossiers: dossiers.map((dossier) => ({
        id: dossier.id,
        title: dossier.title,
        client: dossier.client ?? null,
        status: dossier.status,
        score: dossier.completionRate,
        updatedAt: dossier.lastModified,
      })),
      recentCandidates: recentCandidates.map((candidate) => ({
        id: candidate.id,
        name: `${candidate.firstName} ${candidate.lastName}`,
        status: candidate.status,
        availability: candidate.availability,
        lastActivity: candidate.updatedAt.toISOString().split('T')[0],
      })),
      notifications: recentNotifications.map((item) => ({
        id: item.id,
        title: item.title,
        message: item.message,
        createdAt: item.createdAt.toISOString(),
      })),
      unreadNotifications: unreadNotificationsCount,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}

function mapDossierStatus(
  status: string
): 'draft' | 'pending_candidate' | 'in_progress' | 'completed' | 'sent' {
  const mapping: Record<
    string,
    'draft' | 'pending_candidate' | 'in_progress' | 'completed' | 'sent'
  > = {
    draft: 'draft',
    inProgress: 'in_progress',
    submitted: 'sent',
    won: 'completed',
    lost: 'completed',
  };
  return mapping[status] || 'draft';
}

function calculateCompletionRate(
  status: string,
  matched: number,
  required: number
): number {
  if (status === 'won' || status === 'submitted') return 100;
  if (status === 'draft') return 0;
  if (required === 0) return 50;
  return Math.min(100, Math.round((matched / required) * 100));
}
