'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Edit, Plus, Trash2, Trophy } from 'lucide-react';
import React, { useState } from 'react';

import { CVItem, useCVStore } from '@/stores/cv-store-unified';

interface AchievementItem extends CVItem {
  title: string;
  description: string;
}

export const AchievementEditor: React.FC = () => {
  const { cv, addItem, updateItem, removeItem } = useCVStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const createNewAchievement = (): AchievementItem => ({
    id: `achievement_${Date.now()}`,
    title: '',
    description: '',
    visible: true,
  });

  const [newAchievement, setNewAchievement] = useState<AchievementItem>(
    createNewAchievement()
  );

  if (!cv) return null;

  const achievements = (cv.data.sections.achievement?.items ||
    []) as AchievementItem[];

  const handleAdd = () => {
    if (newAchievement.title) {
      addItem('achievement', newAchievement);
      setNewAchievement(createNewAchievement());
      setIsAdding(false);
    }
  };

  const handleEdit = (
    id: string,
    updatedAchievement: Partial<AchievementItem>
  ) => {
    updateItem('achievement', id, updatedAchievement);
  };

  const handleDelete = (id: string) => {
    removeItem('achievement', id);
  };

  const AchievementForm = ({
    achievement,
    onChange,
    onSave,
    onCancel,
  }: {
    achievement: AchievementItem;
    onChange: (field: string, value: any) => void;
    onSave: () => void;
    onCancel: () => void;
  }) => (
    <div className='p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3'>
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Réalisation (Titre) *
        </label>
        <input
          type='text'
          value={achievement.title || ''}
          onChange={(e) => onChange('title', e.target.value)}
          className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          placeholder='Ex: Augmentation des ventes...'
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Description
        </label>
        <textarea
          value={achievement.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          rows={3}
          className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
          placeholder="Décrivez ce que vous avez fait et l'impact que cela a eu..."
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
          <Trophy className='w-5 h-5 text-blue-600' />
          <h3 className='text-lg font-semibold text-gray-900'>Réalisations</h3>
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
        <AchievementForm
          achievement={newAchievement}
          onChange={(field, value) =>
            setNewAchievement({ ...newAchievement, [field]: value })
          }
          onSave={handleAdd}
          onCancel={() => {
            setIsAdding(false);
            setNewAchievement(createNewAchievement());
          }}
        />
      )}

      <div className='space-y-4'>
        {achievements.map((item: AchievementItem) => (
          <div
            key={item.id}
            className='border border-gray-200 rounded-lg p-4 bg-white'
          >
            {editingId === item.id ? (
              <AchievementForm
                achievement={item}
                onChange={(field, value) =>
                  handleEdit(item.id, { [field]: value })
                }
                onSave={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className='flex items-start justify-between'>
                <div>
                  <h4 className='font-semibold text-gray-900'>{item.title}</h4>
                  <p className='text-gray-700 text-sm mt-1'>
                    {item.description}
                  </p>
                </div>
                <div className='flex gap-2 ml-4'>
                  <button
                    onClick={() => setEditingId(item.id)}
                    className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md'
                  >
                    <Edit className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {achievements.length === 0 && !isAdding && (
          <div className='text-center py-8 text-gray-500'>
            <Trophy className='w-8 h-8 mx-auto mb-2 text-gray-300' />
            <p>Aucune réalisation ajoutée</p>
            <p className='text-sm'>Cliquez sur "Ajouter" pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
};
