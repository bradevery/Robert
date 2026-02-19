'use client';

import { FileText, RotateCcw, Send } from 'lucide-react';
import { useCallback, useReducer } from 'react';
import toast from 'react-hot-toast';

import { useOrganization } from '@/hooks/useOrganization';
import { useProposal } from '@/hooks/useProposal';

import { ProposalForm } from '@/components/proposal/ProposalForm';
import { ProposalPreview } from '@/components/proposal/ProposalPreview';
import {
  type ProposalAction,
  initialState,
  proposalReducer,
} from '@/components/proposal/types';
import { Button } from '@/components/ui/button';

import { type ProposalResult, useProposalStore } from '@/stores/proposal-store';

export default function ProposalPage() {
  const [state, dispatch] = useReducer(proposalReducer, initialState);
  const setLastResult = useProposalStore((s) => s.setLastResult);

  // Hooks
  const { generate } = useProposal();
  const { data: orgData } = useOrganization();

  const handleGenerate = useCallback(async () => {
    if (!state.cvFile && !state.aoFile) {
      toast.error('Veuillez importer au moins un CV ou un AO.');
      return;
    }

    try {
      const formData = new FormData();
      if (state.cvFile) formData.append('cvFile', state.cvFile);
      if (state.aoFile) formData.append('aoFile', state.aoFile);
      formData.append('typeRemuneration', state.typeRemuneration);
      formData.append('tjmOrSab', state.tjmOrSab);
      formData.append(
        'dateDisponibilite',
        state.startAsap ? 'ASAP' : state.dateDisponibilite
      );
      formData.append('lieuMission', state.lieuMission);
      formData.append('repartitionTravail', state.repartitionTravail);
      formData.append('entrepriseNom', state.entrepriseNom);
      formData.append('language', state.language);

      const result = await generate.mutateAsync(formData);

      dispatch({ type: 'SET_RESULT', payload: result });
      setLastResult(result);
      toast.success('Proposal générée avec succès !');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erreur lors de la génération'
      );
    }
  }, [state, setLastResult, generate]);

  const handleEditedChange = useCallback((data: ProposalResult) => {
    dispatch({ type: 'UPDATE_EDITED', payload: data });
  }, []);

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const handleExportPPTX = useCallback(async () => {
    const dataToExport = state.editedData || state.result;
    if (!dataToExport) return;

    try {
      const { exportProposalToPPTX } = await import(
        '@/lib/pptx/proposal-export'
      );
      await exportProposalToPPTX(dataToExport, orgData);
      toast.success('PPTX généré !');
    } catch (error) {
      console.error('Error generating PPTX:', error);
      toast.error("Erreur lors de l'export PPTX");
    }
  }, [state.editedData, state.result, orgData]);

  return (
    <>
      {/* Sticky Header */}
      <div className='sticky top-0 z-10 px-8 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-100'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-orange-50 rounded-lg text-orange-600'>
              <Send className='w-5 h-5' />
            </div>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>
                Générateur de Proposals
              </h1>
              <p className='text-sm text-gray-500'>
                CV + AO pour créer une proposal percutante
              </p>
            </div>
          </div>
          {state.result && (
            <Button
              variant='outline'
              size='sm'
              className='gap-1.5'
              onClick={handleReset}
            >
              <RotateCcw className='w-4 h-4' />
              Recommencer
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className='p-8'>
        <div className='grid grid-cols-1 lg:grid-cols-[420px,1fr] gap-8'>
          {/* Left: Form */}
          <div className='bg-white p-6 rounded-2xl border border-gray-100 h-fit'>
            <ProposalForm
              state={state}
              dispatch={dispatch as React.Dispatch<ProposalAction>}
              onGenerate={handleGenerate}
            />
          </div>

          {/* Right: Preview or Placeholder */}
          <div className='min-h-[600px]'>
            {state.editedData ? (
              <ProposalPreview
                data={state.editedData}
                onChange={handleEditedChange}
                onExportPPTX={handleExportPPTX}
              />
            ) : (
              <div className='bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex items-center justify-center'>
                <div className='text-center py-20 px-8'>
                  <div className='w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6'>
                    <FileText className='w-10 h-10 text-orange-300' />
                  </div>
                  <h3 className='text-lg font-medium text-gray-600 mb-2'>
                    Votre proposal apparaîtra ici
                  </h3>
                  <p className='text-sm text-gray-400 max-w-xs mx-auto'>
                    Importez un CV et un appel d&apos;offres, puis cliquez sur
                    Générer pour obtenir une proposal structurée
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
