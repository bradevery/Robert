'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Settings, X } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface FieldVisibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionType: string;
  sectionTitle: string;
  onUpdateVisibility: (fieldVisibility: Record<string, boolean>) => void;
  currentVisibility?: Record<string, boolean>;
}

const getFieldsForSection = (sectionType: string) => {
  switch (sectionType) {
    case 'experience':
      return [
        { id: 'title', label: 'Afficher le titre', defaultVisible: true },
        {
          id: 'company',
          label: "Afficher le nom de l'entreprise",
          defaultVisible: true,
        },
        {
          id: 'description',
          label: 'Afficher la description',
          defaultVisible: true,
        },
        { id: 'highlights', label: 'Afficher les puces', defaultVisible: true },
        {
          id: 'location',
          label: "Afficher l'emplacement",
          defaultVisible: true,
        },
        { id: 'period', label: 'Afficher la période', defaultVisible: true },
        { id: 'url', label: 'Afficher le lien', defaultVisible: false },
        {
          id: 'logo',
          label: "Afficher le logo de l'entreprise",
          defaultVisible: false,
        },
      ];

    case 'education':
      return [
        { id: 'degree', label: 'Afficher le diplôme', defaultVisible: true },
        {
          id: 'institution',
          label: "Afficher l'établissement",
          defaultVisible: true,
        },
        {
          id: 'score',
          label: 'Afficher la note/mention',
          defaultVisible: true,
        },
        { id: 'period', label: 'Afficher la période', defaultVisible: true },
        {
          id: 'location',
          label: "Afficher l'emplacement",
          defaultVisible: false,
        },
        { id: 'courses', label: 'Afficher les cours', defaultVisible: false },
      ];

    case 'skills':
      return [
        { id: 'name', label: 'Afficher le nom', defaultVisible: true },
        {
          id: 'keywords',
          label: 'Afficher les mots-clés',
          defaultVisible: false,
        },
      ];

    case 'projects':
      return [
        { id: 'name', label: 'Afficher le nom', defaultVisible: true },
        {
          id: 'description',
          label: 'Afficher la description',
          defaultVisible: true,
        },
        { id: 'highlights', label: 'Afficher les puces', defaultVisible: true },
        { id: 'url', label: 'Afficher le lien', defaultVisible: true },
        {
          id: 'keywords',
          label: 'Afficher les technologies',
          defaultVisible: true,
        },
        { id: 'period', label: 'Afficher la période', defaultVisible: false },
      ];

    case 'certifications':
      return [
        { id: 'name', label: 'Afficher le nom', defaultVisible: true },
        { id: 'issuer', label: "Afficher l'organisme", defaultVisible: true },
        { id: 'date', label: 'Afficher la date', defaultVisible: true },
        { id: 'url', label: 'Afficher le lien', defaultVisible: false },
        {
          id: 'summary',
          label: 'Afficher la description',
          defaultVisible: false,
        },
      ];

    case 'languages':
      return [
        { id: 'language', label: 'Afficher la langue', defaultVisible: true },
        { id: 'fluency', label: 'Afficher le niveau', defaultVisible: true },
      ];

    case 'awards':
      return [
        { id: 'title', label: 'Afficher le titre', defaultVisible: true },
        { id: 'awarder', label: "Afficher l'organisme", defaultVisible: true },
        { id: 'date', label: 'Afficher la date', defaultVisible: true },
        {
          id: 'summary',
          label: 'Afficher la description',
          defaultVisible: false,
        },
      ];

    case 'volunteer':
      return [
        { id: 'position', label: 'Afficher le poste', defaultVisible: true },
        {
          id: 'organization',
          label: "Afficher l'organisation",
          defaultVisible: true,
        },
        {
          id: 'summary',
          label: 'Afficher la description',
          defaultVisible: true,
        },
        { id: 'highlights', label: 'Afficher les puces', defaultVisible: true },
        { id: 'period', label: 'Afficher la période', defaultVisible: true },
        { id: 'url', label: 'Afficher le lien', defaultVisible: false },
      ];

    case 'publications':
      return [
        { id: 'name', label: 'Afficher le titre', defaultVisible: true },
        { id: 'publisher', label: "Afficher l'éditeur", defaultVisible: true },
        { id: 'releaseDate', label: 'Afficher la date', defaultVisible: true },
        { id: 'url', label: 'Afficher le lien', defaultVisible: true },
        {
          id: 'summary',
          label: 'Afficher la description',
          defaultVisible: false,
        },
      ];

    case 'references':
      return [
        { id: 'name', label: 'Afficher le nom', defaultVisible: true },
        {
          id: 'reference',
          label: 'Afficher la recommandation',
          defaultVisible: true,
        },
        { id: 'phone', label: 'Afficher le téléphone', defaultVisible: false },
        { id: 'email', label: "Afficher l'email", defaultVisible: false },
      ];

    case 'interests':
      return [
        { id: 'name', label: 'Afficher le nom', defaultVisible: true },
        {
          id: 'keywords',
          label: 'Afficher les détails',
          defaultVisible: false,
        },
      ];

    default:
      return [
        { id: 'name', label: 'Afficher le nom', defaultVisible: true },
        {
          id: 'description',
          label: 'Afficher la description',
          defaultVisible: true,
        },
      ];
  }
};

