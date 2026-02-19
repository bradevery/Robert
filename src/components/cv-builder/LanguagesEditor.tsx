'use client';

import { Edit, Globe, Plus, Star, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

import { CVItem, useCVStore } from '@/stores/cv-store-unified';

type FluencyLevel = 'elementary' | 'limited' | 'professional' | 'native' | '';

interface LanguageItem extends CVItem {
  language: string;
  fluency: FluencyLevel;
}

const fluencyLevels = [
  { value: 'elementary', label: 'Élémentaire', stars: 1 },
  { value: 'limited', label: 'Limité', stars: 2 },
  { value: 'professional', label: 'Professionnel', stars: 3 },
  { value: 'native', label: 'Natif', stars: 4 },
];

export const LanguagesEditor: React.FC = () => {
  const { cv, addItem, updateItem, removeItem } = useCVStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const createNewLanguage = (): LanguageItem => ({
    id: `lang_${Date.now()}`,
    language: '',
    fluency: '',
    visible: true,
  });

  const [newLanguage, setNewLanguage] = useState<LanguageItem>(
    createNewLanguage()
  );

  if (!cv) return null;

  const languages = (cv.data.sections.languages?.items || []) as LanguageItem[];

  const handleAdd = () => {
    if (newLanguage.language.trim()) {
      addItem('languages', newLanguage);
      setNewLanguage(createNewLanguage());
      setIsAdding(false);
    }
  };

  const handleEdit = (id: string, updatedLanguage: Partial<LanguageItem>) => {
    updateItem('languages', id, updatedLanguage);
  };

  const handleDelete = (id: string) => {
    removeItem('languages', id);
  };

  const FluencyIndicator = ({ fluency }: { fluency: FluencyLevel }) => {
    const level = fluencyLevels.find((l) => l.value === fluency);
    const stars = level?.stars ?? 0;
    const hasSelection = Boolean(level);

    return (
      <div className='flex items-center gap-1'>
        {[1, 2, 3, 4].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= stars ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span
          className={`text-xs ml-1 ${
            hasSelection ? 'text-gray-500' : 'text-gray-400 italic'
          }`}
        >
          {hasSelection ? level?.label : 'Niveau à sélectionner'}
        </span>
      </div>
    );
  };

  const LanguageForm = ({
    language,
    onChange,
    onSave,
    onCancel,
  }: {
    language: LanguageItem;
    onChange: (field: string, value: string) => void;
    onSave: () => void;
    onCancel: () => void;
  }) => (
    <div className='p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Langue *
          </label>
          <input
            type='text'
            value={language.language}
            onChange={(e) => onChange('language', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Français, Anglais, Espagnol...'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Niveau
          </label>
          <select
            value={language.fluency}
            onChange={(e) =>
              onChange('fluency', e.target.value as FluencyLevel)
            }
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value=''>Sélectionnez un niveau...</option>
            {fluencyLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
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
          <Globe className='w-5 h-5 text-blue-600' />
          <h3 className='text-lg font-semibold text-gray-900'>Langues</h3>
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
        <LanguageForm
          language={newLanguage}
          onChange={(field, value) =>
            setNewLanguage({ ...newLanguage, [field]: value })
          }
          onSave={handleAdd}
          onCancel={() => {
            setIsAdding(false);
            setNewLanguage(createNewLanguage());
          }}
        />
      )}

      <div className='space-y-3'>
        {languages.map((lang: LanguageItem) => (
          <div
            key={lang.id}
            className='border border-gray-200 rounded-lg p-4 bg-white'
          >
            {editingId === lang.id ? (
              <LanguageForm
                language={lang}
                onChange={(field, value) =>
                  handleEdit(lang.id, { [field]: value })
                }
                onSave={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center justify-between mb-2'>
                    <h4 className='font-semibold text-gray-900'>
                      {lang.language}
                    </h4>
                    <FluencyIndicator fluency={lang.fluency} />
                  </div>
                </div>
                <div className='flex gap-2 ml-4'>
                  <button
                    onClick={() => setEditingId(lang.id)}
                    className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md'
                  >
                    <Edit className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => handleDelete(lang.id)}
                    className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {languages.length === 0 && !isAdding && (
          <div className='text-center py-8 text-gray-500'>
            <Globe className='w-8 h-8 mx-auto mb-2 text-gray-300' />
            <p>Aucune langue ajoutée</p>
            <p className='text-sm'>Cliquez sur "Ajouter" pour commencer</p>
          </div>
        )}
      </div>

      {/* Aperçu rapide */}
      {languages.length > 0 && (
        <div className='p-4 bg-blue-50 rounded-lg'>
          <h4 className='text-sm font-medium text-blue-900 mb-2'>
            Aperçu des langues
          </h4>
          <div className='flex flex-wrap gap-2'>
            {languages.map((lang: LanguageItem) => (
              <span
                key={lang.id}
                className='inline-flex items-center gap-1 px-3 py-1 bg-white border border-blue-200 rounded-full text-sm'
              >
                {lang.language}
                <div className='flex'>
                  {[1, 2, 3, 4].map((star) => (
                    <Star
                      key={star}
                      className={`w-2.5 h-2.5 ${
                        star <=
                        (fluencyLevels.find((l) => l.value === lang.fluency)
                          ?.stars || 2)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
