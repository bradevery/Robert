'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Calendar,
  Edit,
  ExternalLink,
  MapPin,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';

import { useResumeStore } from '@/stores/resume-simple';

interface VolunteerItem {
  id: string;
  organization: string;
  position: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  url?: string;
  summary?: string;
  highlights?: string[];
}

export const VolunteerEditor: React.FC = () => {
  const { resume, setValue } = useResumeStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const createNewVolunteer = (): VolunteerItem => ({
    id: `volunteer_${Date.now()}`,
    organization: '',
    position: '',
    startDate: '',
    endDate: '',
    location: '',
    url: '',
    summary: '',
    highlights: [],
  });

  const [newVolunteer, setNewVolunteer] = useState<VolunteerItem>(
    createNewVolunteer()
  );

  if (!resume) return null;

  const volunteer = resume.data.sections.volunteer?.items || [];

  const updateVolunteer = (newVolunteer: VolunteerItem[]) => {
    setValue('data.sections.volunteer.items', newVolunteer);
  };

  const handleAdd = () => {
    if (newVolunteer.organization && newVolunteer.position) {
      const updatedVolunteer = [...volunteer, newVolunteer];
      updateVolunteer(updatedVolunteer);
      setNewVolunteer(createNewVolunteer());
      setIsAdding(false);
    }
  };

  const handleEdit = (id: string, updatedVolunteer: Partial<VolunteerItem>) => {
    const updatedVolunteers = volunteer.map((vol: VolunteerItem) =>
      vol.id === id ? { ...vol, ...updatedVolunteer } : vol
    );
    updateVolunteer(updatedVolunteers);
  };

  const handleDelete = (id: string) => {
    const updatedVolunteers = volunteer.filter(
      (vol: VolunteerItem) => vol.id !== id
    );
    updateVolunteer(updatedVolunteers);
  };

  const handleHighlightsChange = (
    highlights: string,
    onChange: (field: string, value: any) => void
  ) => {
    const highlightArray = highlights
      .split('\n')
      .map((h) => h.trim())
      .filter((h) => h);
    onChange('highlights', highlightArray);
  };

  const VolunteerForm = ({
    volunteer,
    onChange,
    onSave,
    onCancel,
  }: {
    volunteer: VolunteerItem;
    onChange: (field: string, value: any) => void;
    onSave: () => void;
    onCancel: () => void;
  }) => (
    <div className='p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Organisation *
          </label>
          <input
            type='text'
            value={volunteer.organization}
            onChange={(e) => onChange('organization', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Croix-Rouge, Restos du Cœur...'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Poste *
          </label>
          <input
            type='text'
            value={volunteer.position}
            onChange={(e) => onChange('position', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Bénévole, Coordinateur...'
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
            value={volunteer.startDate || ''}
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
            value={volunteer.endDate || ''}
            onChange={(e) => onChange('endDate', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='En cours'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Lieu
          </label>
          <input
            type='text'
            value={volunteer.location || ''}
            onChange={(e) => onChange('location', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Paris, France'
          />
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Site web
        </label>
        <input
          type='url'
          value={volunteer.url || ''}
          onChange={(e) => onChange('url', e.target.value)}
          className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          placeholder='https://organization.com'
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Description
        </label>
        <textarea
          value={volunteer.summary || ''}
          onChange={(e) => onChange('summary', e.target.value)}
          rows={3}
          className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
          placeholder='Description de votre rôle et de vos responsabilités...'
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Points clés (un par ligne)
        </label>
        <textarea
          value={volunteer.highlights?.join('\n') || ''}
          onChange={(e) => handleHighlightsChange(e.target.value, onChange)}
          rows={3}
          className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
          placeholder="Organisation d'événements caritatifs&#10;Collecte de fonds pour 1000€&#10;Coordination d'une équipe de 5 bénévoles"
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
          <Users className='w-5 h-5 text-blue-600' />
          <h3 className='text-lg font-semibold text-gray-900'>Bénévolat</h3>
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
        <VolunteerForm
          volunteer={newVolunteer}
          onChange={(field, value) =>
            setNewVolunteer({ ...newVolunteer, [field]: value })
          }
          onSave={handleAdd}
          onCancel={() => {
            setIsAdding(false);
            setNewVolunteer(createNewVolunteer());
          }}
        />
      )}

      {/* Liste du bénévolat */}
      <div className='space-y-4'>
        {volunteer.map((vol: VolunteerItem) => (
          <div
            key={vol.id}
            className='border border-gray-200 rounded-lg p-4 bg-white'
          >
            {editingId === vol.id ? (
              <VolunteerForm
                volunteer={vol}
                onChange={(field, value) =>
                  handleEdit(vol.id, { [field]: value })
                }
                onSave={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-2'>
                    <h4 className='font-semibold text-gray-900'>
                      {vol.position}
                    </h4>
                    {vol.url && (
                      <a
                        href={vol.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-600 hover:text-blue-700'
                      >
                        <ExternalLink className='w-4 h-4' />
                      </a>
                    )}
                  </div>

                  <p className='text-blue-600 font-medium text-sm mb-1'>
                    {vol.organization}
                  </p>

                  <div className='flex items-center gap-4 text-sm text-gray-500 mb-2'>
                    {(vol.startDate || vol.endDate) && (
                      <div className='flex items-center gap-1'>
                        <Calendar className='w-3 h-3' />
                        {vol.startDate} - {vol.endDate || 'En cours'}
                      </div>
                    )}
                    {vol.location && (
                      <div className='flex items-center gap-1'>
                        <MapPin className='w-3 h-3' />
                        {vol.location}
                      </div>
                    )}
                  </div>

                  {vol.summary && (
                    <p className='text-gray-700 text-sm leading-relaxed mb-3'>
                      {vol.summary}
                    </p>
                  )}

                  {vol.highlights && vol.highlights.length > 0 && (
                    <ul className='list-disc list-inside text-sm text-gray-600 space-y-1'>
                      {vol.highlights.map((highlight, idx) => (
                        <li key={idx}>{highlight}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className='flex gap-2 ml-4'>
                  <button
                    onClick={() => setEditingId(vol.id)}
                    className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md'
                  >
                    <Edit className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => handleDelete(vol.id)}
                    className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {volunteer.length === 0 && !isAdding && (
          <div className='text-center py-8 text-gray-500'>
            <Users className='w-8 h-8 mx-auto mb-2 text-gray-300' />
            <p>Aucune expérience bénévole ajoutée</p>
            <p className='text-sm'>Cliquez sur "Ajouter" pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
};
