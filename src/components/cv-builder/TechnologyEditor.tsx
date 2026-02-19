'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Edit, Layers, Plus, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';

import { CVItem, useCVStore } from '@/stores/cv-store-unified';

interface TechnologyGroup extends CVItem {
  title: string;
  tags: string[];
}

export const TechnologyEditor: React.FC = () => {
  const { cv, addItem, updateItem, removeItem } = useCVStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const createNewGroup = (): TechnologyGroup => ({
    id: `tech_group_${Date.now()}`,
    title: '',
    tags: [],
    visible: true,
  });

  const [newGroup, setNewGroup] = useState<TechnologyGroup>(createNewGroup());

  if (!cv) return null;

  // Ensure technology section exists, if not use empty array.
  // Note: ModernCVBuilder should ensure section exists in store or we handle it here.
  const technologyGroups = (cv.data.sections.technology?.items ||
    []) as TechnologyGroup[];

  const handleAddGroup = () => {
    if (newGroup.title.trim()) {
      addItem('technology', newGroup);
      setNewGroup(createNewGroup());
      setIsAdding(false);
    }
  };

  const handleEditGroup = (
    id: string,
    updatedGroup: Partial<TechnologyGroup>
  ) => {
    updateItem('technology', id, updatedGroup);
  };

  const handleDeleteGroup = (id: string) => {
    removeItem('technology', id);
  };

  const GroupForm = ({
    group,
    onChange,
    onSave,
    onCancel,
  }: {
    group: TechnologyGroup;
    onChange: (field: string, value: any) => void;
    onSave: () => void;
    onCancel: () => void;
  }) => {
    const [tagInput, setTagInput] = useState('');

    const handleAddTag = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && tagInput.trim()) {
        e.preventDefault();
        const newTags = [...(group.tags || []), tagInput.trim()];
        onChange('tags', newTags);
        setTagInput('');
      }
    };

    const removeTag = (indexToRemove: number) => {
      const newTags = (group.tags || []).filter(
        (_, index) => index !== indexToRemove
      );
      onChange('tags', newTags);
    };

    return (
      <div className='p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Titre du groupe *
          </label>
          <input
            type='text'
            value={group.title || ''}
            onChange={(e) => onChange('title', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Hard Skills, Soft Skills, Langages...'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Compétences (Tags)
          </label>
          <div className='flex flex-wrap gap-2 mb-2'>
            {group.tags?.map((tag, index) => (
              <span
                key={index}
                className='inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded-md text-sm'
              >
                {tag}
                <button
                  onClick={() => removeTag(index)}
                  className='text-gray-500 hover:text-red-500'
                >
                  <X className='w-3 h-3' />
                </button>
              </span>
            ))}
          </div>
          <input
            type='text'
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Appuyez sur Entrée pour ajouter...'
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
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Layers className='w-5 h-5 text-blue-600' />
          <h3 className='text-lg font-semibold text-gray-900'>
            Compétences (Groupées)
          </h3>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className='flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          <Plus className='w-4 h-4' />
          Ajouter Groupe
        </button>
      </div>

      {isAdding && (
        <GroupForm
          group={newGroup}
          onChange={(field, value) =>
            setNewGroup({ ...newGroup, [field]: value })
          }
          onSave={handleAddGroup}
          onCancel={() => {
            setIsAdding(false);
            setNewGroup(createNewGroup());
          }}
        />
      )}

      <div className='space-y-4'>
        {technologyGroups.map((group: TechnologyGroup) => (
          <div
            key={group.id}
            className='border border-gray-200 rounded-lg p-4 bg-white'
          >
            {editingId === group.id ? (
              <GroupForm
                group={group}
                onChange={(field, value) =>
                  handleEditGroup(group.id, { [field]: value })
                }
                onSave={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className='flex items-start justify-between'>
                <div>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    {group.title}
                  </h4>
                  <div className='flex flex-wrap gap-2'>
                    {group.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className='px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className='flex gap-2 ml-4'>
                  <button
                    onClick={() => setEditingId(group.id)}
                    className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md'
                  >
                    <Edit className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {technologyGroups.length === 0 && !isAdding && (
          <div className='text-center py-8 text-gray-500'>
            <Layers className='w-8 h-8 mx-auto mb-2 text-gray-300' />
            <p>Aucun groupe de compétences ajouté</p>
            <p className='text-sm'>
              Cliquez sur "Ajouter Groupe" pour commencer
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
