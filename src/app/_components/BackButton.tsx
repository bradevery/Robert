'use client';

import { ArrowLeft } from 'lucide-react';

export function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className='inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-lg'
    >
      <ArrowLeft className='w-5 h-5 mr-2' />
      Page précédente
    </button>
  );
}
