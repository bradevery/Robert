'use client';

import {
  Award,
  Calendar,
  Edit,
  GraduationCap,
  MapPin,
  Plus,
  Trash2,
} from 'lucide-react';
import React, { useState } from 'react';

import { CVItem, useCVStore } from '@/stores/cv-store-unified';

interface EducationItem extends CVItem {
  degree: string;
  field?: string;
  institution: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  summary?: string;
}

export const EducationEditorUnified: React.FC = () => {
  const { cv, addItem, updateItem, removeItem } = useCVStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const createNewEducation = (): EducationItem => ({
    id: `edu_${Date.now()}`,
    degree: '',
    field: '',
    institution: '',
    location: '',
    startDate: '',
    endDate: '',
    grade: '',
    summary: '',
    visible: true,
  });

  const [newEducation, setNewEducation] = useState<EducationItem>(
    createNewEducation()
  );

  if (!cv) return null;

  const education = (cv.data.sections.education?.items ||
    []) as EducationItem[];

  const handleAdd = () => {
    if (newEducation.degree && newEducation.institution) {
      addItem('education', newEducation);
      setNewEducation(createNewEducation());
      setIsAdding(false);
    }
  };

  const handleEdit = (id: string, updatedEdu: Partial<EducationItem>) => {
    updateItem('education', id, updatedEdu);
  };

  const handleDelete = (id: string) => {
    removeItem('education', id);
  };

  const EducationForm = ({
    education,
    onChange,
    onSave,
    onCancel,
  }: {
    education: EducationItem;
    onChange: (field: string, value: string) => void;
    onSave: () => void;
    onCancel: () => void;
  }) => (
    <div className='p-4 border border-purple-200 rounded-lg bg-purple-50/50 space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Diplôme / Titre *
          </label>
          <select
            value={education.degree}
            onChange={(e) => onChange('degree', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
          >
            <option value=''>Sélectionner...</option>
            <option value='Doctorat / PhD'>Doctorat / PhD</option>
            <option value='Master / Ingénieur (Bac+5)'>
              Master / Ingénieur (Bac+5)
            </option>
            <option value='Licence / Bachelor (Bac+3)'>
              Licence / Bachelor (Bac+3)
            </option>
            <option value='DUT / BTS (Bac+2)'>DUT / BTS (Bac+2)</option>
            <option value='Baccalauréat'>Baccalauréat</option>
            <option value='Formation professionnelle'>
              Formation professionnelle
            </option>
            <option value='Bootcamp'>Bootcamp</option>
            <option value='Autre'>Autre</option>
          </select>
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Spécialité / Domaine
          </label>
          <input
            type='text'
            value={education.field || ''}
            onChange={(e) => onChange('field', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
            placeholder='Ex: Informatique, Génie Logiciel...'
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Établissement *
          </label>
          <input
            type='text'
            value={education.institution}
            onChange={(e) => onChange('institution', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
            placeholder='Ex: École Polytechnique, Université Paris-Saclay...'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            <MapPin className='w-3 h-3 inline mr-1' />
            Lieu
          </label>
          <input
            type='text'
            value={education.location || ''}
            onChange={(e) => onChange('location', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
            placeholder='Ex: Paris, France'
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            <Calendar className='w-3 h-3 inline mr-1' />
            Date de début
          </label>
          <input
            type='text'
            value={education.startDate || ''}
            onChange={(e) => onChange('startDate', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
            placeholder='MM/AAAA'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            <Calendar className='w-3 h-3 inline mr-1' />
            Date de fin
          </label>
          <input
            type='text'
            value={education.endDate || ''}
            onChange={(e) => onChange('endDate', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
            placeholder='MM/AAAA'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            <Award className='w-3 h-3 inline mr-1' />
            Mention / Note
          </label>
          <input
            type='text'
            value={education.grade || ''}
            onChange={(e) => onChange('grade', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
            placeholder='Ex: Très Bien, Major de promo...'
          />
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Description (optionnel)
        </label>
        <textarea
          value={education.summary || ''}
          onChange={(e) => onChange('summary', e.target.value)}
          rows={2}
          className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none'
          placeholder='Projets réalisés, mémoire, activités extrascolaires...'
        />
      </div>

      <div className='flex gap-2 pt-2'>
        <button
          onClick={onSave}
          className='px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500'
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
          <GraduationCap className='w-5 h-5 text-purple-600' />
          <h3 className='text-lg font-semibold text-gray-900'>Formation</h3>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className='flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500'
        >
          <Plus className='w-4 h-4' />
          Ajouter Formation
        </button>
      </div>

      {isAdding && (
        <EducationForm
          education={newEducation}
          onChange={(field, value) =>
            setNewEducation({ ...newEducation, [field]: value })
          }
          onSave={handleAdd}
          onCancel={() => {
            setIsAdding(false);
            setNewEducation(createNewEducation());
          }}
        />
      )}

      <div className='space-y-4'>
        {education.map((edu: EducationItem) => (
          <div
            key={edu.id}
            className='border border-gray-200 rounded-lg p-4 bg-white hover:border-purple-300 transition-colors'
          >
            {editingId === edu.id ? (
              <EducationForm
                education={edu}
                onChange={(field, value) =>
                  handleEdit(edu.id, { [field]: value })
                }
                onSave={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <h4 className='font-bold text-gray-900 text-lg'>
                    {edu.degree}
                    {edu.field && (
                      <span className='font-normal text-gray-600'>
                        {' '}
                        - {edu.field}
                      </span>
                    )}
                  </h4>
                  <p className='text-purple-600 font-medium mb-2'>
                    {edu.institution}
                  </p>

                  <div className='flex flex-wrap gap-4 text-sm text-gray-500 mb-2'>
                    {(edu.startDate || edu.endDate) && (
                      <div className='flex items-center gap-1'>
                        <Calendar className='w-3 h-3' />
                        {edu.startDate || '?'} - {edu.endDate || 'En cours'}
                      </div>
                    )}
                    {edu.location && (
                      <div className='flex items-center gap-1'>
                        <MapPin className='w-3 h-3' />
                        {edu.location}
                      </div>
                    )}
                    {edu.grade && (
                      <div className='flex items-center gap-1 text-purple-600'>
                        <Award className='w-3 h-3' />
                        {edu.grade}
                      </div>
                    )}
                  </div>

                  {edu.summary && (
                    <p className='text-gray-700 text-sm leading-relaxed'>
                      {edu.summary}
                    </p>
                  )}
                </div>
                <div className='flex gap-2 ml-4'>
                  <button
                    onClick={() => setEditingId(edu.id)}
                    className='p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md'
                  >
                    <Edit className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => handleDelete(edu.id)}
                    className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {education.length === 0 && !isAdding && (
          <div className='text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg'>
            <GraduationCap className='w-8 h-8 mx-auto mb-2 text-gray-300' />
            <p className='font-medium'>Aucune formation ajoutée</p>
            <p className='text-sm text-gray-400'>
              Diplômes, certifications académiques...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
