'use client';

import { Euro, ExternalLink, MapPin } from 'lucide-react';
import Link from 'next/link';

import type { Availability } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

import { SkillsBadges } from '@/components/candidates/CandidateCard';
import { ScoreBadge, ScoreProgress } from '@/components/ui/score-badge';
import { AvailabilityBadge } from '@/components/ui/status-indicator';

export interface ProfileData {
  id: string;
  name: string;
  avatar: string;
  title: string;
  matchScore: number;
  skills: string[];
  availability?: Availability;
  location?: string;
  tjm?: number;
}

interface ProfileCardProps {
  profile: ProfileData;
  href?: string;
  onSelect?: () => void;
  className?: string;
}

export function ProfileCard({
  profile,
  href,
  onSelect,
  className,
}: ProfileCardProps) {
  const content = (
    <div
      className={cn(
        'p-4 bg-white border border-gray-100 rounded-2xl transition-all duration-200 hover:shadow-md hover:border-gray-200 group',
        className
      )}
    >
      <div className='flex items-start justify-between mb-3'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center justify-center w-12 h-12 text-sm font-semibold text-gray-600 bg-gray-100 rounded-full'>
            {profile.avatar}
          </div>
          <div>
            <h4 className='font-semibold text-gray-900 group-hover:text-blue-600 transition-colors'>
              {profile.name}
            </h4>
            <p className='text-sm text-gray-500'>{profile.title}</p>
          </div>
        </div>
        <ScoreBadge score={profile.matchScore} size='sm' />
      </div>

      {/* Match progress */}
      <ScoreProgress score={profile.matchScore} className='mb-3' />

      {/* Skills */}
      <SkillsBadges skills={profile.skills} max={4} className='mb-3' />

      {/* Meta info */}
      <div className='flex items-center justify-between text-sm text-gray-500'>
        <div className='flex items-center gap-3'>
          {profile.availability && (
            <AvailabilityBadge availability={profile.availability} />
          )}
          {profile.location && (
            <span className='flex items-center gap-1'>
              <MapPin className='w-3 h-3' />
              {profile.location}
            </span>
          )}
        </div>
        {profile.tjm && (
          <span className='flex items-center gap-1 font-medium text-gray-700'>
            <Euro className='w-3 h-3' />
            {profile.tjm}/j
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} onClick={onSelect}>
        {content}
      </Link>
    );
  }

  return (
    <button type='button' onClick={onSelect} className='w-full text-left'>
      {content}
    </button>
  );
}

interface ProfileListProps {
  profiles: ProfileData[];
  title?: string;
  showViewAll?: boolean;
  viewAllHref?: string;
  emptyMessage?: string;
  className?: string;
}

export function ProfileList({
  profiles,
  title = 'Top Profils Identifiés',
  showViewAll = false,
  viewAllHref = '/mes-candidats',
  emptyMessage = 'Aucun profil trouvé',
  className,
}: ProfileListProps) {
  return (
    <div
      className={cn(
        'p-6 bg-white border border-gray-100 rounded-2xl',
        className
      )}
    >
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-sm font-semibold tracking-wide text-gray-400 uppercase'>
          {title}
        </h2>
        {showViewAll && profiles.length > 0 && (
          <Link
            href={viewAllHref}
            className='flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors'
          >
            Voir tout
            <ExternalLink className='w-3 h-3' />
          </Link>
        )}
      </div>

      {profiles.length === 0 ? (
        <div className='py-8 text-center'>
          <p className='text-sm text-gray-500'>{emptyMessage}</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              href={`/mes-candidats/${profile.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface MatchScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  className?: string;
}

export function MatchScoreBadge({
  score,
  size = 'md',
  showProgress = false,
  className,
}: MatchScoreBadgeProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <ScoreBadge score={score} size={size} />
      {showProgress && (
        <ScoreProgress
          score={score}
          size='sm'
          showLabel={false}
          className='mt-2'
        />
      )}
    </div>
  );
}
