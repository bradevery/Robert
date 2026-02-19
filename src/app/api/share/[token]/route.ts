import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

interface ShareMetadata {
  documentId: string;
  documentType: string;
  passwordHash?: string | null;
  expiresAt?: string | null;
  viewLimit?: number | null;
  viewCount?: number;
}

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

// GET - Get share link info (check if password required, etc.)
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    // Try to find in Document table first
    const shareLink = await prisma.document.findFirst({
      where: {
        url: token,
        type: 'SHARE_LINK',
      },
    });

    // If not found, try to find in Resume metadata
    if (!shareLink) {
      const resume = await prisma.resume.findFirst({
        where: {
          isPublic: true,
          metadata: {
            path: ['shareToken'],
            equals: token,
          },
        },
      });

      if (resume) {
        const metadata = resume.metadata as {
          shareExpiresAt?: string;
          passwordHash?: string;
          viewLimit?: number;
          viewCount?: number;
        };

        // Check expiration
        if (
          metadata.shareExpiresAt &&
          new Date(metadata.shareExpiresAt) < new Date()
        ) {
          return NextResponse.json(
            { error: 'Share link has expired', code: 'EXPIRED' },
            { status: 410 }
          );
        }

        // Check view limit
        if (
          metadata.viewLimit &&
          (metadata.viewCount || 0) >= metadata.viewLimit
        ) {
          return NextResponse.json(
            { error: 'View limit reached', code: 'VIEW_LIMIT_EXCEEDED' },
            { status: 410 }
          );
        }

        return NextResponse.json({
          requiresPassword: !!metadata.passwordHash,
          documentType: 'cv',
          expiresAt: metadata.shareExpiresAt || null,
          viewsRemaining: metadata.viewLimit
            ? metadata.viewLimit - (metadata.viewCount || 0)
            : null,
        });
      }

      return NextResponse.json(
        { error: 'Share link not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const metadata = shareLink.metadata as ShareMetadata;

    // Check if expired
    if (metadata.expiresAt && new Date(metadata.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Share link has expired', code: 'EXPIRED' },
        { status: 410 }
      );
    }

    // Check view limit
    if (metadata.viewLimit && (metadata.viewCount || 0) >= metadata.viewLimit) {
      return NextResponse.json(
        { error: 'View limit reached', code: 'VIEW_LIMIT_EXCEEDED' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      requiresPassword: !!metadata.passwordHash,
      documentType: metadata.documentType,
      expiresAt: metadata.expiresAt || null,
      viewsRemaining: metadata.viewLimit
        ? metadata.viewLimit - (metadata.viewCount || 0)
        : null,
    });
  } catch (error) {
    console.error('Error checking share link:', error);
    return NextResponse.json(
      { error: 'Failed to check share link' },
      { status: 500 }
    );
  }
}

// POST - Access shared document (with password if required)
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const body = await request.json().catch(() => ({}));
    const { password } = body;

    // Try Document table first
    const shareLink = await prisma.document.findFirst({
      where: {
        url: token,
        type: 'SHARE_LINK',
      },
    });

    if (shareLink) {
      const metadata = shareLink.metadata as ShareMetadata;

      // Check if expired
      if (metadata.expiresAt && new Date(metadata.expiresAt) < new Date()) {
        return NextResponse.json(
          { error: 'Share link has expired', code: 'EXPIRED' },
          { status: 410 }
        );
      }

      // Check view limit
      if (
        metadata.viewLimit &&
        (metadata.viewCount || 0) >= metadata.viewLimit
      ) {
        return NextResponse.json(
          { error: 'View limit reached', code: 'VIEW_LIMIT_EXCEEDED' },
          { status: 410 }
        );
      }

      // Verify password if required
      if (metadata.passwordHash) {
        if (!password) {
          return NextResponse.json(
            { error: 'Password required', code: 'PASSWORD_REQUIRED' },
            { status: 401 }
          );
        }
        if (hashPassword(password) !== metadata.passwordHash) {
          return NextResponse.json(
            { error: 'Invalid password', code: 'INVALID_PASSWORD' },
            { status: 401 }
          );
        }
      }

      // Increment view count
      await prisma.document.update({
        where: { id: shareLink.id },
        data: {
          metadata: {
            ...metadata,
            viewCount: (metadata.viewCount || 0) + 1,
          },
        },
      });

      // Fetch the actual document
      let document = null;
      switch (metadata.documentType) {
        case 'cv':
          document = await prisma.resume.findUnique({
            where: { id: metadata.documentId },
          });
          break;
        case 'dossier':
          document = await prisma.dossier.findUnique({
            where: { id: metadata.documentId },
            include: {
              client: {
                select: { id: true, name: true, logo: true },
              },
              candidates: {
                include: {
                  candidate: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      title: true,
                      skills: true,
                    },
                  },
                },
              },
            },
          });
          break;
        case 'propale':
          document = await prisma.propale.findUnique({
            where: { id: metadata.documentId },
            include: {
              dossier: {
                select: { id: true, title: true },
              },
            },
          });
          break;
      }

      if (!document) {
        return NextResponse.json(
          { error: 'Document not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        documentType: metadata.documentType,
        document,
        expiresAt: metadata.expiresAt || null,
      });
    }

    // Try Resume metadata
    const resume = await prisma.resume.findFirst({
      where: {
        isPublic: true,
        metadata: {
          path: ['shareToken'],
          equals: token,
        },
      },
    });

    if (!resume) {
      return NextResponse.json(
        { error: 'Share link not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const resumeMetadata = resume.metadata as {
      shareExpiresAt?: string;
      passwordHash?: string;
      viewLimit?: number;
      viewCount?: number;
    };

    // Check expiration
    if (
      resumeMetadata.shareExpiresAt &&
      new Date(resumeMetadata.shareExpiresAt) < new Date()
    ) {
      return NextResponse.json(
        { error: 'Share link has expired', code: 'EXPIRED' },
        { status: 410 }
      );
    }

    // Check view limit
    if (
      resumeMetadata.viewLimit &&
      (resumeMetadata.viewCount || 0) >= resumeMetadata.viewLimit
    ) {
      return NextResponse.json(
        { error: 'View limit reached', code: 'VIEW_LIMIT_EXCEEDED' },
        { status: 410 }
      );
    }

    // Verify password
    if (resumeMetadata.passwordHash) {
      if (!password) {
        return NextResponse.json(
          { error: 'Password required', code: 'PASSWORD_REQUIRED' },
          { status: 401 }
        );
      }
      if (hashPassword(password) !== resumeMetadata.passwordHash) {
        return NextResponse.json(
          { error: 'Invalid password', code: 'INVALID_PASSWORD' },
          { status: 401 }
        );
      }
    }

    // Increment view count
    await prisma.resume.update({
      where: { id: resume.id },
      data: {
        metadata: {
          ...(resume.metadata as object),
          viewCount: (resumeMetadata.viewCount || 0) + 1,
        },
      },
    });

    return NextResponse.json({
      documentType: 'cv',
      document: resume,
      expiresAt: resumeMetadata.shareExpiresAt || null,
    });
  } catch (error) {
    console.error('Error accessing shared document:', error);
    return NextResponse.json(
      { error: 'Failed to access shared document' },
      { status: 500 }
    );
  }
}
