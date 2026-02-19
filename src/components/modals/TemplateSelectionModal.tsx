'use client';

import { X } from 'lucide-react';
import React from 'react';

import {
  TemplateSelector,
  TemplateType,
} from '@/components/templates/TemplateSelector';

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplate: TemplateType;
  onTemplateChange: (template: TemplateType) => void;
}

export const TemplateSelectionModal: React.FC<TemplateSelectionModalProps> = ({
  isOpen,
  onClose,
  selectedTemplate,
  onTemplateChange,
}) => {
  if (!isOpen) return null;

  const handleTemplateSelect = (template: TemplateType) => {
    onTemplateChange(template);
    onClose(); // Close modal after selection
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <h2 className='text-2xl font-bold text-gray-900'>
            Choisir un modèle de CV
          </h2>
          <button
            onClick={onClose}
            className='p-2 transition-colors rounded-full hover:bg-gray-100'
            aria-label='Fermer'
          >
            <X className='w-6 h-6 text-gray-600' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>
          <p className='mb-6 text-gray-600'>
            Sélectionnez le modèle qui correspond le mieux à votre profil
            professionnel. Vous pourrez modifier les informations directement
            sur le CV.
          </p>

          <TemplateSelector
            selectedTemplate={selectedTemplate}
            onTemplateChange={handleTemplateSelect}
          />
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-md hover:bg-gray-50'
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};
