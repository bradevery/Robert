import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TemplateCardProps {
  title: string;
  description: string;
  badge?: {
    text: string;
    className: string;
  };
  children: React.ReactNode;
  hoverColor: string;
}

export default function TemplateCard({
  title,
  description,
  badge,
  children,
  hoverColor,
}: TemplateCardProps) {
  return (
    <div className='relative flex-shrink-0 w-64 overflow-hidden transition-all duration-300 bg-white border border-gray-200 rounded-lg shadow-sm group hover:shadow-lg hover:scale-105 snap-start'>
      {children}
      <div className='p-4'>
        <h3 className='mb-1 text-lg font-semibold text-gray-900'>{title}</h3>
        <p className='text-sm text-gray-600'>{description}</p>
        {badge && (
          <Badge className={`mt-2 text-xs ${badge.className}`}>
            {badge.text}
          </Badge>
        )}
      </div>
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${hoverColor} opacity-0 bg-opacity-90 group-hover:opacity-100`}
      >
        <div className='flex items-center justify-center h-full'>
          <Button className='bg-white hover:bg-gray-100 text-gray-800'>
            Aperçu
          </Button>
        </div>
      </div>
    </div>
  );
}
