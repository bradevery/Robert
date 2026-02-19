'use client';

import {
  Calendar,
  Edit,
  ExternalLink,
  Plus,
  Trash2,
  Trophy,
} from 'lucide-react';
import React, { useState } from 'react';

import { useResumeStore } from '@/stores/resume-simple';

interface AwardItem {
  id: string;
  title: string;
  awarder: string;
  date?: string;
  url?: string;
  summary?: string;
}

export const AwardsEditor: React.FC = () => {
  const { resume, setValue } = useResumeStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const createNewAward = (): AwardItem => ({
    id: `award_${Date.now()}`,
    title: '',
    awarder: '',
    date: '',
    url: '',
    summary: '',
  });

  const [newAward, setNewAward] = useState<AwardItem>(createNewAward());

  if (!resume) return null;

  const awards = resume.data.sections.awards?.items || [];

  const updateAwards = (newAwards: AwardItem[]) => {
    setValue('data.sections.awards.items', newAwards);
  };

  const handleAdd = () => {
    if (newAward.title && newAward.awarder) {
      const updatedAwards = [...awards, newAward];
      updateAwards(updatedAwards);
      setNewAward(createNewAward());
      setIsAdding(false);
    }
  };

  const handleEdit = (id: string, updatedAward: Partial<AwardItem>) => {
    const updatedAwards = awards.map((award: AwardItem) =>
      award.id === id ? { ...award, ...updatedAward } : award
    );
    updateAwards(updatedAwards);
  };

  const handleDelete = (id: string) => {
    const updatedAwards = awards.filter((award: AwardItem) => award.id !== id);
    updateAwards(updatedAwards);
  };

  const AwardForm = ({
    award,
    onChange,
    onSave,
    onCancel,
  }: {
    award: AwardItem;
    onChange: (field: string, value: string) => void;
    onSave: () => void;
    onCancel: () => void;
  }) => (
    <div className='p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Titre de la récompense *
          </label>
          <input
            type='text'
            value={award.title}
            onChange={(e) => onChange('title', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder="Prix d'excellence, Meilleur projet..."
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Organisme *
          </label>
          <input
            type='text'
            value={award.awarder}
            onChange={(e) => onChange('awarder', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Université, Entreprise, Association...'
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Date d'obtention
          </label>
          <input
            type='month'
            value={award.date || ''}
            onChange={(e) => onChange('date', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            URL de la récompense
          </label>
          <input
            type='url'
            value={award.url || ''}
            onChange={(e) => onChange('url', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='https://example.com/award'
          />
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Description
        </label>
        <textarea
          value={award.summary || ''}
          onChange={(e) => onChange('summary', e.target.value)}
          rows={3}
          className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
          placeholder="Contexte de la récompense, critères d'attribution..."
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
          <h3 className='text-lg font-semibold text-gray-900'>Récompenses</h3>
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
        <AwardForm
          award={newAward}
          onChange={(field, value) =>
            setNewAward({ ...newAward, [field]: value })
          }
          onSave={handleAdd}
          onCancel={() => {
            setIsAdding(false);
            setNewAward(createNewAward());
          }}
        />
      )}

      {/* Liste des récompenses */}
      <div className='space-y-4'>
        {awards.map((award: AwardItem) => (
          <div
            key={award.id}
            className='border border-gray-200 rounded-lg p-4 bg-white'
          >
            {editingId === award.id ? (
              <AwardForm
                award={award}
                onChange={(field, value) =>
                  handleEdit(award.id, { [field]: value })
                }
                onSave={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-2'>
                    <h4 className='font-semibold text-gray-900'>
                      {award.title}
                    </h4>
                    {award.url && (
                      <a
                        href={award.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-600 hover:text-blue-700'
                      >
                        <ExternalLink className='w-4 h-4' />
                      </a>
                    )}
                  </div>

                  <p className='text-blue-600 font-medium text-sm mb-1'>
                    {award.awarder}
                  </p>

                  {award.date && (
                    <div className='flex items-center gap-1 text-sm text-gray-500 mb-2'>
                      <Calendar className='w-3 h-3' />
                      {award.date}
                    </div>
                  )}

                  {award.summary && (
                    <p className='text-gray-700 text-sm leading-relaxed'>
                      {award.summary}
                    </p>
                  )}
                </div>
                <div className='flex gap-2 ml-4'>
                  <button
                    onClick={() => setEditingId(award.id)}
                    className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md'
                  >
                    <Edit className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => handleDelete(award.id)}
                    className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {awards.length === 0 && !isAdding && (
          <div className='text-center py-8 text-gray-500'>
            <Trophy className='w-8 h-8 mx-auto mb-2 text-gray-300' />
            <p>Aucune récompense ajoutée</p>
            <p className='text-sm'>Cliquez sur "Ajouter" pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
};
