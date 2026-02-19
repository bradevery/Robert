'use client';

import { Globe, Mail, MapPin, Phone, User } from 'lucide-react';
import React from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { useResumeStore } from '@/stores/resume-simple';

export const BasicsEditor: React.FC = () => {
  const { resume, setValue } = useResumeStore();

  if (!resume) return null;

  const { basics } = resume.data;

  const handleInputChange = (field: string, value: string) => {
    setValue(`data.basics.${field}`, value);
  };

  const handleLocationChange = (field: string, value: string) => {
    setValue(`data.basics.location.${field}`, value);
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-2 mb-4'>
        <User className='w-5 h-5 text-blue-600' />
        <h3 className='text-lg font-semibold text-gray-900'>
          Informations personnelles
        </h3>
      </div>

      <div className='grid grid-cols-1 gap-4'>
        {/* Nom complet */}
        <div>
          <Label className='block text-sm font-medium text-gray-700 mb-1'>
            Nom complet
          </Label>
          <Input
            type='text'
            value={basics.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder='Jean Dupont'
          />
        </div>

        {/* Titre professionnel */}
        <div>
          <Label className='block text-sm font-medium text-gray-700 mb-1'>
            Titre professionnel
          </Label>
          <Input
            type='text'
            value={basics.label || ''}
            onChange={(e) => handleInputChange('label', e.target.value)}
            placeholder='Développeur Full Stack'
          />
        </div>

        {/* Email */}
        <div>
          <Label className='block text-sm font-medium text-gray-700 mb-1'>
            <Mail className='w-4 h-4 inline mr-1' />
            Email
          </Label>
          <Input
            type='email'
            value={basics.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder='jean.dupont@email.com'
          />
        </div>

        {/* Téléphone */}
        <div>
          <Label className='block text-sm font-medium text-gray-700 mb-1'>
            <Phone className='w-4 h-4 inline mr-1' />
            Téléphone
          </Label>
          <Input
            type='tel'
            value={basics.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder='+33 6 12 34 56 78'
          />
        </div>

        {/* LinkedIn / Portfolio */}
        <div>
          <Label className='block text-sm font-medium text-gray-700 mb-1'>
            <Globe className='w-4 h-4 inline mr-1' />
            LinkedIn / Portfolio
          </Label>
          <Input
            type='url'
            value={basics.link || ''}
            onChange={(e) => handleInputChange('link', e.target.value)}
            placeholder='https://linkedin.com/in/votre-profil'
          />
        </div>

        {/* Lien supplémentaire */}
        <div>
          <Label className='block text-sm font-medium text-gray-700 mb-1'>
            <Globe className='w-4 h-4 inline mr-1' />
            Lien supplémentaire
          </Label>
          <Input
            type='url'
            value={basics.extraLink || ''}
            onChange={(e) => handleInputChange('extraLink', e.target.value)}
            placeholder='https://autre-lien.com'
          />
        </div>

        {/* Date de naissance */}
        <div>
          <Label className='block text-sm font-medium text-gray-700 mb-1'>
            Date de naissance
          </Label>
          <Input
            type='text'
            value={basics.dateOfBirth || ''}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            placeholder='JJ/MM/AAAA'
          />
        </div>

        {/* Nationalité */}
        <div>
          <Label className='block text-sm font-medium text-gray-700 mb-1'>
            Nationalité
          </Label>
          <Input
            type='text'
            value={basics.nationality || ''}
            onChange={(e) => handleInputChange('nationality', e.target.value)}
            placeholder='Française'
          />
        </div>

        {/* Champ supplémentaire */}
        <div>
          <Label className='block text-sm font-medium text-gray-700 mb-1'>
            Champ supplémentaire
          </Label>
          <Input
            type='text'
            value={basics.extraField || ''}
            onChange={(e) => handleInputChange('extraField', e.target.value)}
            placeholder='Permis B, Véhiculé...'
          />
        </div>

        {/* Localisation */}
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <Label className='block text-sm font-medium text-gray-700 mb-1'>
              <MapPin className='w-4 h-4 inline mr-1' />
              Ville
            </Label>
            <Input
              type='text'
              value={basics.location?.city || ''}
              onChange={(e) => handleLocationChange('city', e.target.value)}
              placeholder='Paris'
            />
          </div>
          <div>
            <Label className='block text-sm font-medium text-gray-700 mb-1'>
              Pays
            </Label>
            <Input
              type='text'
              value={basics.location?.country || ''}
              onChange={(e) => handleLocationChange('country', e.target.value)}
              placeholder='France'
            />
          </div>
        </div>

        {/* Résumé professionnel */}
        <div>
          <Label className='block text-sm font-medium text-gray-700 mb-1'>
            Résumé professionnel
          </Label>
          <Textarea
            value={basics.summary || ''}
            onChange={(e) => handleInputChange('summary', e.target.value)}
            rows={4}
            className='resize-none'
            placeholder='Décrivez votre profil professionnel en quelques lignes...'
          />
          <p className='text-xs text-gray-500 mt-1'>
            {(basics.summary || '').length} caractères
          </p>
        </div>
      </div>
    </div>
  );
};
