'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Briefcase,
  Building,
  Calendar,
  Code,
  Edit,
  List,
  MapPin,
  Plus,
  Trash2,
} from 'lucide-react';
import React, { useState } from 'react';

import { CVItem, useCVStore } from '@/stores/cv-store-unified';

interface MissionItem extends CVItem {
  client: string; // Nom du client
  role: string; // Rôle tenu
  description: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  environment?: string; // Stack technique
  tasks?: string[]; // Réalisations
}

export const MissionEditor: React.FC = () => {
  const { cv, addItem, updateItem, removeItem } = useCVStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const createNewMission = (): MissionItem => ({
    id: `mission_${Date.now()}`,
    client: '',
    role: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    environment: '',
    tasks: [],
    visible: true,
  });

  const [newMission, setNewMission] = useState<MissionItem>(createNewMission());

  if (!cv) return null;

  // On mappe la section 'experience' vers ce modèle de mission enrichi
  const missions = (cv.data.sections.experience?.items || []) as MissionItem[];

  const handleAdd = () => {
    if (newMission.client && newMission.role) {
      addItem('experience', newMission);
      setNewMission(createNewMission());
      setIsAdding(false);
    }
  };

  const handleEdit = (id: string, updatedMission: Partial<MissionItem>) => {
    updateItem('experience', id, updatedMission);
  };

  const handleDelete = (id: string) => {
    removeItem('experience', id);
  };

  const MissionForm = ({
    mission,
    onChange,
    onSave,
    onCancel,
  }: {
    mission: MissionItem;
    onChange: (field: string, value: any) => void;
    onSave: () => void;
    onCancel: () => void;
  }) => {
    const [taskInput, setTaskInput] = useState('');

    const addTask = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && taskInput.trim()) {
        e.preventDefault();
        const newTasks = [...(mission.tasks || []), taskInput.trim()];
        onChange('tasks', newTasks);
        setTaskInput('');
      }
    };

    const removeTask = (index: number) => {
      const newTasks = (mission.tasks || []).filter((_, i) => i !== index);
      onChange('tasks', newTasks);
    };

    return (
      <div className='p-4 border border-blue-200 rounded-lg bg-blue-50/50 space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Rôle / Intitulé *
            </label>
            <input
              type='text'
              value={mission.role || ''}
              onChange={(e) => onChange('role', e.target.value)}
              className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Ex: Lead Développeur React'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Client / Entreprise *
            </label>
            <input
              type='text'
              value={mission.client || ''}
              onChange={(e) => onChange('client', e.target.value)}
              className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Ex: Banque de France'
            />
          </div>
        </div>

        <div className='grid grid-cols-2 gap-3'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              <Calendar className='w-3 h-3 inline mr-1' />
              Début
            </label>
            <input
              type='text'
              value={mission.startDate || ''}
              onChange={(e) => onChange('startDate', e.target.value)}
              className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='MM/AAAA'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              <Calendar className='w-3 h-3 inline mr-1' />
              Fin
            </label>
            <input
              type='text'
              value={mission.endDate || ''}
              onChange={(e) => onChange('endDate', e.target.value)}
              className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='MM/AAAA ou Présent'
            />
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Contexte & Description
          </label>
          <textarea
            value={mission.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            rows={3}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
            placeholder='Description du contexte projet...'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            <Code className='w-3 h-3 inline mr-1 text-purple-600' />
            Environnement Technique (Crucial)
          </label>
          <input
            type='text'
            value={mission.environment || ''}
            onChange={(e) => onChange('environment', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono text-sm text-purple-700'
            placeholder='Ex: React, Node.js, AWS, Docker, Kubernetes...'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            <List className='w-3 h-3 inline mr-1' />
            Tâches / Réalisations
          </label>
          <ul className='list-disc list-inside mb-2 text-sm text-gray-600 space-y-1 bg-white p-2 rounded border border-gray-100'>
            {mission.tasks?.map((task, idx) => (
              <li key={idx} className='flex items-start justify-between group'>
                <span>{task}</span>
                <button
                  onClick={() => removeTask(idx)}
                  className='text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity'
                >
                  <Trash2 className='w-3 h-3' />
                </button>
              </li>
            ))}
            {(!mission.tasks || mission.tasks.length === 0) && (
              <li className='text-gray-400 italic text-xs list-none'>
                Aucune tâche ajoutée
              </li>
            )}
          </ul>
          <input
            type='text'
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            onKeyDown={addTask}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Ajouter une réalisation (Entrée)'
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
          <Briefcase className='w-5 h-5 text-blue-600' />
          <h3 className='text-lg font-semibold text-gray-900'>
            Expérience & Missions
          </h3>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className='flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          <Plus className='w-4 h-4' />
          Ajouter Mission
        </button>
      </div>

      {isAdding && (
        <MissionForm
          mission={newMission}
          onChange={(field, value) =>
            setNewMission({ ...newMission, [field]: value })
          }
          onSave={handleAdd}
          onCancel={() => {
            setIsAdding(false);
            setNewMission(createNewMission());
          }}
        />
      )}

      <div className='space-y-4'>
        {missions.map((mission: MissionItem) => (
          <div
            key={mission.id}
            className='border border-gray-200 rounded-lg p-4 bg-white hover:border-blue-300 transition-colors'
          >
            {editingId === mission.id ? (
              <MissionForm
                mission={mission}
                onChange={(field, value) =>
                  handleEdit(mission.id, { [field]: value })
                }
                onSave={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <h4 className='font-bold text-gray-900 text-lg'>
                        {mission.role}
                      </h4>
                      <span className='text-gray-400 mx-1'>•</span>
                      <span className='text-blue-600 font-medium'>
                        {mission.client}
                      </span>
                    </div>

                    <div className='flex flex-wrap gap-4 text-sm text-gray-500 mb-3'>
                      {(mission.startDate || mission.endDate) && (
                        <div className='flex items-center gap-1'>
                          <Calendar className='w-3 h-3' />
                          {mission.startDate} - {mission.endDate || 'Présent'}
                        </div>
                      )}
                      {mission.location && (
                        <div className='flex items-center gap-1'>
                          <MapPin className='w-3 h-3' />
                          {mission.location}
                        </div>
                      )}
                    </div>

                    {mission.environment && (
                      <div className='mb-3 p-2 bg-gray-50 rounded border border-gray-100'>
                        <span className='text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1'>
                          Environnement Technique
                        </span>
                        <p className='text-sm font-mono text-purple-700'>
                          {mission.environment}
                        </p>
                      </div>
                    )}

                    <p className='text-gray-700 text-sm mb-3 leading-relaxed'>
                      {mission.description}
                    </p>

                    {mission.tasks && mission.tasks.length > 0 && (
                      <ul className='list-disc list-inside text-sm text-gray-600 pl-1 space-y-1'>
                        {mission.tasks.map((task: string, idx: number) => (
                          <li key={idx}>{task}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className='flex gap-2 ml-4'>
                    <button
                      onClick={() => setEditingId(mission.id)}
                      className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md'
                    >
                      <Edit className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => handleDelete(mission.id)}
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

        {missions.length === 0 && !isAdding && (
          <div className='text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg'>
            <Building className='w-8 h-8 mx-auto mb-2 text-gray-300' />
            <p className='font-medium'>Aucune mission ajoutée</p>
            <p className='text-sm text-gray-400'>
              Le cœur d'un dossier de compétences, ce sont vos missions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
