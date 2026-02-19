'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle,
  Crown,
  Download,
  Edit3,
  GripVertical,
  Layout,
  Move,
  Palette,
  Presentation,
  Redo2,
  Share2,
  Shield,
  Undo2,
  X,
} from 'lucide-react';
import React, { useState } from 'react';

interface EnhanceCVSidebarProps {
  onAddSection: () => void;
  onRearrangeSections: () => void;
  onSelectTemplate: () => void;
  onDesignSettings: () => void;
  onTextReview: () => void;
  onATSCheck: () => void;
  onDownload: () => void;
  onDownloadPPTX?: () => void;
  onShare: () => void;
  onHistory: () => void;
  onBrandingToggle: (enabled: boolean) => void;
  textErrorsCount?: number;
  brandingEnabled?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  className?: string;
}

export const EnhanceCVSidebar: React.FC<EnhanceCVSidebarProps> = ({
  onAddSection,
  onRearrangeSections,
  onSelectTemplate,
  onDesignSettings,
  onTextReview,
  onATSCheck,
  onDownload,
  onDownloadPPTX,
  onShare,
  _onHistory,
  _onBrandingToggle,
  textErrorsCount = 0,
  _brandingEnabled = false,
  canUndo = false,
  canRedo = false,
  className = '',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const mainActions = [
    {
      id: 'add-section',
      icon: Edit3,
      label: 'Ajouter section',
      onClick: onAddSection,
      color: 'blue',
    },
    {
      id: 'templates',
      icon: Layout,
      label: 'Modèles',
      onClick: onSelectTemplate,
      color: 'purple',
    },
    {
      id: 'design',
      icon: Palette,
      label: 'Design',
      onClick: onDesignSettings,
      color: 'green',
    },
    {
      id: 'download',
      icon: Download,
      label: 'PDF',
      onClick: onDownload,
      color: 'orange',
    },
  ];

  const secondaryActions = [
    {
      id: 'download-pptx',
      icon: Presentation,
      label: 'Export PPTX',
      onClick: onDownloadPPTX,
      hidden: !onDownloadPPTX,
    },
    {
      id: 'rearrange',
      icon: Move,
      label: 'Réorganiser',
      onClick: onRearrangeSections,
    },
    {
      id: 'text-review',
      icon: CheckCircle,
      label: 'Réviser',
      onClick: onTextReview,
      badge: textErrorsCount > 0 ? textErrorsCount : undefined,
    },
    {
      id: 'ats-check',
      icon: Shield,
      label: 'Vérifier ATS',
      onClick: onATSCheck,
    },
    {
      id: 'share',
      icon: Share2,
      label: 'Partager',
      onClick: onShare,
    },
  ];

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 hover:bg-blue-600',
      purple: 'bg-purple-500 hover:bg-purple-600',
      green: 'bg-green-500 hover:bg-green-600',
      orange: 'bg-orange-500 hover:bg-orange-600',
    };
    return (
      colors[color as keyof typeof colors] || 'bg-gray-500 hover:bg-gray-600'
    );
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={{
        left: 0,
        right: typeof window !== 'undefined' ? window.innerWidth - 500 : 1200,
        top: 0,
        bottom: typeof window !== 'undefined' ? window.innerHeight - 400 : 800,
      }}
      dragTransition={{
        bounceStiffness: 600,
        bounceDamping: 20,
        power: 0.3,
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      initial={{ x: 100, y: 100, scale: 1 }}
      animate={{
        scale: isDragging ? 1.05 : 1,
        rotateZ: isDragging ? 2 : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      className={`fixed z-50 rounded-2xl ${className}`}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      <motion.div
        className={`bg-white rounded-2xl border border-gray-200 transition-all duration-300 overflow-hidden ${
          isCollapsed ? 'w-16' : 'w-72'
        }`}
        animate={{
          boxShadow: isDragging
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            : '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 25,
        }}
      >
        {/* Header */}
        <motion.div
          className='flex items-center justify-between p-4 border-b border-gray-100 cursor-grab rounded-t-2xl'
          animate={{
            backgroundColor: isDragging
              ? 'rgba(59, 130, 246, 0.05)'
              : 'rgba(255, 255, 255, 1)',
          }}
          transition={{ duration: 0.2 }}
        >
          <div className='flex items-center space-x-2'>
            <GripVertical className='w-4 h-4 text-gray-400' />
            {!isCollapsed && (
              <h3 className='font-semibold text-gray-900'>CV Tools</h3>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className='p-1 text-gray-400 rounded hover:bg-gray-100 hover:text-gray-600'
          >
            {isCollapsed ? (
              <Edit3 className='w-4 h-4' />
            ) : (
              <X className='w-4 h-4' />
            )}
          </button>
        </motion.div>

        {!isCollapsed && (
          <div className='p-4 space-y-4'>
            {/* Undo/Redo */}
            <div className='flex items-center space-x-2'>
              <motion.button
                className={`flex-1 p-2 rounded-lg border transition-colors ${
                  canUndo
                    ? 'text-gray-700 border-gray-200 hover:bg-gray-50'
                    : 'text-gray-300 border-gray-100 cursor-not-allowed'
                }`}
                disabled={!canUndo}
                whileHover={canUndo ? { scale: 1.02 } : {}}
                whileTap={canUndo ? { scale: 0.98 } : {}}
              >
                <Undo2 className='w-4 h-4 mx-auto' />
              </motion.button>
              <motion.button
                className={`flex-1 p-2 rounded-lg border transition-colors ${
                  canRedo
                    ? 'text-gray-700 border-gray-200 hover:bg-gray-50'
                    : 'text-gray-300 border-gray-100 cursor-not-allowed'
                }`}
                disabled={!canRedo}
                whileHover={canRedo ? { scale: 1.02 } : {}}
                whileTap={canRedo ? { scale: 0.98 } : {}}
              >
                <Redo2 className='w-4 h-4 mx-auto' />
              </motion.button>
            </div>

            {/* Main Actions */}
            <div className='grid grid-cols-2 gap-2'>
              {mainActions.map((action) => (
                <motion.button
                  key={action.id}
                  className={`p-3 rounded-xl text-white font-medium text-sm transition-all relative ${getColorClasses(
                    action.color
                  )}`}
                  onClick={action.onClick}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {action.locked && (
                    <Crown className='absolute w-3 h-3 text-yellow-300 top-1 right-1' />
                  )}
                  <action.icon className='w-5 h-5 mx-auto mb-1' />
                  <div className='text-xs'>{action.label}</div>
                </motion.button>
              ))}
            </div>

            {/* Secondary Actions */}
            <div className='space-y-2'>
              {secondaryActions
                .filter((action) => !action.hidden)
                .map((action) => (
                  <motion.button
                    key={action.id}
                    className='relative flex items-center w-full p-2 text-sm text-gray-700 transition-colors rounded-lg hover:bg-gray-50'
                    onClick={action.onClick}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {action.locked && (
                      <Crown className='absolute w-3 h-3 text-yellow-500 top-1 right-1' />
                    )}
                    <action.icon className='w-4 h-4 mr-3' />
                    <span className='flex-1 text-left'>{action.label}</span>
                    {action.badge && (
                      <span className='px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full'>
                        {action.badge}
                      </span>
                    )}
                  </motion.button>
                ))}
            </div>
          </div>
        )}

        {/* Collapsed View */}
        {isCollapsed && (
          <div className='p-2 space-y-2'>
            {mainActions.slice(0, 3).map((action) => (
              <motion.button
                key={action.id}
                className={`w-full p-2 rounded-lg text-white transition-all ${getColorClasses(
                  action.color
                )}`}
                onClick={action.onClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={action.label}
              >
                <action.icon className='w-4 h-4 mx-auto' />
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
