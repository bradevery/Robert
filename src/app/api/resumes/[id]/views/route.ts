import { NextRequest, NextResponse } from 'next/server';

import { getAuthScope } from '@/lib/auth-scope';
import prismadb from '@/lib/prisma.db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scope = await getAuthScope();

    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resume = await prismadb.resume.findFirst({
      where: {
        id: params.id,
        userId: scope.userId,
      },
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Récupérer les statistiques de vues
    const views = await prismadb.resumeView.findMany({
      where: { resumeId: params.id },
      orderBy: { viewedAt: 'desc' },
      take: 100, // Limiter à 100 vues récentes
    });

    const totalViews = await prismadb.resumeView.count({
      where: { resumeId: params.id },
    });

    const uniqueViews = await prismadb.resumeView.groupBy({
      by: ['ipAddress'],
      where: { resumeId: params.id },
    });

    // Statistiques par période
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const viewsThisWeek = await prismadb.resumeView.count({
      where: {
        resumeId: params.id,
        viewedAt: { gte: lastWeek },
      },
    });

    const viewsThisMonth = await prismadb.resumeView.count({
      where: {
        resumeId: params.id,
        viewedAt: { gte: lastMonth },
      },
    });

    // Statistiques par jour (derniers 30 jours)
    const dailyViews = await prismadb.$queryRaw`
      SELECT 
        DATE("viewedAt") as date,
        COUNT(*) as count
      FROM "resume_views"
      WHERE "resumeId" = ${params.id}
        AND "viewedAt" >= ${lastMonth}
      GROUP BY DATE("viewedAt")
      ORDER BY date DESC
    `;

    return NextResponse.json({
      totalViews,
      uniqueViews: uniqueViews.length,
      viewsThisWeek,
      viewsThisMonth,
      recentViews: views.map((view) => ({
        id: view.id,
        viewedAt: view.viewedAt,
        ipAddress: view.ipAddress,
        userAgent: view.userAgent,
      })),
      dailyViews,
    });
  } catch (error) {
    console.error('Error fetching resume views:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
