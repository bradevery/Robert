'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Edit, Plus, Star, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

import { CVItem, useCVStore } from '@/stores/cv-store-unified';

interface TalentItem extends CVItem {
  title: string;
  description: string;
}

export const TalentEditor: React.FC = () => {
  const { cv, addItem, updateItem, removeItem } = useCVStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const createNewTalent = (): TalentItem => ({
    id: `talent_${Date.now()}`,
    title: '',
    description: '',
    visible: true,
  });

  const [newTalent, setNewTalent] = useState<TalentItem>(createNewTalent());

  if (!cv) return null;

  const talents = (cv.data.sections.talent?.items || []) as TalentItem[];

  const handleAdd = () => {
    if (newTalent.title) {
      addItem('talent', newTalent);
      setNewTalent(createNewTalent());
      setIsAdding(false);
    }
  };

  const handleEdit = (id: string, updatedTalent: Partial<TalentItem>) => {
    updateItem('talent', id, updatedTalent);
  };

  const handleDelete = (id: string) => {
    removeItem('talent', id);
  };

  const TalentForm = ({
    talent,
    onChange,
    onSave,
    onCancel,
  }: {
    talent: TalentItem;
    onChange: (field: string, value: any) => void;
    onSave: () => void;
    onCancel: () => void;
  }) => (
    <div className='p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3'>
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Point fort (Titre) *
        </label>
        <input
          type='text'
          value={talent.title || ''}
          onChange={(e) => onChange('title', e.target.value)}
          className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          placeholder='Ex: Leadership, Créativité...'
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Description
        </label>
        <textarea
          value={talent.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          rows={3}
          className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
          placeholder='Expliquez comment cela bénéficie à votre travail...'
        />
      </div>

      <div className='flex gap-2 pt-2'>
        <button
          onClick={onSave}
          className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          Enregistrer
        </button>
        <button
          onClick={onCancel}
          className='px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500'
        >
          Annuler
        </button>
      </div>
    </div>
  );

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Star className='w-5 h-5 text-blue-600' />
          <h3 className='text-lg font-semibold text-gray-900'>Points forts</h3>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className='flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          <Plus className='w-4 h-4' />
          Ajouter
        </button>
      </div>

      {isAdding && (
        <TalentForm
          talent={newTalent}
          onChange={(field, value) =>
            setNewTalent({ ...newTalent, [field]: value })
          }
          onSave={handleAdd}
          onCancel={() => {
            setIsAdding(false);
            setNewTalent(createNewTalent());
          }}
        />
      )}

      <div className='space-y-4'>
        {talents.map((talent: TalentItem) => (
          <div
            key={talent.id}
            className='border border-gray-200 rounded-lg p-4 bg-white'
          >
            {editingId === talent.id ? (
              <TalentForm
                talent={talent}
                onChange={(field, value) =>
                  handleEdit(talent.id, { [field]: value })
                }
                onSave={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className='flex items-start justify-between'>
                <div>
                  <h4 className='font-semibold text-gray-900'>
                    {talent.title}
                  </h4>
                  <p className='text-gray-700 text-sm mt-1'>
                    {talent.description}
                  </p>
                </div>
                <div className='flex gap-2 ml-4'>
                  <button
                    onClick={() => setEditingId(talent.id)}
                    className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md'
                  >
                    <Edit className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => handleDelete(talent.id)}
                    className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {talents.length === 0 && !isAdding && (
          <div className='text-center py-8 text-gray-500'>
            <Star className='w-8 h-8 mx-auto mb-2 text-gray-300' />
            <p>Aucun point fort ajouté</p>
            <p className='text-sm'>Cliquez sur "Ajouter" pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
};
