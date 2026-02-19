'use client';

import {
  type Availability,
  type CandidateStatus,
  type ClientStatus,
  type DossierStatus,
  availabilityColors,
  candidateStatusColors,
  clientStatusColors,
  dossierStatusColors,
} from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  className?: string;
}

interface CandidateStatusBadgeProps extends StatusBadgeProps {
  status: CandidateStatus;
}

export function CandidateStatusBadge({
  status,
  className,
}: CandidateStatusBadgeProps) {
  const config = candidateStatusColors[status] || candidateStatusColors.new;
  return (
    <span
      className={cn(
        'px-2.5 py-1 text-xs font-medium rounded-lg border',
        config.class,
        className
      )}
    >
      {config.label}
    </span>
  );
}

interface ClientStatusBadgeProps extends StatusBadgeProps {
  status: ClientStatus;
}

export function ClientStatusBadge({
  status,
  className,
}: ClientStatusBadgeProps) {
  const config = clientStatusColors[status] || clientStatusColors.prospect;
  return (
    <span
      className={cn(
        'px-2.5 py-1 text-xs font-medium rounded-lg border',
        config.class,
        className
      )}
    >
      {config.label}
    </span>
  );
}

interface DossierStatusBadgeProps extends StatusBadgeProps {
  status: DossierStatus;
}

export function DossierStatusBadge({
  status,
  className,
}: DossierStatusBadgeProps) {
  const config = dossierStatusColors[status] || dossierStatusColors.draft;
  return (
    <span
      className={cn(
        'px-2.5 py-1 text-xs font-medium rounded-lg border',
        config.class,
        className
      )}
    >
      {config.label}
    </span>
  );
}

interface AvailabilityBadgeProps extends StatusBadgeProps {
  availability: Availability;
}

export function AvailabilityBadge({
  availability,
  className,
}: AvailabilityBadgeProps) {
  const config =
    availabilityColors[availability] || availabilityColors.immediate;
  return (
    <span
      className={cn(
        'px-2.5 py-1 text-xs font-medium rounded-lg border',
        config.class,
        className
      )}
    >
      {config.label}
    </span>
  );
}

interface LiveIndicatorProps {
  isLive?: boolean;
  label?: string;
  className?: string;
}

export function LiveIndicator({
  isLive = true,
  label = 'En ligne',
  className,
}: LiveIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-1.5 text-sm', className)}>
      <span
        className={cn(
          'w-2 h-2 rounded-full',
          isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
        )}
      />
      <span className={isLive ? 'text-green-600' : 'text-gray-500'}>
        {label}
      </span>
    </div>
  );
}

interface SaveIndicatorProps {
  isSaved: boolean;
  isSaving?: boolean;
  className?: string;
}

export function SaveIndicator({
  isSaved,
  isSaving = false,
  className,
}: SaveIndicatorProps) {
  if (isSaving) {
    return (
      <div
        className={cn(
          'flex items-center gap-1.5 text-sm text-gray-500',
          className
        )}
      >
        <span className='w-2 h-2 bg-orange-500 rounded-full animate-pulse' />
        <span>Sauvegarde...</span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-1.5 text-sm', className)}>
      <span
        className={cn(
          'w-2 h-2 rounded-full',
          isSaved ? 'bg-green-500' : 'bg-orange-500'
        )}
      />
      <span className={isSaved ? 'text-gray-500' : 'text-orange-600'}>
        {isSaved ? 'Sauvegardé' : 'Modifications non sauvegardées'}
      </span>
    </div>
  );
}
