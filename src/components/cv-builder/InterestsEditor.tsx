'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Edit, Heart, Plus, Tag, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

import { useResumeStore } from '@/stores/resume-simple';

interface InterestItem {
  id: string;
  name: string;
  keywords?: string[];
}

export const InterestsEditor: React.FC = () => {
  const { resume, setValue } = useResumeStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const createNewInterest = (): InterestItem => ({
    id: `interest_${Date.now()}`,
    name: '',
    keywords: [],
  });

  const [newInterest, setNewInterest] = useState<InterestItem>(
    createNewInterest()
  );

  if (!resume) return null;

  const interests = resume.data.sections.interests?.items || [];

  const updateInterests = (newInterests: InterestItem[]) => {
    setValue('data.sections.interests.items', newInterests);
  };

  const handleAdd = () => {
    if (newInterest.name.trim()) {
      const updatedInterests = [...interests, newInterest];
      updateInterests(updatedInterests);
      setNewInterest(createNewInterest());
      setIsAdding(false);
    }
  };

  const handleEdit = (id: string, updatedInterest: Partial<InterestItem>) => {
    const updatedInterests = interests.map((interest: InterestItem) =>
      interest.id === id ? { ...interest, ...updatedInterest } : interest
    );
    updateInterests(updatedInterests);
  };

  const handleDelete = (id: string) => {
    const updatedInterests = interests.filter(
      (interest: InterestItem) => interest.id !== id
    );
    updateInterests(updatedInterests);
  };

  const handleKeywordsChange = (
    keywords: string,
    onChange: (field: string, value: any) => void
  ) => {
    const keywordArray = keywords
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k);
    onChange('keywords', keywordArray);
  };

  const InterestForm = ({
    interest,
    onChange,
    onSave,
    onCancel,
  }: {
    interest: InterestItem;
    onChange: (field: string, value: any) => void;
    onSave: () => void;
    onCancel: () => void;
  }) => (
    <div className='p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3'>
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Centre d'intérêt *
        </label>
        <input
          type='text'
          value={interest.name}
          onChange={(e) => onChange('name', e.target.value)}
          className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          placeholder='Photographie, Cuisine, Sport...'
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Mots-clés associés
        </label>
        <input
          type='text'
          value={interest.keywords?.join(', ') || ''}
          onChange={(e) => handleKeywordsChange(e.target.value, onChange)}
          className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          placeholder='Portrait, Voyage, Nature'
        />
        <p className='text-xs text-gray-500 mt-1'>Séparez par des virgules</p>
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
          <Heart className='w-5 h-5 text-blue-600' />
          <h3 className='text-lg font-semibold text-gray-900'>
            Centres d'intérêt
          </h3>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className='flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          <Plus className='w-4 h-4' />
          Ajouter
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {isAdding && (
        <InterestForm
          interest={newInterest}
          onChange={(field, value) =>
            setNewInterest({ ...newInterest, [field]: value })
          }
          onSave={handleAdd}
          onCancel={() => {
            setIsAdding(false);
            setNewInterest(createNewInterest());
          }}
        />
      )}

      {/* Liste des centres d'intérêt */}
      <div className='space-y-3'>
        {interests.map((interest: InterestItem) => (
          <div
            key={interest.id}
            className='border border-gray-200 rounded-lg p-4 bg-white'
          >
            {editingId === interest.id ? (
              <InterestForm
                interest={interest}
                onChange={(field, value) =>
                  handleEdit(interest.id, { [field]: value })
                }
                onSave={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    {interest.name}
                  </h4>

                  {interest.keywords && interest.keywords.length > 0 && (
                    <div className='flex items-center gap-1 flex-wrap'>
                      <Tag className='w-3 h-3 text-gray-400' />
                      {interest.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className='px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className='flex gap-2 ml-4'>
                  <button
                    onClick={() => setEditingId(interest.id)}
                    className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md'
                  >
                    <Edit className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => handleDelete(interest.id)}
                    className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {interests.length === 0 && !isAdding && (
          <div className='text-center py-8 text-gray-500'>
            <Heart className='w-8 h-8 mx-auto mb-2 text-gray-300' />
            <p>Aucun centre d'intérêt ajouté</p>
            <p className='text-sm'>Cliquez sur "Ajouter" pour commencer</p>
          </div>
        )}
      </div>

      {/* Aperçu rapide */}
      {interests.length > 0 && (
        <div className='p-4 bg-blue-50 rounded-lg'>
          <h4 className='text-sm font-medium text-blue-900 mb-2'>
            Aperçu des centres d'intérêt
          </h4>
          <div className='flex flex-wrap gap-2'>
            {interests.map((interest: InterestItem) => (
              <span
                key={interest.id}
                className='inline-flex items-center gap-1 px-3 py-1 bg-white border border-blue-200 rounded-full text-sm'
              >
                {interest.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
