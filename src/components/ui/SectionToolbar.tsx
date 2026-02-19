'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import React from 'react';

interface SectionToolbarProps {
  isVisible: boolean;
  position: { x: number; y: number };
  onAddEntry: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onClose: () => void;
}

export const SectionToolbar: React.FC<SectionToolbarProps> = ({
  isVisible,
  position,
  _onAddEntry,
  onDelete,
  onMoveUp,
  onMoveDown,
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
              top: position.y - 60, // Position above the section
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

            {/* Delete */}
            <motion.button
              onClick={onDelete}
              className='p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trash2 className='w-4 h-4' />
            </motion.button>

            {/* Move Up */}
            <motion.button
              onClick={onMoveUp}
              className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowUp className='w-4 h-4' />
            </motion.button>

            {/* Move Down */}
            <motion.button
              onClick={onMoveDown}
              className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors mr-2'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowDown className='w-4 h-4' />
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
