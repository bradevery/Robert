'use client';

import { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

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

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: ColorVariant;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const colorVariants: Record<ColorVariant, { icon: string; bg: string }> = {
  blue: { icon: 'text-blue-500', bg: 'bg-blue-50' },
  green: { icon: 'text-green-500', bg: 'bg-green-50' },
  purple: { icon: 'text-purple-500', bg: 'bg-purple-50' },
  orange: { icon: 'text-orange-500', bg: 'bg-orange-50' },
  red: { icon: 'text-red-500', bg: 'bg-red-50' },
  pink: { icon: 'text-pink-500', bg: 'bg-pink-50' },
  amber: { icon: 'text-amber-500', bg: 'bg-amber-50' },
  teal: { icon: 'text-teal-500', bg: 'bg-teal-50' },
  indigo: { icon: 'text-indigo-500', bg: 'bg-indigo-50' },
  emerald: { icon: 'text-emerald-500', bg: 'bg-emerald-50' },
  cyan: { icon: 'text-cyan-500', bg: 'bg-cyan-50' },
  gray: { icon: 'text-gray-500', bg: 'bg-gray-50' },
};

export function StatCard({
  icon: Icon,
  label,
  value,
  color = 'blue',
  trend,
  className,
}: StatCardProps) {
  const colorClasses = colorVariants[color];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-2xl transition-all hover:shadow-md hover:border-gray-200',
        className
      )}
    >
      <div className='flex items-center gap-2 mb-2 text-sm text-gray-500'>
        <div
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-lg',
            colorClasses.bg
          )}
        >
          <Icon className={cn('w-4 h-4', colorClasses.icon)} />
        </div>
        <span>{label}</span>
      </div>
      <p className='text-3xl font-bold text-gray-900'>{value}</p>
      {trend && (
        <div
          className={cn(
            'mt-2 text-xs font-medium',
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          )}
        >
          {trend.isPositive ? '+' : '-'}
          {Math.abs(trend.value)}%
        </div>
      )}
    </div>
  );
}

interface StatCardCompactProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: ColorVariant;
  className?: string;
}

export function StatCardCompact({
  icon: Icon,
  label,
  value,
  color = 'blue',
  className,
}: StatCardCompactProps) {
  const colorClasses = colorVariants[color];

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-lg',
          colorClasses.bg
        )}
      >
        <Icon className={cn('w-5 h-5', colorClasses.icon)} />
      </div>
      <div>
        <p className='text-sm text-gray-500'>{label}</p>
        <p className='text-xl font-bold text-gray-900'>{value}</p>
      </div>
    </div>
  );
}
