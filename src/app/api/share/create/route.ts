import { createHash, randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

function generateToken(): string {
  return randomBytes(16).toString('hex');
}

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

// POST - Create a shareable link for documents (dossiers, CVs, etc.)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      // New API format (from ShareModal)
      dossierId,
      password,
      expiresInDays,
      viewLimit,
      // Legacy API format
      documentId,
      documentType,
      expiresIn,
    } = body;

    // Support both old and new API formats
    const targetId = dossierId || documentId;
    const targetType = dossierId ? 'dossier' : documentType;
    const daysUntilExpiry = expiresInDays || expiresIn || 7;

    if (!targetId) {
      return NextResponse.json(
        { error: 'dossierId or documentId is required' },
        { status: 400 }
      );
    }

    const shareToken = generateToken();
    const expiresAt = daysUntilExpiry
      ? new Date(Date.now() + daysUntilExpiry * 24 * 60 * 60 * 1000)
      : null;

    // For dossiers
    if (targetType === 'dossier') {
      const dossier = await prisma.dossier.findUnique({
        where: { id: targetId },
        select: { id: true, title: true },
      });

      if (!dossier) {
        return NextResponse.json(
          { error: 'Dossier not found' },
          { status: 404 }
        );
      }

      // Create share link document entry
      await prisma.document.create({
        data: {
          name: `share-dossier-${targetId}`,
          type: 'SHARE_LINK',
          mimeType: 'application/json',
          size: 0,
          url: shareToken,
          metadata: {
            documentId: targetId,
            documentType: 'dossier',
            passwordHash: password ? hashPassword(password) : null,
            expiresAt: expiresAt?.toISOString() || null,
            viewLimit: viewLimit || null,
            viewCount: 0,
          },
        },
      });

      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const shareUrl = `${baseUrl}/share/${shareToken}`;

      return NextResponse.json({
        shareUrl,
        token: shareToken,
        expiresAt: expiresAt?.toISOString() || null,
        hasPassword: !!password,
        viewLimit: viewLimit || null,
      });
    }

    // For CVs/Resumes
    if (targetType === 'cv') {
      const resume = await prisma.resume.findUnique({
        where: { id: targetId },
      });

      if (!resume) {
        return NextResponse.json(
          { error: 'Resume not found' },
          { status: 404 }
        );
      }

      await prisma.resume.update({
        where: { id: targetId },
        data: {
          isPublic: true,
          metadata: {
            ...((resume.metadata as object) || {}),
            shareToken,
            shareExpiresAt: expiresAt?.toISOString() || null,
            passwordHash: password ? hashPassword(password) : null,
            viewLimit: viewLimit || null,
            viewCount: 0,
          },
        },
      });

      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const shareUrl = `${baseUrl}/share/${shareToken}`;

      return NextResponse.json({
        shareUrl,
        token: shareToken,
        expiresAt: expiresAt?.toISOString() || null,
        hasPassword: !!password,
        viewLimit: viewLimit || null,
      });
    }

    // For other document types
    await prisma.document.create({
      data: {
        name: `share-${targetType}-${targetId}`,
        type: 'SHARE_LINK',
        mimeType: 'application/json',
        size: 0,
        url: shareToken,
        metadata: {
          documentId: targetId,
          documentType: targetType,
          passwordHash: password ? hashPassword(password) : null,
          expiresAt: expiresAt?.toISOString() || null,
          viewLimit: viewLimit || null,
          viewCount: 0,
        },
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/share/${shareToken}`;

    return NextResponse.json({
      shareUrl,
      token: shareToken,
      expiresAt: expiresAt?.toISOString() || null,
      hasPassword: !!password,
      viewLimit: viewLimit || null,
    });
  } catch (error) {
    console.error('Error creating share link:', error);
    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    );
  }
}
