import { prisma } from '@/lib/prisma';

import { auth } from '@/auth';

// Dev user ID for bypassing auth in development
const DEV_USER_ID = 'dev-user-id';

export async function getAuthScope() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    // Bypass auth in development mode
    if (process.env.NODE_ENV === 'development') {
      // Try to find the first user in the database, or return a dev scope
      const firstUser = await prisma.user.findFirst({
        select: { id: true, organizationId: true },
      });

      if (firstUser) {
        return {
          userId: firstUser.id,
          organizationId: firstUser.organizationId || null,
        };
      }

      // Return dev scope if no users exist
      return {
        userId: DEV_USER_ID,
        organizationId: null,
      };
    }
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, organizationId: true },
  });

  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    organizationId: user.organizationId || null,
  };
}

export function scopeWhere(scope: {
  userId: string;
  organizationId: string | null;
}) {
  return scope.organizationId
    ? { orgId: scope.organizationId }
    : { userId: scope.userId };
}
