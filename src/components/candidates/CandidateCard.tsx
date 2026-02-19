'use client';

import { Euro, MapPin, User } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

import { ScoreBadge, ScoreProgress } from '@/components/ui/score-badge';
import {
  AvailabilityBadge,
  CandidateStatusBadge,
} from '@/components/ui/status-indicator';

import type { Candidate } from '@/stores/candidates-store';

interface CandidateCardProps {
  candidate: Candidate;
  dossierId?: string;
  onClick?: () => void;
  className?: string;
}

export function CandidateCard({
  candidate,
  dossierId,
  onClick,
  className,
}: CandidateCardProps) {
  const matchScore = dossierId ? candidate.matchScores[dossierId] : undefined;

  return (
    <Link
      href={`/mes-candidats/${candidate.id}`}
      onClick={onClick}
      className={cn(
        'block p-5 bg-white border border-gray-100 rounded-2xl transition-all duration-200 hover:shadow-md hover:border-gray-200 group',
        className
      )}
    >
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center justify-center w-12 h-12 bg-teal-50 rounded-full'>
            <span className='text-sm font-semibold text-teal-600'>
              {candidate.firstName[0]}
              {candidate.lastName[0]}
            </span>
          </div>
          <div>
            <h3 className='font-semibold text-gray-900 group-hover:text-teal-600 transition-colors'>
              {candidate.firstName} {candidate.lastName}
            </h3>
            <p className='text-sm text-gray-500'>{candidate.title}</p>
          </div>
        </div>
        <CandidateStatusBadge status={candidate.status} />
      </div>

      {matchScore !== undefined && (
        <div className='mb-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-gray-500'>Score de matching</span>
            <ScoreBadge score={matchScore} size='sm' />
          </div>
          <ScoreProgress score={matchScore} showLabel={false} />
        </div>
      )}

      <div className='flex flex-wrap gap-2 mb-4'>
        {candidate.skills.slice(0, 4).map((skill) => (
          <span
            key={skill}
            className='px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg'
          >
            {skill}
          </span>
        ))}
        {candidate.skills.length > 4 && (
          <span className='px-2.5 py-1 text-xs font-medium text-gray-500 bg-gray-50 rounded-lg'>
            +{candidate.skills.length - 4}
          </span>
        )}
      </div>

      <div className='flex items-center justify-between text-sm text-gray-500'>
        <div className='flex items-center gap-4'>
          <AvailabilityBadge availability={candidate.availability} />
          {candidate.location && (
            <span className='flex items-center gap-1'>
              <MapPin className='w-3 h-3' />
              {candidate.location}
            </span>
          )}
        </div>
        {candidate.tjm && (
          <span className='flex items-center gap-1 font-medium text-gray-700'>
            <Euro className='w-3 h-3' />
            {candidate.tjm}/j
          </span>
        )}
      </div>
    </Link>
  );
}

interface CandidateListProps {
  candidates: Candidate[];
  dossierId?: string;
  className?: string;
}

export function CandidateList({
  candidates,
  dossierId,
  className,
}: CandidateListProps) {
  if (candidates.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full'>
          <User className='w-8 h-8 text-gray-400' />
        </div>
        <h3 className='text-lg font-medium text-gray-900'>Aucun candidat</h3>
        <p className='mt-1 text-sm text-gray-500'>
          Commencez par ajouter votre premier candidat
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
        className
      )}
    >
      {candidates.map((candidate) => (
        <CandidateCard
          key={candidate.id}
          candidate={candidate}
          dossierId={dossierId}
        />
      ))}
    </div>
  );
}

interface SkillsBadgesProps {
  skills: string[];
  max?: number;
  className?: string;
}

export function SkillsBadges({
  skills,
  max = 5,
  className,
}: SkillsBadgesProps) {
  const displayedSkills = skills.slice(0, max);
  const remainingCount = skills.length - max;

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {displayedSkills.map((skill) => (
        <span
          key={skill}
          className='px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded'
        >
          {skill}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className='px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-50 rounded'>
          +{remainingCount}
        </span>
      )}
    </div>
  );
}
