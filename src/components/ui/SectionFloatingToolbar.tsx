'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  ChevronUp,
  Plus,
  Settings,
  Trash2,
  Type,
} from 'lucide-react';
import React, { useState } from 'react';

interface SectionFloatingToolbarProps {
  isVisible: boolean;
  sectionId: string;
  sectionType: string;
  onAddItem: () => void;
  onToggleCollapse: () => void;
  onTextOptions: () => void;
  onDateOptions: () => void;
  onDeleteSection: () => void;
  onSectionSettings: () => void;
  position?: { top: number; right: number };
  className?: string;
}

export const SectionFloatingToolbar: React.FC<SectionFloatingToolbarProps> = ({
  isVisible,
  _sectionId,
  _sectionType,
  onAddItem,
  onToggleCollapse,
  onTextOptions,
  onDateOptions,
  onDeleteSection,
  onSectionSettings,
  position = { top: 0, right: 0 },
  className = '',
}) => {
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const handleButtonClick = (buttonId: string, action: () => void) => {
    setActiveButton(buttonId);
    action();
    // Reset active state after a short delay
    setTimeout(() => setActiveButton(null), 200);
  };

  const toolbarButtons = [
    {
      id: 'add',
      icon: Plus,
      label: 'Entrée',
      onClick: onAddItem,
      className: 'bg-green-600 hover:bg-green-700 text-white',
      showLabel: true,
    },
    {
      id: 'collapse',
      icon: ChevronUp,
      label: 'Réduire',
      onClick: onToggleCollapse,
      className: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    },
    {
      id: 'text',
      icon: Type,
      label: 'Texte',
      onClick: onTextOptions,
      className: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    },
    {
      id: 'date',
      icon: Calendar,
      label: 'Date',
      onClick: onDateOptions,
      className: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    },
    {
      id: 'delete',
      icon: Trash2,
      label: 'Supprimer',
      onClick: onDeleteSection,
      className:
        'bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-600',
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Paramètres',
      onClick: onSectionSettings,
      className: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    },
  ];

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.15 }}
        className={`fixed z-50 ${className}`}
        style={{
          top: position.top,
          right: position.right,
        }}
      >
        <div className='flex items-center gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1'>
          {toolbarButtons.map((button) => {
            const Icon = button.icon;
            const isActive = activeButton === button.id;

            return (
              <motion.button
                key={button.id}
                onClick={() => handleButtonClick(button.id, button.onClick)}
                className={`
                  flex items-center gap-1 px-2 py-2 rounded-md transition-all duration-150 text-sm font-medium
                  ${button.className}
                  ${isActive ? 'scale-95' : 'hover:scale-105'}
                `}
                whileTap={{ scale: 0.95 }}
                title={button.label}
              >
                <Icon className='w-4 h-4' />
                {button.showLabel && (
                  <span className='hidden sm:inline-block'>{button.label}</span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Tooltip triangle */}
        <div
          className='absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white'
          style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))' }}
        />
      </motion.div>
    </AnimatePresence>
  );
};
