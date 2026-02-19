'use client';

import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

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

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color?: ColorVariant;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const colorVariants: Record<
  ColorVariant,
  { icon: string; hover: string; border: string }
> = {
  blue: {
    icon: 'bg-blue-50 text-blue-500 group-hover:bg-blue-100',
    hover: 'hover:border-blue-200',
    border: 'border-blue-200',
  },
  green: {
    icon: 'bg-green-50 text-green-500 group-hover:bg-green-100',
    hover: 'hover:border-green-200',
    border: 'border-green-200',
  },
  purple: {
    icon: 'bg-purple-50 text-purple-500 group-hover:bg-purple-100',
    hover: 'hover:border-purple-200',
    border: 'border-purple-200',
  },
  orange: {
    icon: 'bg-orange-50 text-orange-500 group-hover:bg-orange-100',
    hover: 'hover:border-orange-200',
    border: 'border-orange-200',
  },
  red: {
    icon: 'bg-red-50 text-red-500 group-hover:bg-red-100',
    hover: 'hover:border-red-200',
    border: 'border-red-200',
  },
  pink: {
    icon: 'bg-pink-50 text-pink-500 group-hover:bg-pink-100',
    hover: 'hover:border-pink-200',
    border: 'border-pink-200',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-500 group-hover:bg-amber-100',
    hover: 'hover:border-amber-200',
    border: 'border-amber-200',
  },
  teal: {
    icon: 'bg-teal-50 text-teal-500 group-hover:bg-teal-100',
    hover: 'hover:border-teal-200',
    border: 'border-teal-200',
  },
  indigo: {
    icon: 'bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100',
    hover: 'hover:border-indigo-200',
    border: 'border-indigo-200',
  },
  emerald: {
    icon: 'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100',
    hover: 'hover:border-emerald-200',
    border: 'border-emerald-200',
  },
  cyan: {
    icon: 'bg-cyan-50 text-cyan-500 group-hover:bg-cyan-100',
    hover: 'hover:border-cyan-200',
    border: 'border-cyan-200',
  },
  gray: {
    icon: 'bg-gray-50 text-gray-500 group-hover:bg-gray-100',
    hover: 'hover:border-gray-300',
    border: 'border-gray-200',
  },
};

export function QuickActionCard({
  icon: Icon,
  title,
  description,
  color = 'blue',
  href,
  onClick,
  disabled = false,
  className,
}: QuickActionCardProps) {
  const colorClasses = colorVariants[color];

  const content = (
    <>
      <div
        className={cn(
          'flex items-center justify-center w-12 h-12 mb-4 rounded-xl transition-colors',
          colorClasses.icon
        )}
      >
        <Icon className='w-6 h-6' />
      </div>
      <h3 className='font-semibold text-gray-900'>{title}</h3>
      <p className='mt-1 text-sm text-gray-500'>{description}</p>
    </>
  );

  const baseClasses = cn(
    'group p-5 text-left transition-all duration-200 bg-white border border-gray-100 rounded-2xl',
    !disabled && 'hover:shadow-md cursor-pointer',
    !disabled && colorClasses.hover,
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type='button'
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(baseClasses, 'w-full')}
    >
      {content}
    </button>
  );
}

interface QuickActionGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function QuickActionGrid({
  children,
  columns = 4,
  className,
}: QuickActionGridProps) {
  const columnClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4',
        columnClasses[columns],
        className
      )}
    >
      {children}
    </div>
  );
}
