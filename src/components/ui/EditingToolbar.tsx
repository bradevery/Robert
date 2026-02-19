'use client';

import {
  AlignCenter,
  AlignLeft,
  Bold,
  Calendar,
  ChevronDown,
  Italic,
  Link,
  Plus,
  Settings,
  Trash2,
  Type,
  Underline,
} from 'lucide-react';
import React from 'react';

export type ToolbarType = 'section' | 'text';

interface EditingToolbarProps {
  type: ToolbarType;
  position: { x: number; y: number };
  onAddEntry?: () => void;
  onDelete?: () => void;
  onSettings?: () => void;
  onBold?: () => void;
  onItalic?: () => void;
  onUnderline?: () => void;
  onAlignLeft?: () => void;
  onAlignCenter?: () => void;
  onLink?: () => void;
  onClose?: () => void;
}

export const EditingToolbar: React.FC<EditingToolbarProps> = ({
  type,
  position,
  onAddEntry,
  onDelete,
  onSettings,
  onBold,
  onItalic,
  onUnderline,
  onAlignLeft,
  onAlignCenter,
  onLink,
  _onClose,
}) => {
  const renderSectionToolbar = () => (
    <div className='flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1'>
      <button
        onClick={onAddEntry}
        className='flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-md transition-colors'
        title='Ajouter une entrée'
      >
        <Plus className='w-4 h-4' />
        Entrée
      </button>

      <div className='w-px h-6 bg-gray-200 mx-1' />

      <button
        onClick={() => void 0}
        className='flex items-center gap-1 px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors'
        title='Options de tri'
      >
        <ChevronDown className='w-4 h-4' />
      </button>

      <button
        onClick={() => void 0}
        className='p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors'
        title='Formatage de texte'
      >
        <Type className='w-4 h-4' />
      </button>

      <button
        onClick={() => void 0}
        className='p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors'
        title='Date'
      >
        <Calendar className='w-4 h-4' />
      </button>

      <button
        onClick={onDelete}
        className='p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors'
        title='Supprimer'
      >
        <Trash2 className='w-4 h-4' />
      </button>

      <button
        onClick={onSettings}
        className='p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors'
        title='Paramètres'
      >
        <Settings className='w-4 h-4' />
      </button>
    </div>
  );

  const renderTextToolbar = () => (
    <div className='flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1'>
      <button
        onClick={onBold}
        className='p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors'
        title='Gras'
      >
        <Bold className='w-4 h-4' />
      </button>

      <button
        onClick={onItalic}
        className='p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors'
        title='Italique'
      >
        <Italic className='w-4 h-4' />
      </button>

      <button
        onClick={onUnderline}
        className='p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors'
        title='Souligné'
      >
        <Underline className='w-4 h-4' />
      </button>

      <div className='w-px h-6 bg-gray-200 mx-1' />

      <button
        onClick={onAlignLeft}
        className='p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors'
        title='Aligner à gauche'
      >
        <AlignLeft className='w-4 h-4' />
      </button>

      <button
        onClick={onAlignCenter}
        className='p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors'
        title='Centrer'
      >
        <AlignCenter className='w-4 h-4' />
      </button>

      <div className='w-px h-6 bg-gray-200 mx-1' />

      <button
        onClick={onLink}
        className='p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors'
        title='Lien'
      >
        <Link className='w-4 h-4' />
      </button>
    </div>
  );

  return (
    <div
      className='fixed z-50'
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {type === 'section' ? renderSectionToolbar() : renderTextToolbar()}
    </div>
  );
};
