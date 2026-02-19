'use client';

import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  Euro,
  FileText,
  Globe,
  Loader2,
  MapPin,
  Wand2,
} from 'lucide-react';
import { memo, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { FileDropzone } from '@/components/ui/file-dropzone';
import { Input } from '@/components/ui/input';

import type { ProposalAction, ProposalFormState } from './types';

const LANGUAGES = ['FR', 'EN', 'ES', 'PT'] as const;

interface ProposalFormProps {
  state: ProposalFormState;
  dispatch: React.Dispatch<ProposalAction>;
  onGenerate: () => void;
}

export const ProposalForm = memo(function ProposalForm({
  state,
  dispatch,
  onGenerate,
}: ProposalFormProps) {
  const {
    cvFile,
    aoFile,
    typeRemuneration,
    tjmOrSab,
    dateDisponibilite,
    startAsap,
    lieuMission,
    repartitionTravail,
    entrepriseNom,
    language,
    isGenerating,
  } = state;

  const canGenerate = (cvFile || aoFile) && !isGenerating;

  const handleAsapToggle = useCallback(() => {
    dispatch({ type: 'TOGGLE_ASAP' });
  }, [dispatch]);

  return (
    <div className='space-y-5'>
      {/* CV Dropzone */}
      <div>
        <label className='flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2'>
          <FileText className='w-4 h-4 text-orange-500' />
          CV du candidat
          <span className='text-red-400'>*</span>
        </label>
        <FileDropzone
          file={cvFile}
          onFileChange={(f) => dispatch({ type: 'SET_CV_FILE', payload: f })}
          accent='orange'
          placeholder='Glissez le CV du candidat ici'
          disabled={isGenerating}
        />
      </div>

      {/* AO Dropzone */}
      <div>
        <label className='flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2'>
          <Briefcase className='w-4 h-4 text-orange-500' />
          Appel d&apos;offres / Mission
          <span className='text-red-400'>*</span>
        </label>
        <FileDropzone
          file={aoFile}
          onFileChange={(f) => dispatch({ type: 'SET_AO_FILE', payload: f })}
          accent='orange'
          placeholder="Glissez l'AO ou la fiche de poste ici"
          disabled={isGenerating}
        />
      </div>

      {/* Type rémunération */}
      <div>
        <label className='flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2'>
          <Euro className='w-4 h-4 text-orange-500' />
          Type de rémunération
        </label>
        <div className='flex gap-2'>
          {(['TJM', 'SAB'] as const).map((type) => (
            <button
              key={type}
              onClick={() =>
                dispatch({ type: 'SET_TYPE_REMUNERATION', payload: type })
              }
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                typeRemuneration === type
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type === 'TJM' ? 'TJM (jour)' : 'Salaire annuel'}
            </button>
          ))}
        </div>
      </div>

      {/* Montant */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Montant ({typeRemuneration === 'TJM' ? '€ HT / jour' : '€ brut / an'})
        </label>
        <div className='relative'>
          <Input
            type='number'
            placeholder={typeRemuneration === 'TJM' ? '550' : '55000'}
            value={tjmOrSab}
            onChange={(e) =>
              dispatch({ type: 'SET_TJM_OR_SAB', payload: e.target.value })
            }
            className='pr-14'
            disabled={isGenerating}
          />
          <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium'>
            € HT
          </span>
        </div>
      </div>

      {/* Date disponibilité */}
      <div>
        <label className='flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2'>
          <Calendar className='w-4 h-4 text-orange-500' />
          Date de disponibilité
        </label>
        <div className='flex gap-2 items-center'>
          <Input
            type='date'
            value={startAsap ? '' : dateDisponibilite}
            onChange={(e) =>
              dispatch({
                type: 'SET_DATE_DISPONIBILITE',
                payload: e.target.value,
              })
            }
            disabled={startAsap || isGenerating}
            className='flex-1'
          />
          <button
            onClick={handleAsapToggle}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              startAsap
                ? 'bg-green-100 text-green-700 ring-1 ring-green-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {startAsap && <CheckCircle className='w-3.5 h-3.5' />}
            ASAP
          </button>
        </div>
      </div>

      {/* Lieu mission */}
      <div>
        <label className='flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2'>
          <MapPin className='w-4 h-4 text-orange-500' />
          Lieu de mission
        </label>
        <Input
          placeholder='Paris, Lyon, Remote...'
          value={lieuMission}
          onChange={(e) =>
            dispatch({ type: 'SET_LIEU_MISSION', payload: e.target.value })
          }
          disabled={isGenerating}
        />
      </div>

      {/* Répartition travail */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Répartition du travail
        </label>
        <Input
          placeholder='3j site / 2j remote'
          value={repartitionTravail}
          onChange={(e) =>
            dispatch({ type: 'SET_REPARTITION', payload: e.target.value })
          }
          maxLength={45}
          disabled={isGenerating}
        />
        <p className='text-[10px] text-gray-400 mt-1 text-right'>
          {repartitionTravail.length}/45
        </p>
      </div>

      {/* Entreprise */}
      <div>
        <label className='flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2'>
          <Building2 className='w-4 h-4 text-orange-500' />
          Entreprise cliente
        </label>
        <Input
          placeholder="Nom de l'entreprise"
          value={entrepriseNom}
          onChange={(e) =>
            dispatch({ type: 'SET_ENTREPRISE', payload: e.target.value })
          }
          disabled={isGenerating}
        />
      </div>

      {/* Langue */}
      <div>
        <label className='flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2'>
          <Globe className='w-4 h-4 text-orange-500' />
          Langue de la proposal
        </label>
        <div className='flex gap-2'>
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => dispatch({ type: 'SET_LANGUAGE', payload: lang })}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                language === lang
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <Button
        className='w-full bg-orange-600 hover:bg-orange-700 text-white h-12 gap-2 text-base font-semibold mt-2'
        onClick={onGenerate}
        disabled={!canGenerate}
      >
        {isGenerating ? (
          <>
            <Loader2 className='w-5 h-5 animate-spin' />
            Génération en cours...
          </>
        ) : (
          <>
            <Wand2 className='w-5 h-5' />
            Générer la proposal
          </>
        )}
      </Button>
    </div>
  );
});
