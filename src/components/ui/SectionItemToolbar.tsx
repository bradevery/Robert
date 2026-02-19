'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, ChevronDown, Settings, Trash2, Type } from 'lucide-react';
import React from 'react';

interface SectionItemToolbarProps {
  isVisible: boolean;
  position: { x: number; y: number };
  onAddEntry: () => void;
  onTextFormat: () => void;
  onAddDate: () => void;
  onDelete: () => void;
  onSettings: () => void;
  onClose: () => void;
}

export const SectionItemToolbar: React.FC<SectionItemToolbarProps> = ({
  isVisible,
  position,
  _onAddEntry,
  onTextFormat,
  onAddDate,
  onDelete,
  onSettings,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <div className='fixed inset-0 z-40' onClick={onClose} />

          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
            }}
            className='fixed z-50 flex items-center bg-white border border-gray-200 rounded-full shadow-lg'
            style={{
              left: position.x,
              top: position.y - 60, // Position above the item
            }}
          >
            {/* Add Entry Button - Hidden */}
            {/* <motion.button
              onClick={onAddEntry}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-full hover:bg-green-600 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Entry
            </motion.button> */}

            {/* Dropdown */}
            <motion.button
              className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronDown className='w-4 h-4' />
            </motion.button>

            {/* Text Format */}
            <motion.button
              onClick={onTextFormat}
              className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Type className='w-4 h-4' />
            </motion.button>

            {/* Calendar */}
            <motion.button
              onClick={onAddDate}
              className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Calendar className='w-4 h-4' />
            </motion.button>

            {/* Delete */}
            <motion.button
              onClick={onDelete}
              className='p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trash2 className='w-4 h-4' />
            </motion.button>

            {/* Settings */}
            <motion.button
              onClick={onSettings}
              className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors mr-2'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className='w-4 h-4' />
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
