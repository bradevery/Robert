'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link,
  Underline,
} from 'lucide-react';
import React, { useEffect, useRef } from 'react';

interface FormattingMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onFormat: (command: string) => void;
  position?: { x: number; y: number };
}

export const FormattingMenu: React.FC<FormattingMenuProps> = ({
  isOpen,
  onClose,
  onFormat,
  position = { x: 0, y: 0 },
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

  const formatActions = [
    {
      icon: Bold,
      command: 'bold',
      label: 'B',
    },
    {
      icon: Italic,
      command: 'italic',
      label: 'I',
    },
    {
      icon: Underline,
      command: 'underline',
      label: 'U',
    },
    {
      icon: AlignLeft,
      command: 'justifyLeft',
      label: 'Align Left',
    },
    {
      icon: AlignCenter,
      command: 'justifyCenter',
      label: 'Center',
    },
    {
      icon: AlignRight,
      command: 'justifyRight',
      label: 'Align Right',
    },
    {
      icon: Link,
      command: 'createLink',
      label: 'Link',
    },
  ];

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
          left: position.x - 120, // Center the toolbar
          top: position.y - 50,
        }}
      >
        {formatActions.map((action, index) => (
          <button
            key={index}
            onClick={() => {
              onFormat(action.command);
            }}
            className='flex items-center justify-center w-10 h-10 hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900 first:rounded-l-lg last:rounded-r-lg border-r border-gray-200 last:border-r-0'
            title={action.label}
          >
            <action.icon className='w-4 h-4' />
          </button>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};
