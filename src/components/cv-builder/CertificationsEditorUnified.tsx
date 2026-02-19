'use client';

import {
  Award,
  Calendar,
  Edit,
  ExternalLink,
  Plus,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import React, { useState } from 'react';

import { CVItem, useCVStore } from '@/stores/cv-store-unified';

interface CertificationItem extends CVItem {
  name: string;
  issuer: string;
  date?: string;
  expirationDate?: string;
  url?: string;
  credentialId?: string;
  summary?: string;
}

export const CertificationsEditorUnified: React.FC = () => {
  const { cv, addItem, updateItem, removeItem } = useCVStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const createNewCertification = (): CertificationItem => ({
    id: `cert_${Date.now()}`,
    name: '',
    issuer: '',
    date: '',
    expirationDate: '',
    url: '',
    credentialId: '',
    summary: '',
    visible: true,
  });

  const [newCertification, setNewCertification] = useState<CertificationItem>(
    createNewCertification()
  );

  if (!cv) return null;

  const certifications = (cv.data.sections.certifications?.items ||
    []) as CertificationItem[];

  const handleAdd = () => {
    if (newCertification.name && newCertification.issuer) {
      addItem('certifications', newCertification);
      setNewCertification(createNewCertification());
      setIsAdding(false);
    }
  };

  const handleEdit = (
    id: string,
    updatedCertification: Partial<CertificationItem>
  ) => {
    updateItem('certifications', id, updatedCertification);
  };

  const handleDelete = (id: string) => {
    removeItem('certifications', id);
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
    <div className='p-4 border border-green-200 rounded-lg bg-green-50/50 space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Nom de la certification *
          </label>
          <input
            type='text'
            value={certification.name}
            onChange={(e) => onChange('name', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
            placeholder='Ex: AWS Solutions Architect, PMP, Scrum Master...'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Organisme certificateur *
          </label>
          <input
            type='text'
            value={certification.issuer}
            onChange={(e) => onChange('issuer', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
            placeholder='Ex: Amazon Web Services, PMI, Scrum.org...'
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            <Calendar className='w-3 h-3 inline mr-1' />
            Date d'obtention
          </label>
          <input
            type='text'
            value={certification.date || ''}
            onChange={(e) => onChange('date', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
            placeholder='MM/AAAA'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Date d'expiration
          </label>
          <input
            type='text'
            value={certification.expirationDate || ''}
            onChange={(e) => onChange('expirationDate', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
            placeholder='MM/AAAA ou Permanent'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Credential ID
          </label>
          <input
            type='text'
            value={certification.credentialId || ''}
            onChange={(e) => onChange('credentialId', e.target.value)}
            className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm'
            placeholder='Ex: ABC123XYZ'
          />
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          URL de vérification
        </label>
        <input
          type='url'
          value={certification.url || ''}
          onChange={(e) => onChange('url', e.target.value)}
          className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
          placeholder='https://verify.certification.com/...'
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Description (optionnel)
        </label>
        <textarea
          value={certification.summary || ''}
          onChange={(e) => onChange('summary', e.target.value)}
          rows={2}
          className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none'
          placeholder='Compétences acquises, score obtenu...'
        />
      </div>

      <div className='flex gap-2 pt-2'>
        <button
          onClick={onSave}
          className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500'
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
          <Award className='w-5 h-5 text-green-600' />
          <h3 className='text-lg font-semibold text-gray-900'>
            Certifications
          </h3>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className='flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500'
        >
          <Plus className='w-4 h-4' />
          Ajouter Certification
        </button>
      </div>

      <div className='bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800'>
        <ShieldCheck className='w-4 h-4 inline mr-2' />
        <strong>Important pour les ESN:</strong> Les certifications sont un
        critère clé pour les appels d'offres et la crédibilité technique.
      </div>

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

      <div className='space-y-4'>
        {certifications.map((cert: CertificationItem) => (
          <div
            key={cert.id}
            className='border border-gray-200 rounded-lg p-4 bg-white hover:border-green-300 transition-colors'
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
                  <div className='flex items-center gap-2 mb-1'>
                    <h4 className='font-bold text-gray-900 text-lg'>
                      {cert.name}
                    </h4>
                    {cert.url && (
                      <a
                        href={cert.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-green-600 hover:text-green-700'
                        title='Vérifier la certification'
                      >
                        <ExternalLink className='w-4 h-4' />
                      </a>
                    )}
                  </div>

                  <p className='text-green-600 font-medium mb-2'>
                    {cert.issuer}
                  </p>

                  <div className='flex flex-wrap gap-4 text-sm text-gray-500 mb-2'>
                    {cert.date && (
                      <div className='flex items-center gap-1'>
                        <Calendar className='w-3 h-3' />
                        Obtenue: {cert.date}
                      </div>
                    )}
                    {cert.expirationDate && (
                      <div className='flex items-center gap-1 text-orange-600'>
                        Expire: {cert.expirationDate}
                      </div>
                    )}
                    {cert.credentialId && (
                      <div className='font-mono text-xs bg-gray-100 px-2 py-1 rounded'>
                        ID: {cert.credentialId}
                      </div>
                    )}
                  </div>

                  {cert.summary && (
                    <p className='text-gray-700 text-sm leading-relaxed'>
                      {cert.summary}
                    </p>
                  )}
                </div>
                <div className='flex gap-2 ml-4'>
                  <button
                    onClick={() => setEditingId(cert.id)}
                    className='p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md'
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
          <div className='text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg'>
            <Award className='w-8 h-8 mx-auto mb-2 text-gray-300' />
            <p className='font-medium'>Aucune certification ajoutée</p>
            <p className='text-sm text-gray-400'>
              AWS, Azure, GCP, PMP, Scrum, ITIL...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