export const FieldVisibilityModal: React.FC<FieldVisibilityModalProps> = ({
  isOpen,
  onClose,
  sectionType,
  sectionTitle,
  onUpdateVisibility,
  currentVisibility = {},
}) => {
  const fields = getFieldsForSection(sectionType);

  // Initialize visibility state
  const [fieldVisibility, setFieldVisibility] = useState<
    Record<string, boolean>
  >(() => {
    const initial: Record<string, boolean> = {};
    fields.forEach((field) => {
      initial[field.id] = currentVisibility[field.id] ?? field.defaultVisible;
    });
    return initial;
  });

  const handleToggle = (fieldId: string, value: boolean) => {
    setFieldVisibility((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSave = () => {
    onUpdateVisibility(fieldVisibility);
    onClose();
  };

  const handleReset = () => {
    const reset: Record<string, boolean> = {};
    fields.forEach((field) => {
      reset[field.id] = field.defaultVisible;
    });
    setFieldVisibility(reset);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className='bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden'
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <div className='flex items-center'>
              <Settings className='w-5 h-5 text-gray-600 mr-3' />
              <div>
                <h2 className='text-xl font-semibold text-gray-900'>
                  Options d'affichage
                </h2>
                <p className='text-sm text-gray-600 mt-1'>{sectionTitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <X className='w-5 h-5 text-gray-500' />
            </button>
          </div>

          {/* Content */}
          <div className='p-6 max-h-96 overflow-y-auto'>
            <div className='space-y-4'>
              <p className='text-sm text-gray-600 mb-4'>
                Choisissez quels champs afficher dans cette section de votre CV
              </p>

              {fields.map((field) => (
                <div
                  key={field.id}
                  className='flex items-center justify-between py-2'
                >
                  <div className='flex-1'>
                    <label
                      htmlFor={`field-${field.id}`}
                      className='text-sm font-medium text-gray-700 cursor-pointer'
                    >
                      {field.label}
                    </label>
                  </div>
                  <Switch
                    id={`field-${field.id}`}
                    checked={fieldVisibility[field.id]}
                    onCheckedChange={(checked) =>
                      handleToggle(field.id, checked)
                    }
                  />
                </div>
              ))}
            </div>

            {/* Info */}
            <div className='mt-6 p-4 bg-blue-50 rounded-lg'>
              <div className='flex items-start'>
                <div className='flex-shrink-0'>
                  <div className='w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center'>
                    <span className='text-blue-600 text-xs font-bold'>💡</span>
                  </div>
                </div>
                <div className='ml-3'>
                  <h4 className='text-sm font-medium text-blue-800 mb-1'>
                    Conseil d'optimisation
                  </h4>
                  <p className='text-xs text-blue-700'>
                    Masquez les champs non pertinents pour le poste visé afin de
                    garder votre CV concis et impactant.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='px-6 py-4 border-t border-gray-200 bg-gray-50'>
            <div className='flex items-center justify-between'>
              <button
                onClick={handleReset}
                className='text-sm text-gray-600 hover:text-gray-800 transition-colors'
              >
                Réinitialiser par défaut
              </button>

              <div className='flex space-x-3'>
                <Button variant='outline' onClick={onClose}>
                  Annuler
                </Button>
                <Button
                  onClick={handleSave}
                  className='bg-blue-600 hover:bg-blue-700'
                >
                  Appliquer
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
