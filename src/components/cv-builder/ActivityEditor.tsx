'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Calendar,
  Edit,
  List,
  MapPin,
  Plus,
  Rocket,
  Trash2,
} from 'lucide-react';
import React, { useState } from 'react';

import { CVItem, useCVStore } from '@/stores/cv-store-unified';

interface ActivityItem extends CVItem {
  name: string; // "title" in UI, but "name" in store usually, let's align
  description: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  bullets?: string[];
}

export const ActivityEditor: React.FC = () => {
  const { cv, addItem, updateItem, removeItem } = useCVStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const createNewActivity = (): ActivityItem => ({
    id: `activity_${Date.now()}`,
    name: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    bullets: [],
    visible: true,
  });

  const [newActivity, setNewActivity] = useState<ActivityItem>(
    createNewActivity()
  );

  if (!cv) return null;

  // Map 'projects' section from store
  const activities = (cv.data.sections.projects?.items || []) as ActivityItem[];

  const handleAdd = () => {
    if (newActivity.name) {
      addItem('projects', newActivity);
      setNewActivity(createNewActivity());
      setIsAdding(false);
    }
  };

  const handleEdit = (id: string, updatedActivity: Partial<ActivityItem>) => {
    updateItem('projects', id, updatedActivity);
  };

  const handleDelete = (id: string) => {
    removeItem('projects', id);
  };

  const ActivityForm = ({
    activity,
    onChange,
    onSave,
    onCancel,
  }: {
    activity: ActivityItem;
    onChange: (field: string, value: any) => void;
    onSave: () => void;
    onCancel: () => void;
  }) => {
    const [bulletInput, setBulletInput] = useState('');

    const addBullet = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && bulletInput.trim()) {
        e.preventDefault();
        const newBullets = [...(activity.bullets || []), bulletInput.trim()];
        onChange('bullets', newBullets);
        setBulletInput('');
      }
    };

    const removeBullet = (index: number) => {
      const newBullets = (activity.bullets || []).filter((_, i) => i !== index);
      onChange('bullets', newBullets);
    };

    return (
      <div className='p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Nom du projet *
          </label>
          <input
            type='text'
            value={activity.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Nom du projet'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Description
          </label>
          <textarea
            value={activity.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            rows={3}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
            placeholder='Résumé du projet...'
          />
        </div>

        <div className='grid grid-cols-2 gap-3'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              <Calendar className='w-3 h-3 inline mr-1' />
              Début
            </label>
            <input
              type='text'
              value={activity.startDate || ''}
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
              value={activity.endDate || ''}
              onChange={(e) => onChange('endDate', e.target.value)}
              className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='MM/AAAA ou Présent'
            />
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            <MapPin className='w-3 h-3 inline mr-1' />
            Lieu
          </label>
          <input
            type='text'
            value={activity.location || ''}
            onChange={(e) => onChange('location', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Ville, Pays'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            <List className='w-3 h-3 inline mr-1' />
            Réalisations (Bullets)
          </label>
          <ul className='list-disc list-inside mb-2 text-sm text-gray-600 space-y-1'>
            {activity.bullets?.map((bullet, idx) => (
              <li key={idx} className='flex items-start justify-between group'>
                <span>{bullet}</span>
                <button
                  onClick={() => removeBullet(idx)}
                  className='text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity'
                >
                  <Trash2 className='w-3 h-3' />
                </button>
              </li>
            ))}
          </ul>
          <input
            type='text'
            value={bulletInput}
            onChange={(e) => setBulletInput(e.target.value)}
            onKeyDown={addBullet}
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
          <Rocket className='w-5 h-5 text-blue-600' />
          <h3 className='text-lg font-semibold text-gray-900'>
            Projets / Activités
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

      {isAdding && (
        <ActivityForm
          activity={newActivity}
          onChange={(field, value) =>
            setNewActivity({ ...newActivity, [field]: value })
          }
          onSave={handleAdd}
          onCancel={() => {
            setIsAdding(false);
            setNewActivity(createNewActivity());
          }}
        />
      )}

      <div className='space-y-4'>
        {activities.map((activity: ActivityItem) => (
          <div
            key={activity.id}
            className='border border-gray-200 rounded-lg p-4 bg-white'
          >
            {editingId === activity.id ? (
              <ActivityForm
                activity={activity}
                onChange={(field, value) =>
                  handleEdit(activity.id, { [field]: value })
                }
                onSave={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <h4 className='font-semibold text-gray-900'>
                      {activity.name}
                    </h4>

                    <div className='flex flex-wrap gap-2 text-sm text-gray-500 mb-2'>
                      {(activity.startDate || activity.endDate) && (
                        <div className='flex items-center gap-1'>
                          <Calendar className='w-3 h-3' />
                          {activity.startDate} - {activity.endDate || 'Présent'}
                        </div>
                      )}
                      {activity.location && (
                        <div className='flex items-center gap-1'>
                          <MapPin className='w-3 h-3' />
                          {activity.location}
                        </div>
                      )}
                    </div>

                    <p className='text-gray-700 text-sm mb-2'>
                      {activity.description}
                    </p>

                    {activity.bullets && activity.bullets.length > 0 && (
                      <ul className='list-disc list-inside text-sm text-gray-600 pl-2'>
                        {activity.bullets.map((bullet: string, idx: number) => (
                          <li key={idx}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className='flex gap-2 ml-4'>
                    <button
                      onClick={() => setEditingId(activity.id)}
                      className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md'
                    >
                      <Edit className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => handleDelete(activity.id)}
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

        {activities.length === 0 && !isAdding && (
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
