'use client';

import { Check, Copy, Download, FileText, Presentation } from 'lucide-react';
import { memo, useCallback } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import type { ProposalResult } from '@/stores/proposal-store';

import { BulletPointEditor } from './BulletPointEditor';
import { WordCounter } from './WordCounter';

interface ProposalPreviewProps {
  data: ProposalResult;
  onChange: (data: ProposalResult) => void;
  onExportPPTX?: () => void;
}

export const ProposalPreview = memo(function ProposalPreview({
  data,
  onChange,
  onExportPPTX,
}: ProposalPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleFieldChange = useCallback(
    (field: keyof ProposalResult, value: string) => {
      onChange({ ...data, [field]: value });
    },
    [data, onChange]
  );

  const handleBulletsChange = useCallback(
    (section: 'adequationBesoin' | 'impactValeur', bulletPoints: string[]) => {
      onChange({ ...data, [section]: { bulletPoints } });
    },
    [data, onChange]
  );

  const handleCopy = useCallback(async () => {
    const bullets = (items: string[]) =>
      items.map((item) => `  - ${item}`).join('\n');

    const text = `${data.titre}

CONTEXTE DE LA MISSION
${data.contexteMission}

PROFIL DU CANDIDAT
${data.profilCandidat}

ADÉQUATION AU BESOIN
${bullets(data.adequationBesoin.bulletPoints)}

IMPACT & VALEUR AJOUTÉE
${bullets(data.impactValeur.bulletPoints)}`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [data]);

  return (
    <div className='bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full'>
      {/* Preview header */}
      <div className='flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl'>
        <h3 className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
          <FileText className='w-4 h-4 text-orange-500' />
          Aperçu de la proposal
        </h3>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            className='gap-1.5 text-xs'
            onClick={handleCopy}
          >
            {copied ? (
              <Check className='w-3.5 h-3.5' />
            ) : (
              <Copy className='w-3.5 h-3.5' />
            )}
            {copied ? 'Copié' : 'Copier'}
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='gap-1.5 text-xs'
            onClick={onExportPPTX}
          >
            <Presentation className='w-3.5 h-3.5' />
            PPTX
          </Button>
          <Button variant='outline' size='sm' className='gap-1.5 text-xs'>
            <Download className='w-3.5 h-3.5' />
            PDF
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto p-6 space-y-6'>
        {/* Titre */}
        <div>
          <input
            value={data.titre}
            onChange={(e) => handleFieldChange('titre', e.target.value)}
            className='w-full text-xl font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-orange-200 focus:border-orange-400 focus:outline-none pb-1 transition-colors'
          />
        </div>

        {/* Contexte Mission */}
        <Section title='Contexte de la mission' wordMin={66} wordMax={70}>
          <textarea
            value={data.contexteMission}
            onChange={(e) =>
              handleFieldChange('contexteMission', e.target.value)
            }
            rows={4}
            className='w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 leading-relaxed focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30 outline-none transition-colors'
          />
          <div className='flex justify-end mt-1'>
            <WordCounter text={data.contexteMission} min={66} max={70} />
          </div>
        </Section>

        {/* Profil Candidat */}
        <Section title='Profil du candidat' wordMin={76} wordMax={80}>
          <textarea
            value={data.profilCandidat}
            onChange={(e) =>
              handleFieldChange('profilCandidat', e.target.value)
            }
            rows={4}
            className='w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 leading-relaxed focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30 outline-none transition-colors'
          />
          <div className='flex justify-end mt-1'>
            <WordCounter text={data.profilCandidat} min={76} max={80} />
          </div>
        </Section>

        {/* Adéquation au besoin */}
        <Section title='Adéquation au besoin'>
          <BulletPointEditor
            items={data.adequationBesoin.bulletPoints}
            onChange={(items) => handleBulletsChange('adequationBesoin', items)}
            minWords={9}
            maxWords={14}
          />
        </Section>

        {/* Impact & Valeur */}
        <Section title='Impact & Valeur ajoutée'>
          <BulletPointEditor
            items={data.impactValeur.bulletPoints}
            onChange={(items) => handleBulletsChange('impactValeur', items)}
            minWords={9}
            maxWords={14}
          />
        </Section>
      </div>
    </div>
  );
});

function Section({
  title,
  children,
  wordMin,
  wordMax,
}: {
  title: string;
  children: React.ReactNode;
  wordMin?: number;
  wordMax?: number;
}) {
  return (
    <div>
      <div className='flex items-center justify-between mb-2'>
        <h4 className='text-sm font-semibold text-gray-800 uppercase tracking-wide'>
          {title}
        </h4>
        {wordMin != null && wordMax != null && (
          <span className='text-[10px] text-gray-400'>
            {wordMin}-{wordMax} mots
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
