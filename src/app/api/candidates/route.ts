import { Availability, CandidateStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { getAuthScope, scopeWhere } from '@/lib/auth-scope';
import { prisma } from '@/lib/prisma';

// GET - Fetch all candidates with optional filtering
export async function GET(request: NextRequest) {
  try {
    const scope = await getAuthScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const availability = searchParams.get('availability');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where = {
      ...scopeWhere(scope),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
          { title: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { skills: { has: search } },
        ],
      }),
      ...(status && { status: status as CandidateStatus }),
      ...(availability && { availability: availability as Availability }),
    };

    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.candidate.count({ where }),
    ]);

    return NextResponse.json({
      candidates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidates' },
      { status: 500 }
    );
  }
}

// POST - Create a new candidate
export async function POST(request: NextRequest) {
  try {
    const scope = await getAuthScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      title,
      location,
      skills,
      languages,
      tjm,
      salaryExpectation,
      yearsExperience,
      seniorityLevel,
      mobility,
      remotePreference,
      availability,
      status,
      notes,
      tags,
      source,
    } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'firstName, lastName, and email are required' },
        { status: 400 }
      );
    }

    // Check for existing email
    const existing = await prisma.candidate.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A candidate with this email already exists' },
        { status: 409 }
      );
    }

    const candidate = await prisma.candidate.create({
      data: {
        userId: scope.userId,
        orgId: scope.organizationId,
        firstName,
        lastName,
        email,
        phone,
        title: title || 'Non spécifié',
        location,
        skills: skills || [],
        languages: languages || [],
        tjm,
        salaryExpectation,
        yearsExperience: yearsExperience || 0,
        seniorityLevel,
        mobility: mobility || {},
        remotePreference,
        availability: availability || 'immediate',
        status: status || 'new',
        notes,
        tags: tags || [],
        source,
      },
    });

    return NextResponse.json({ candidate }, { status: 201 });
  } catch (error) {
    console.error('Error creating candidate:', error);
    return NextResponse.json(
      { error: 'Failed to create candidate' },
      { status: 500 }
    );
  }
}
