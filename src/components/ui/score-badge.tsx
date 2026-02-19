'use client';

import { getScoreClasses } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ScoreBadge({
  score,
  size = 'md',
  showLabel = true,
  className,
}: ScoreBadgeProps) {
  const colors = getScoreClasses(score);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-lg border',
        colors.class,
        sizeClasses[size],
        className
      )}
    >
      {showLabel && <span className='mr-1'>Match</span>}
      {score}%
    </span>
  );
}

interface ScoreProgressProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ScoreProgress({
  score,
  label,
  size = 'md',
  showLabel = true,
  className,
}: ScoreProgressProps) {
  const colors = getScoreClasses(score);

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <div className='flex justify-between items-center px-0.5'>
          <span className='text-[10px] font-bold text-gray-500 uppercase tracking-tight'>
            {label}
          </span>
          {!showLabel && (
            <span className={cn('text-[10px] font-bold', colors.text)}>
              {score}%
            </span>
          )}
        </div>
      )}
      <div className={cn('flex items-center gap-3')}>
        <div
          className={cn(
            'flex-1 overflow-hidden bg-gray-100 rounded-full',
            heightClasses[size]
          )}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              colors.fill
            )}
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        </div>
        {showLabel && (
          <span className={cn('text-sm font-medium tabular-nums', colors.text)}>
            {score}%
          </span>
        )}
      </div>
    </div>
  );
}
