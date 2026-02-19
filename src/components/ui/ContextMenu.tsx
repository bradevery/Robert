'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Copy, Edit, FileText, Languages, Mail } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

interface ContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onCopy: () => void;
  onAdaptForJob: () => void;
  onTranslate: () => void;
  onEdit: () => void;
  onNewCover: () => void;
  position?: { x: number; y: number };
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  onClose,
  onCopy,
  onAdaptForJob,
  onTranslate,
  onEdit,
  onNewCover,
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

  const menuItems = [
    {
      icon: Copy,
      label: 'Faire une copie',
      onClick: onCopy,
      shortcut: 'Ctrl+D',
    },
    {
      icon: Edit,
      label: 'Adapter pour un emploi',
      onClick: onAdaptForJob,
    },
    {
      icon: Languages,
      label: 'Traduire le CV',
      onClick: onTranslate,
    },
    {
      icon: FileText,
      label: 'Nouveau CV',
      onClick: onEdit,
    },
    {
      icon: Mail,
      label: 'Nouvelle lettre de motivation',
      onClick: onNewCover,
    },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className='fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[220px]'
        style={{
          left: position.x,
          top: position.y,
          transform: 'translateY(-10px)',
        }}
      >
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            className='w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors group'
          >
            <item.icon className='w-4 h-4 text-gray-500 mr-3 group-hover:text-gray-700' />
            <span className='text-sm text-gray-700 group-hover:text-gray-900 flex-1'>
              {item.label}
            </span>
            {item.shortcut && (
              <span className='text-xs text-gray-400 group-hover:text-gray-500'>
                {item.shortcut}
              </span>
            )}
          </button>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};
