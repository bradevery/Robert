'use client';

import {
  Award,
  Calendar,
  Edit,
  ExternalLink,
  Plus,
  Trash2,
} from 'lucide-react';
import React, { useState } from 'react';

import { useResumeStore } from '@/stores/resume-simple';

interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date?: string;
  url?: string;
  summary?: string;
}

export const CertificationsEditor: React.FC = () => {
  const { resume, setValue } = useResumeStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const createNewCertification = (): CertificationItem => ({
    id: `cert_${Date.now()}`,
    name: '',
    issuer: '',
    date: '',
    url: '',
    summary: '',
  });

  const [newCertification, setNewCertification] = useState<CertificationItem>(
    createNewCertification()
  );

  if (!resume) return null;

  const certifications = resume.data.sections.certifications?.items || [];

  const updateCertifications = (newCertifications: CertificationItem[]) => {
    setValue('data.sections.certifications.items', newCertifications);
  };

  const handleAdd = () => {
    if (newCertification.name && newCertification.issuer) {
      const updatedCertifications = [...certifications, newCertification];
      updateCertifications(updatedCertifications);
      setNewCertification(createNewCertification());
      setIsAdding(false);
    }
  };

  const handleEdit = (
    id: string,
    updatedCertification: Partial<CertificationItem>
  ) => {
    const updatedCertifications = certifications.map(
      (cert: CertificationItem) =>
        cert.id === id ? { ...cert, ...updatedCertification } : cert
    );
    updateCertifications(updatedCertifications);
  };

  const handleDelete = (id: string) => {
    const updatedCertifications = certifications.filter(
      (cert: CertificationItem) => cert.id !== id
    );
    updateCertifications(updatedCertifications);
  };

  const CertificationForm = ({
    certification,
    onChange,
    onSave,
    onCancel,
  }: {
    certification: CertificationItem;
    onChange: (field: string, value: string) => void;
    onSave: () => void;
    onCancel: () => void;
  }) => (
    <div className='p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Nom de la certification *
          </label>
          <input
            type='text'
            value={certification.name}
            onChange={(e) => onChange('name', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Certification AWS, Google Cloud...'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Organisme *
          </label>
          <input
            type='text'
            value={certification.issuer}
            onChange={(e) => onChange('issuer', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='AWS, Google, Microsoft...'
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
            value={certification.date || ''}
            onChange={(e) => onChange('date', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            URL de vérification
          </label>
          <input
            type='url'
            value={certification.url || ''}
            onChange={(e) => onChange('url', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='https://verify.certification.com'
          />
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Description
        </label>
        <textarea
          value={certification.summary || ''}
          onChange={(e) => onChange('summary', e.target.value)}
          rows={2}
          className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
          placeholder='Compétences acquises, domaines couverts...'
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
          <Award className='w-5 h-5 text-blue-600' />
          <h3 className='text-lg font-semibold text-gray-900'>
            Certifications
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
        <CertificationForm
          certification={newCertification}
          onChange={(field, value) =>
            setNewCertification({ ...newCertification, [field]: value })
          }
          onSave={handleAdd}
          onCancel={() => {
            setIsAdding(false);
            setNewCertification(createNewCertification());
          }}
        />
      )}

      {/* Liste des certifications */}
      <div className='space-y-4'>
        {certifications.map((cert: CertificationItem) => (
          <div
            key={cert.id}
            className='border border-gray-200 rounded-lg p-4 bg-white'
          >
            {editingId === cert.id ? (
              <CertificationForm
                certification={cert}
                onChange={(field, value) =>
                  handleEdit(cert.id, { [field]: value })
                }
                onSave={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-2'>
                    <h4 className='font-semibold text-gray-900'>{cert.name}</h4>
                    {cert.url && (
                      <a
                        href={cert.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-600 hover:text-blue-700'
                      >
                        <ExternalLink className='w-4 h-4' />
                      </a>
                    )}
                  </div>

                  <p className='text-blue-600 font-medium text-sm mb-1'>
                    {cert.issuer}
                  </p>

                  {cert.date && (
                    <div className='flex items-center gap-1 text-sm text-gray-500 mb-2'>
                      <Calendar className='w-3 h-3' />
                      {cert.date}
                    </div>
                  )}

                  {cert.summary && (
                    <p className='text-gray-700 text-sm leading-relaxed'>
                      {cert.summary}
                    </p>
                  )}
                </div>
                <div className='flex gap-2 ml-4'>
                  <button
                    onClick={() => setEditingId(cert.id)}
                    className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md'
                  >
                    <Edit className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => handleDelete(cert.id)}
                    className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {certifications.length === 0 && !isAdding && (
          <div className='text-center py-8 text-gray-500'>
            <Award className='w-8 h-8 mx-auto mb-2 text-gray-300' />
            <p>Aucune certification ajoutée</p>
            <p className='text-sm'>Cliquez sur "Ajouter" pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
};
