'use client';

import {
  Briefcase,
  Building,
  Calendar,
  Edit,
  Plus,
  Trash2,
} from 'lucide-react';
import React, { useState } from 'react';

import { useResumeStore } from '@/stores/resume-simple';

interface ExperienceItem {
  id: string;
  position: string;
  company: string;
  startDate: string;
  endDate: string;
  location: string;
  summary: string;
}

export const ExperienceEditor: React.FC = () => {
  const { resume, setValue } = useResumeStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const createNewExperience = (): ExperienceItem => ({
    id: `exp_${Date.now()}`,
    position: '',
    company: '',
    startDate: '',
    endDate: '',
    location: '',
    summary: '',
  });

  const [newExperience, setNewExperience] = useState<ExperienceItem>(
    createNewExperience()
  );

  if (!resume) return null;

  const experiences = resume.data.sections.experience?.items || [];

  const updateExperiences = (newExperiences: ExperienceItem[]) => {
    setValue('data.sections.experience.items', newExperiences);
  };

  const handleAdd = () => {
    if (newExperience.position && newExperience.company) {
      const updatedExperiences = [...experiences, newExperience];
      updateExperiences(updatedExperiences);
      setNewExperience(createNewExperience());
      setIsAdding(false);
    }
  };

  const handleEdit = (id: string, updatedExp: Partial<ExperienceItem>) => {
    const updatedExperiences = experiences.map((exp: ExperienceItem) =>
      exp.id === id ? { ...exp, ...updatedExp } : exp
    );
    updateExperiences(updatedExperiences);
  };

  const handleDelete = (id: string) => {
    const updatedExperiences = experiences.filter(
      (exp: ExperienceItem) => exp.id !== id
    );
    updateExperiences(updatedExperiences);
  };

  const ExperienceForm = ({
    experience,
    onChange,
    onSave,
    onCancel,
  }: {
    experience: ExperienceItem;
    onChange: (field: string, value: string) => void;
    onSave: () => void;
    onCancel: () => void;
  }) => (
    <div className='p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Poste *
          </label>
          <input
            type='text'
            value={experience.position}
            onChange={(e) => onChange('position', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder=''
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Entreprise *
          </label>
          <input
            type='text'
            value={experience.company}
            onChange={(e) => onChange('company', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder=''
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Date de début
          </label>
          <input
            type='month'
            value={experience.startDate}
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
            value={experience.endDate}
            onChange={(e) => onChange('endDate', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder=''
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Lieu
          </label>
          <input
            type='text'
            value={experience.location}
            onChange={(e) => onChange('location', e.target.value)}
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
          value={experience.summary}
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
          <Briefcase className='w-5 h-5 text-blue-600' />
          <h3 className='text-lg font-semibold text-gray-900'>
            Expérience professionnelle
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
        <ExperienceForm
          experience={newExperience}
          onChange={(field, value) =>
            setNewExperience({ ...newExperience, [field]: value })
          }
          onSave={handleAdd}
          onCancel={() => {
            setIsAdding(false);
            setNewExperience(createNewExperience());
          }}
        />
      )}

      {/* Liste des expériences */}
      <div className='space-y-4'>
        {experiences.map((exp: ExperienceItem) => (
          <div
            key={exp.id}
            className='border border-gray-200 rounded-lg p-4 bg-white'
          >
            {editingId === exp.id ? (
              <ExperienceForm
                experience={exp}
                onChange={(field, value) =>
                  handleEdit(exp.id, { [field]: value })
                }
                onSave={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <h4 className='font-semibold text-gray-900'>
                      {exp.position}
                    </h4>
                    <p className='text-blue-600 font-medium'>{exp.company}</p>
                    <div className='flex items-center gap-4 text-sm text-gray-500 mt-1'>
                      {(exp.startDate || exp.endDate) && (
                        <span className='flex items-center gap-1'>
                          <Calendar className='w-3 h-3' />
                          {exp.startDate} - {exp.endDate || 'Présent'}
                        </span>
                      )}
                      {exp.location && (
                        <span className='flex items-center gap-1'>
                          <Building className='w-3 h-3' />
                          {exp.location}
                        </span>
                      )}
                    </div>
                    {exp.summary && (
                      <p className='text-gray-700 mt-2 text-sm leading-relaxed'>
                        {exp.summary}
                      </p>
                    )}
                  </div>
                  <div className='flex gap-2 ml-4'>
                    <button
                      onClick={() => setEditingId(exp.id)}
                      className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md'
                    >
                      <Edit className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
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

        {experiences.length === 0 && !isAdding && (
          <div className='text-center py-8 text-gray-500'>
            <Briefcase className='w-8 h-8 mx-auto mb-2 text-gray-300' />
            <p>Aucune expérience ajoutée</p>
            <p className='text-sm'>Cliquez sur "Ajouter" pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
};
