'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

import { Switch } from '@/components/ui/switch';

interface FieldOption {
  id: string;
  label: string;
  visible: boolean;
}

interface SectionFieldsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  sectionType: string;
  sectionTitle: string;
  fields: FieldOption[];
  onFieldToggle: (fieldId: string, visible: boolean) => void;
  position?: { top: number; left: number };
  className?: string;
}

export const SectionFieldsPopup: React.FC<SectionFieldsPopupProps> = ({
  isOpen,
  onClose,
  _sectionType,
  sectionTitle,
  fields,
  onFieldToggle,
  position = { top: 0, left: 0 },
  className = '',
}) => {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={popupRef}
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.15 }}
        className={`fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 ${className}`}
        style={{
          top: position.top,
          left: position.left,
          minWidth: '280px',
          maxWidth: '320px',
        }}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-100'>
          <h3 className='text-sm font-semibold text-gray-900'>
            Options d'affichage
          </h3>
          <button
            onClick={onClose}
            className='p-1 hover:bg-gray-100 rounded-full transition-colors'
          >
            <X className='w-4 h-4 text-gray-500' />
          </button>
        </div>

        {/* Content */}
        <div className='p-4 max-h-80 overflow-y-auto'>
          <div className='space-y-3'>
            <p className='text-xs text-gray-600 mb-3'>{sectionTitle}</p>

            {fields.map((field) => (
              <div
                key={field.id}
                className='flex items-center justify-between py-1'
              >
                <label
                  htmlFor={`field-${field.id}`}
                  className='text-sm text-gray-700 cursor-pointer flex-1'
                >
                  {field.label}
                </label>
                <Switch
                  id={`field-${field.id}`}
                  checked={field.visible}
                  onCheckedChange={(checked) =>
                    onFieldToggle(field.id, checked)
                  }
                />
              </div>
            ))}
          </div>

          {/* Footer info */}
          <div className='mt-4 pt-3 border-t border-gray-100'>
            <p className='text-xs text-gray-500'>
              💡 Masquez les champs non pertinents pour ce poste
            </p>
          </div>
        </div>

        {/* Pointer triangle */}
        <div
          className='absolute w-3 h-3 bg-white border-l border-t border-gray-200 transform rotate-45'
          style={{
            top: '-6px',
            left: '24px',
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};
