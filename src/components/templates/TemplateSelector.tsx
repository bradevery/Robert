'use client';

import React from 'react';

export type TemplateType = 'layout1';

interface TemplateSelectorProps {
  selectedTemplate: TemplateType;
  onTemplateChange: (template: TemplateType) => void;
  compact?: boolean;
}

const templates = [
  {
    id: 'layout1' as TemplateType,
    name: 'Layout 1',
    description:
      'Design professionnel deux colonnes avec graphique et sections structurées',
    preview: '/images/TEMPLATE/1/LAYOUT1.png',
  },
];

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateChange,
  compact = false,
}) => {
  return (
    <div className={compact ? 'mb-4' : 'mb-6 bg-white'}>
      <div
        className={`grid gap-3 ${
          compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'
        }`}
      >
        {templates.map((template) => (
          <div
            key={template.id}
            className={`relative cursor-pointer rounded-lg border-2 transition-all hover:shadow-md ${
              selectedTemplate === template.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onTemplateChange(template.id)}
          >
            <div className={compact ? 'p-3' : 'p-4'}>
              <div
                className={`${
                  compact ? 'aspect-[4/3] mb-2' : 'aspect-[3/4] mb-3'
                } bg-gray-100 rounded flex items-center justify-center`}
              >
                <span
                  className={`${compact ? 'text-xs' : 'text-sm'} text-gray-400`}
                >
                  Aperçu {template.name}
                </span>
              </div>

              <h4
                className={`${
                  compact ? 'mb-1 text-sm' : 'mb-1'
                } font-medium text-gray-900`}
              >
                {template.name}
              </h4>

              {!compact && (
                <p className='text-sm text-gray-600'>{template.description}</p>
              )}

              {selectedTemplate === template.id && (
                <div className='absolute top-2 right-2'>
                  <div className='flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full'>
                    <svg
                      className='w-4 h-4 text-white'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
