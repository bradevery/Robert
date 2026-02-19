/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

import { hybridScoringService } from '@/lib/scoring/hybrid-scoring';

function objectToText(obj: any): string {
  if (!obj) return '';
  return Object.entries(obj)
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(([key, value]) => {
      if (Array.isArray(value)) return `${key}: ${value.join(', ')}`;
      if (typeof value === 'object') return objectToText(value);
      return `${key}: ${value}`;
    })
    .join('\n');
}

function calculateAvailabilityScore(availability: string): number {
  const normalized = availability?.toLowerCase() || '';
  if (normalized.includes('immediate') || normalized.includes('immédiate'))
    return 100;
  if (normalized.includes('1 month') || normalized.includes('1 mois'))
    return 75;
  if (normalized.includes('2 months') || normalized.includes('2 mois'))
    return 60;
  if (normalized.includes('3 months') || normalized.includes('3 mois'))
    return 40;
  return 50; // Default average
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { candidate, job, dossier } = body;

    if (!candidate) {
      return NextResponse.json(
        { error: 'Le profil du candidat est requis' },
        { status: 400 }
      );
    }

    if (!job && !dossier) {
      return NextResponse.json(
        { error: "L'offre ou le dossier est requis" },
        { status: 400 }
      );
    }

    // Convert structured data to text for the scoring engine
    const cvText = objectToText(candidate);
    const jobText = objectToText(job || dossier);

    // Calculate score using the Robert Score hybrid engine
    const result = await hybridScoringService.calculateHybridScore(
      jobText,
      cvText,
      {
        performanceMode: 'balanced',
        bankingInsuranceFocus: true,
        useCache: true,
      }
    );

    const availabilityScore = calculateAvailabilityScore(
      candidate.availability
    );
    const experienceYears = parseInt(candidate.yearsOfExperience || '0');

    // Map result to the expected API response format
    const matching = {
      overallScore: result.finalScore,
      scores: {
        technical: result.breakdown.keywordScore,
        experience: result.breakdown.semanticScore,
        // Fallback for education: use experience score as proxy or neutral 50 if low
        education:
          result.breakdown.semanticScore > 0
            ? result.breakdown.semanticScore
            : 50,
        softSkills: Math.round(
          (result.breakdown.vectorScore + result.breakdown.embeddingScore) / 2
        ),
        cultural: Math.round(
          (result.breakdown.vectorScore + result.breakdown.embeddingScore) / 2
        ),
        availability: availabilityScore,
      },
      skillsAnalysis: {
        matched: result.analysis.skillsAlignment.map((skill) => ({
          skill,
          candidateLevel: 'Detected',
          requiredLevel: 'Required',
        })),
        partial: [],
        missing: result.analysis.missingCompetencies.map((skill) => ({
          skill,
          importance: 'important',
        })),
        extra: [],
      },
      experienceAnalysis: {
        totalYears: experienceYears,
        relevantYears: experienceYears, // Assumption
        seniorityMatch: true, // Placeholder logic
        industryMatch: true, // Placeholder logic
        roleProgression: 'Evaluated by algorithm',
      },
      educationAnalysis: {
        levelMatch: true,
        fieldMatch: true,
        certifications: [],
      },
      fitAnalysis: {
        pros: result.analysis.strengths,
        cons: result.analysis.weaknesses,
        recommendations: result.analysis.recommendations,
      },
      summary: result.analysis.detailedJustification,
      recommendation:
        result.finalScore > 75
          ? 'strong_fit'
          : result.finalScore > 50
          ? 'good_fit'
          : 'weak_fit',
      evidence: [],
    };

    return NextResponse.json({
      success: true,
      matching,
    });
  } catch (error) {
    console.error('Matching API Error:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors du calcul du matching',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
