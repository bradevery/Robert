'use client';

import {
  Calendar,
  Edit,
  GraduationCap,
  Plus,
  School,
  Trash2,
} from 'lucide-react';
import React, { useState } from 'react';

import { useResumeStore } from '@/stores/resume-simple';

interface EducationItem {
  id: string;
  studyType: string;
  area: string;
  institution: string;
  startDate: string;
  endDate: string;
  score?: string;
  summary?: string;
}

export const EducationEditor: React.FC = () => {
  const { resume, setValue } = useResumeStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const createNewEducation = (): EducationItem => ({
    id: `edu_${Date.now()}`,
    studyType: '',
    area: '',
    institution: '',
    startDate: '',
    endDate: '',
    score: '',
    summary: '',
  });

  const [newEducation, setNewEducation] = useState<EducationItem>(
    createNewEducation()
  );

  if (!resume) return null;

  const education = resume.data.sections.education?.items || [];

  const updateEducation = (newEducation: EducationItem[]) => {
    setValue('data.sections.education.items', newEducation);
  };

  const handleAdd = () => {
    if (newEducation.studyType && newEducation.institution) {
      const updatedEducation = [...education, newEducation];
      updateEducation(updatedEducation);
      setNewEducation(createNewEducation());
      setIsAdding(false);
    }
  };

  const handleEdit = (id: string, updatedEdu: Partial<EducationItem>) => {
    const updatedEducation = education.map((edu: EducationItem) =>
      edu.id === id ? { ...edu, ...updatedEdu } : edu
    );
    updateEducation(updatedEducation);
  };

  const handleDelete = (id: string) => {
    const updatedEducation = education.filter(
      (edu: EducationItem) => edu.id !== id
    );
    updateEducation(updatedEducation);
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
    <div className='p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Diplôme *
          </label>
          <select
            value={education.studyType}
            onChange={(e) => onChange('studyType', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value=''>Sélectionner...</option>
            <option value='Doctorat'>Doctorat</option>
            <option value='Master'>Master</option>
            <option value='Licence'>Licence</option>
            <option value='DUT'>DUT</option>
            <option value='BTS'>BTS</option>
            <option value='Baccalauréat'>Baccalauréat</option>
            <option value='CAP'>CAP</option>
            <option value='Autre'>Autre</option>
          </select>
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Domaine d'étude
          </label>
          <input
            type='text'
            value={education.area}
            onChange={(e) => onChange('area', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder=''
          />
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Établissement *
        </label>
        <input
          type='text'
          value={education.institution}
          onChange={(e) => onChange('institution', e.target.value)}
          className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          placeholder=''
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Date de début
          </label>
          <input
            type='month'
            value={education.startDate}
            onChange={(e) => onChange('startDate', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Date de fin
          </label>
          <input
            type='month'
            value={education.endDate}
            onChange={(e) => onChange('endDate', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Note/Mention
          </label>
          <input
            type='text'
            value={education.score || ''}
            onChange={(e) => onChange('score', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder=''
          />
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Description
        </label>
        <textarea
          value={education.summary || ''}
          onChange={(e) => onChange('summary', e.target.value)}
          rows={3}
          className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
          placeholder=''
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
          <GraduationCap className='w-5 h-5 text-blue-600' />
          <h3 className='text-lg font-semibold text-gray-900'>Formation</h3>
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

      {/* Liste des formations */}
      <div className='space-y-4'>
        {education.map((edu: EducationItem) => (
          <div
            key={edu.id}
            className='border border-gray-200 rounded-lg p-4 bg-white'
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
              <div>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <h4 className='font-semibold text-gray-900'>
                      {edu.studyType}
                      {edu.area && ` en ${edu.area}`}
                    </h4>
                    <p className='text-blue-600 font-medium'>
                      {edu.institution}
                    </p>
                    <div className='flex items-center gap-4 text-sm text-gray-500 mt-1'>
                      {(edu.startDate || edu.endDate) && (
                        <span className='flex items-center gap-1'>
                          <Calendar className='w-3 h-3' />
                          {edu.startDate} - {edu.endDate || 'En cours'}
                        </span>
                      )}
                      {edu.score && (
                        <span className='flex items-center gap-1'>
                          <School className='w-3 h-3' />
                          {edu.score}
                        </span>
                      )}
                    </div>
                    {edu.summary && (
                      <p className='text-gray-700 mt-2 text-sm leading-relaxed'>
                        {edu.summary}
                      </p>
                    )}
                  </div>
                  <div className='flex gap-2 ml-4'>
                    <button
                      onClick={() => setEditingId(edu.id)}
                      className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md'
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
              </div>
            )}
          </div>
        ))}

        {education.length === 0 && !isAdding && (
          <div className='text-center py-8 text-gray-500'>
            <GraduationCap className='w-8 h-8 mx-auto mb-2 text-gray-300' />
            <p>Aucune formation ajoutée</p>
            <p className='text-sm'>Cliquez sur "Ajouter" pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
};
