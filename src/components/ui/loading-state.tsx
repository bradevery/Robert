'use client';

import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = 'Chargement...',
}: LoadingStateProps) {
  return (
    <div className='flex items-center justify-center py-20 text-gray-500'>
      <Loader2 className='w-6 h-6 animate-spin mr-2' />
      {message}
    </div>
  );
}
