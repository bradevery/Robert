'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';

import { auth } from '@/auth';

export async function addComment(dossierId: string, content: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  if (!content.trim()) {
    throw new Error('Comment cannot be empty');
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      dossierId,
      userId: session.user.id,
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  revalidatePath(`/mes-dossiers/${dossierId}`);
  return comment;
}

export async function getComments(dossierId: string) {
  const comments = await prisma.comment.findMany({
    where: { dossierId },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return comments.map((c) => ({
    id: c.id,
    content: c.content,
    createdAt: c.createdAt.toISOString(),
    user: {
      name: c.user.name || 'Unknown',
      image: c.user.image || undefined,
    },
  }));
}
