'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  ChevronDown,
  Plus,
  Settings,
  Trash2,
  Type,
} from 'lucide-react';
import React, { useEffect, useRef } from 'react';

interface OptionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEntry: () => void;
  onAddDate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  position?: { x: number; y: number };
  sectionType?: string;
}

export const OptionsMenu: React.FC<OptionsMenuProps> = ({
  isOpen,
  onClose,
  onAddEntry,
  onAddDate,
  onDelete,
  _onMoveUp,
  _onMoveDown,
  _onDuplicate,
  position = { x: 0, y: 0 },
  _sectionType = 'section',
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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
        ref={menuRef}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.15 }}
        className='fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center'
        style={{
          left: position.x - 150, // Offset to center the toolbar
          top: position.y - 50,
        }}
      >
        {/* Add Entry Button - Green like in the design */}
        <button
          onClick={() => {
            onAddEntry();
            onClose();
          }}
          className='flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-l-lg hover:bg-green-600 transition-colors text-sm font-medium'
        >
          <Plus className='w-4 h-4' />
          Entrée
        </button>

        {/* Dropdown Arrow */}
        <button className='flex items-center justify-center w-8 h-10 bg-green-500 text-white hover:bg-green-600 transition-colors border-l border-green-400'>
          <ChevronDown className='w-4 h-4' />
        </button>

        {/* Text/Type Button */}
        <button
          onClick={() => {
            // Handle text type action
            onClose();
          }}
          className='flex items-center justify-center w-10 h-10 hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900 border-r border-gray-200'
          title='Texte'
        >
          <Type className='w-4 h-4' />
        </button>

        {/* Calendar/Date Button */}
        <button
          onClick={() => {
            onAddDate();
            onClose();
          }}
          className='flex items-center justify-center w-10 h-10 hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900 border-r border-gray-200'
          title='Date'
        >
          <Calendar className='w-4 h-4' />
        </button>

        {/* Delete Button */}
        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className='flex items-center justify-center w-10 h-10 hover:bg-red-50 transition-colors text-gray-700 hover:text-red-600 border-r border-gray-200'
          title='Supprimer'
        >
          <Trash2 className='w-4 h-4' />
        </button>

        {/* Settings Button */}
        <button
          onClick={() => {
            // Handle settings action
            onClose();
          }}
          className='flex items-center justify-center w-10 h-10 hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900 rounded-r-lg'
          title='Paramètres'
        >
          <Settings className='w-4 h-4' />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
