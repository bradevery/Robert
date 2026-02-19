'use client';

import { Edit, Plus, Star, Trash2, Zap } from 'lucide-react';
import React, { useState } from 'react';

import { useResumeStore } from '@/stores/resume-simple';

type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | '';

interface SkillItem {
  id: string;
  name: string;
  level: SkillLevel;
}

const skillLevels = [
  { value: 'beginner', label: 'Débutant', stars: 1 },
  { value: 'intermediate', label: 'Intermédiaire', stars: 2 },
  { value: 'advanced', label: 'Avancé', stars: 3 },
  { value: 'expert', label: 'Expert', stars: 4 },
];

export const SkillsEditor: React.FC = () => {
  const { resume, setValue } = useResumeStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const createNewSkill = (): SkillItem => ({
    id: `skill_${Date.now()}`,
    name: '',
    level: '',
  });

  const [newSkill, setNewSkill] = useState<SkillItem>(createNewSkill());

  if (!resume) return null;

  const skills = resume.data.sections.skills?.items || [];

  const updateSkills = (newSkills: SkillItem[]) => {
    setValue('data.sections.skills.items', newSkills);
  };

  const handleAdd = () => {
    if (newSkill.name.trim()) {
      const updatedSkills = [...skills, newSkill];
      updateSkills(updatedSkills);
      setNewSkill(createNewSkill());
      setIsAdding(false);
    }
  };

  const handleEdit = (id: string, updatedSkill: Partial<SkillItem>) => {
    const updatedSkills = skills.map((skill: SkillItem) =>
      skill.id === id ? { ...skill, ...updatedSkill } : skill
    );
    updateSkills(updatedSkills);
  };

  const handleDelete = (id: string) => {
    const updatedSkills = skills.filter((skill: SkillItem) => skill.id !== id);
    updateSkills(updatedSkills);
  };

  const SkillLevelIndicator = ({ level }: { level: SkillLevel }) => {
    const skillLevel = skillLevels.find((l) => l.value === level);
    const stars = skillLevel?.stars ?? 0;
    const hasSelection = Boolean(skillLevel);

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
          {hasSelection ? skillLevel?.label : 'Sélectionnez un niveau'}
        </span>
      </div>
    );
  };

  const SkillForm = ({
    skill,
    onChange,
    onSave,
    onCancel,
  }: {
    skill: SkillItem;
    onChange: (field: string, value: string) => void;
    onSave: () => void;
    onCancel: () => void;
  }) => (
    <div className='p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Compétence *
          </label>
          <input
            type='text'
            value={skill.name}
            onChange={(e) => onChange('name', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='React, Python, Design...'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Niveau
          </label>
          <select
            value={skill.level}
            onChange={(e) => onChange('level', e.target.value as SkillLevel)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value=''>Sélectionnez un niveau...</option>
            {skillLevels.map((level) => (
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
          <Zap className='w-5 h-5 text-blue-600' />
          <h3 className='text-lg font-semibold text-gray-900'>Compétences</h3>
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
        <SkillForm
          skill={newSkill}
          onChange={(field, value) =>
            setNewSkill({ ...newSkill, [field]: value })
          }
          onSave={handleAdd}
          onCancel={() => {
            setIsAdding(false);
            setNewSkill(createNewSkill());
          }}
        />
      )}

      {/* Liste des compétences */}
      <div className='space-y-3'>
        {skills.map((skill: SkillItem) => (
          <div
            key={skill.id}
            className='border border-gray-200 rounded-lg p-4 bg-white'
          >
            {editingId === skill.id ? (
              <SkillForm
                skill={skill}
                onChange={(field, value) =>
                  handleEdit(skill.id, { [field]: value })
                }
                onSave={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center justify-between mb-2'>
                    <h4 className='font-semibold text-gray-900'>
                      {skill.name}
                    </h4>
                    <SkillLevelIndicator level={skill.level} />
                  </div>
                </div>
                <div className='flex gap-2 ml-4'>
                  <button
                    onClick={() => setEditingId(skill.id)}
                    className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md'
                  >
                    <Edit className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => handleDelete(skill.id)}
                    className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {skills.length === 0 && !isAdding && (
          <div className='text-center py-8 text-gray-500'>
            <Zap className='w-8 h-8 mx-auto mb-2 text-gray-300' />
            <p>Aucune compétence ajoutée</p>
            <p className='text-sm'>Cliquez sur "Ajouter" pour commencer</p>
          </div>
        )}
      </div>

      {/* Aperçu rapide */}
      {skills.length > 0 && (
        <div className='p-4 bg-blue-50 rounded-lg'>
          <h4 className='text-sm font-medium text-blue-900 mb-2'>
            Aperçu des compétences
          </h4>
          <div className='flex flex-wrap gap-2'>
            {skills.map((skill: SkillItem) => (
              <span
                key={skill.id}
                className='inline-flex items-center gap-1 px-3 py-1 bg-white border border-blue-200 rounded-full text-sm'
              >
                {skill.name}
                <div className='flex'>
                  {[1, 2, 3, 4].map((star) => (
                    <Star
                      key={star}
                      className={`w-2.5 h-2.5 ${
                        star <=
                        (skillLevels.find((l) => l.value === skill.level)
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
