'use client';

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title,
  description,
  icon: Icon,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className='text-center py-16 text-gray-500'>
      <Icon className='w-10 h-10 mx-auto mb-3 text-gray-300' />
      <p className='font-medium'>{title}</p>
      {description && <p className='text-sm'>{description}</p>}
      {actionLabel && actionHref ? (
        <Button className='mt-4' asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : actionLabel ? (
        <Button className='mt-4' onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
