'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Edit3, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';

interface SectionEditorProps {
  title: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  itemCount?: number;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  title,
  icon,
  children,
  onAdd,
  onEdit,
  _onDelete,
  isCollapsed = false,
  onToggleCollapse,
  itemCount = 0,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className='bg-white rounded-lg border border-gray-200 shadow-sm'>
      {/* Section Header */}
      <div className='flex items-center justify-between p-4 border-b border-gray-100'>
        <div className='flex items-center space-x-3'>
          <div className='text-blue-600'>{icon}</div>
          <div>
            <h3 className='font-semibold text-gray-900'>{title}</h3>
            <p className='text-sm text-gray-500'>
              {itemCount} élément{itemCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          {onAdd && (
            <Button
              onClick={onAdd}
              variant='outline'
              size='sm'
              className='text-blue-600 border-blue-200 hover:bg-blue-50'
            >
              <Plus className='w-4 h-4 mr-1' />
              Ajouter
            </Button>
          )}

          {onEdit && (
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant='ghost'
              size='sm'
              className='p-1.5 text-gray-600 hover:text-gray-900'
            >
              <Edit3 className='w-4 h-4' />
            </Button>
          )}

          {onToggleCollapse && (
            <Button
              onClick={onToggleCollapse}
              variant='ghost'
              size='sm'
              className='p-1.5 text-gray-600 hover:text-gray-900'
            >
              {isCollapsed ? (
                <ChevronDown className='w-4 h-4' />
              ) : (
                <ChevronUp className='w-4 h-4' />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Section Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <div className='p-4'>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Composant pour éditer les informations personnelles
export const PersonalInfoEditor: React.FC<{
  data: any;
  onUpdate: (data: any) => void;
}> = ({ data, onUpdate }) => {
  const [localData, setLocalData] = useState(data);

  const handleChange = (field: string, value: string) => {
    const updated = { ...localData, [field]: value };
    setLocalData(updated);
    onUpdate(updated);
  };

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Prénom
          </label>
          <input
            type='text'
            value={localData.firstName || ''}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Nom
          </label>
          <input
            type='text'
            value={localData.lastName || ''}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Email
        </label>
        <input
          type='email'
          value={localData.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Téléphone
        </label>
        <input
          type='tel'
          value={localData.phone || ''}
          onChange={(e) => handleChange('phone', e.target.value)}
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Localisation
        </label>
        <input
          type='text'
          value={localData.location || ''}
          onChange={(e) => handleChange('location', e.target.value)}
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          placeholder='Ville, Pays'
        />
      </div>
    </div>
  );
};

// Composant pour éditer le résumé
export const SummaryEditor: React.FC<{
  data: string;
  onUpdate: (data: string) => void;
}> = ({ data, onUpdate }) => {
  const [localData, setLocalData] = useState(data);

  const handleChange = (value: string) => {
    setLocalData(value);
    onUpdate(value);
  };

  return (
    <div>
      <label className='block text-sm font-medium text-gray-700 mb-2'>
        Résumé professionnel
      </label>
      <textarea
        value={localData || ''}
        onChange={(e) => handleChange(e.target.value)}
        rows={6}
        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
        placeholder='Décrivez votre profil professionnel en quelques phrases...'
      />
      <div className='text-xs text-gray-500 mt-1'>
        {(localData || '').length} caractères
      </div>
    </div>
  );
};

// Composant pour éditer une expérience
export const ExperienceEditor: React.FC<{
  data: any;
  onUpdate: (data: any) => void;
  onDelete: () => void;
}> = ({ data, onUpdate, onDelete }) => {
  const [localData, setLocalData] = useState(data);

  const handleChange = (field: string, value: string) => {
    const updated = { ...localData, [field]: value };
    setLocalData(updated);
    onUpdate(updated);
  };

  return (
    <div className='border border-gray-200 rounded-lg p-4 space-y-4'>
      <div className='flex justify-between items-start'>
        <h4 className='font-medium text-gray-900'>
          Expérience professionnelle
        </h4>
        <button
          onClick={onDelete}
          className='p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors'
        >
          <Trash2 className='w-4 h-4' />
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Titre du poste
          </label>
          <input
            type='text'
            value={localData.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Entreprise
          </label>
          <input
            type='text'
            value={localData.company || ''}
            onChange={(e) => handleChange('company', e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Date de début
          </label>
          <input
            type='month'
            value={localData.startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Date de fin
          </label>
          <input
            type='month'
            value={localData.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            placeholder='Poste actuel'
          />
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Description
        </label>
        <textarea
          value={localData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={4}
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
          placeholder='Décrivez vos responsabilités et réalisations...'
        />
      </div>
    </div>
  );
};
