'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Calendar,
  Edit,
  ExternalLink,
  Plus,
  Rocket,
  Tag,
  Trash2,
} from 'lucide-react';
import React, { useState } from 'react';

import { useResumeStore } from '@/stores/resume-simple';

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  keywords?: string[];
}

export const ProjectsEditor: React.FC = () => {
  const { resume, setValue } = useResumeStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const createNewProject = (): ProjectItem => ({
    id: `project_${Date.now()}`,
    name: '',
    description: '',
    url: '',
    startDate: '',
    endDate: '',
    keywords: [],
  });

  const [newProject, setNewProject] = useState<ProjectItem>(createNewProject());

  if (!resume) return null;

  const projects = resume.data.sections.projects?.items || [];

  const updateProjects = (newProjects: ProjectItem[]) => {
    setValue('data.sections.projects.items', newProjects);
  };

  const handleAdd = () => {
    if (newProject.name && newProject.description) {
      const updatedProjects = [...projects, newProject];
      updateProjects(updatedProjects);
      setNewProject(createNewProject());
      setIsAdding(false);
    }
  };

  const handleEdit = (id: string, updatedProject: Partial<ProjectItem>) => {
    const updatedProjects = projects.map((project: ProjectItem) =>
      project.id === id ? { ...project, ...updatedProject } : project
    );
    updateProjects(updatedProjects);
  };

  const handleDelete = (id: string) => {
    const updatedProjects = projects.filter(
      (project: ProjectItem) => project.id !== id
    );
    updateProjects(updatedProjects);
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

  const ProjectForm = ({
    project,
    onChange,
    onSave,
    onCancel,
  }: {
    project: ProjectItem;
    onChange: (field: string, value: any) => void;
    onSave: () => void;
    onCancel: () => void;
  }) => (
    <div className='p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3'>
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Nom du projet *
        </label>
        <input
          type='text'
          value={project.name}
          onChange={(e) => onChange('name', e.target.value)}
          className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          placeholder='Mon Super Projet'
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Description *
        </label>
        <textarea
          value={project.description}
          onChange={(e) => onChange('description', e.target.value)}
          rows={3}
          className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
          placeholder='Décrivez votre projet, les technologies utilisées et les résultats obtenus...'
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          URL du projet
        </label>
        <input
          type='url'
          value={project.url || ''}
          onChange={(e) => onChange('url', e.target.value)}
          className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          placeholder='https://github.com/user/projet'
        />
      </div>

      <div className='grid grid-cols-2 gap-3'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Date de début
          </label>
          <input
            type='month'
            value={project.startDate || ''}
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
            value={project.endDate || ''}
            onChange={(e) => onChange('endDate', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='En cours'
          />
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Technologies / Mots-clés
        </label>
        <input
          type='text'
          value={project.keywords?.join(', ') || ''}
          onChange={(e) => handleKeywordsChange(e.target.value, onChange)}
          className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          placeholder='React, Node.js, MongoDB, API REST'
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
          <Rocket className='w-5 h-5 text-blue-600' />
          <h3 className='text-lg font-semibold text-gray-900'>Projets</h3>
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
        <ProjectForm
          project={newProject}
          onChange={(field, value) =>
            setNewProject({ ...newProject, [field]: value })
          }
          onSave={handleAdd}
          onCancel={() => {
            setIsAdding(false);
            setNewProject(createNewProject());
          }}
        />
      )}

      {/* Liste des projets */}
      <div className='space-y-4'>
        {projects.map((project: ProjectItem) => (
          <div
            key={project.id}
            className='border border-gray-200 rounded-lg p-4 bg-white'
          >
            {editingId === project.id ? (
              <ProjectForm
                project={project}
                onChange={(field, value) =>
                  handleEdit(project.id, { [field]: value })
                }
                onSave={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      <h4 className='font-semibold text-gray-900'>
                        {project.name}
                      </h4>
                      {project.url && (
                        <a
                          href={project.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-600 hover:text-blue-700'
                        >
                          <ExternalLink className='w-4 h-4' />
                        </a>
                      )}
                    </div>

                    {(project.startDate || project.endDate) && (
                      <div className='flex items-center gap-1 text-sm text-gray-500 mb-2'>
                        <Calendar className='w-3 h-3' />
                        {project.startDate} - {project.endDate || 'En cours'}
                      </div>
                    )}

                    <p className='text-gray-700 text-sm leading-relaxed mb-3'>
                      {project.description}
                    </p>

                    {project.keywords && project.keywords.length > 0 && (
                      <div className='flex items-center gap-1 flex-wrap'>
                        <Tag className='w-3 h-3 text-gray-400' />
                        {project.keywords.map((keyword, idx) => (
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
                      onClick={() => setEditingId(project.id)}
                      className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md'
                    >
                      <Edit className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
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

        {projects.length === 0 && !isAdding && (
          <div className='text-center py-8 text-gray-500'>
            <Rocket className='w-8 h-8 mx-auto mb-2 text-gray-300' />
            <p>Aucun projet ajouté</p>
            <p className='text-sm'>Cliquez sur "Ajouter" pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
};
