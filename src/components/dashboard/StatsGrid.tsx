'use client';

import { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

import { StatCard, StatCardCompact } from '@/components/ui/stat-card';

type ColorVariant =
  | 'blue'
  | 'green'
  | 'purple'
  | 'orange'
  | 'red'
  | 'pink'
  | 'amber'
  | 'teal'
  | 'indigo'
  | 'emerald'
  | 'cyan'
  | 'gray';

export interface StatItem {
  id: string;
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: ColorVariant;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'compact';
  className?: string;
}

export function StatsGrid({
  stats,
  columns = 3,
  variant = 'default',
  className,
}: StatsGridProps) {
  const columnClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  const Card = variant === 'compact' ? StatCardCompact : StatCard;

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4',
        columnClasses[columns],
        className
      )}
    >
      {stats.map((stat) => (
        <Card
          key={stat.id}
          icon={stat.icon}
          label={stat.label}
          value={stat.value}
          color={stat.color}
          {...(variant === 'default' && stat.trend
            ? { trend: stat.trend }
            : {})}
        />
      ))}
    </div>
  );
}

interface StatsOverviewProps {
  stats: {
    label: string;
    value: string | number;
    change?: {
      value: number;
      label: string;
    };
  }[];
  className?: string;
}

export function StatsOverview({ stats, className }: StatsOverviewProps) {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className='p-4 bg-white border border-gray-100 rounded-xl'
        >
          <p className='text-sm text-gray-500'>{stat.label}</p>
          <p className='mt-1 text-2xl font-bold text-gray-900'>{stat.value}</p>
          {stat.change && (
            <p
              className={cn(
                'mt-1 text-xs font-medium',
                stat.change.value >= 0 ? 'text-green-600' : 'text-red-600'
              )}
            >
              {stat.change.value >= 0 ? '+' : ''}
              {stat.change.value}% {stat.change.label}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
