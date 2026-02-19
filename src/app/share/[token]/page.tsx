'use client';

import { AlertCircle, Clock, Download, FileText, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';

import { useShare } from '@/hooks/useShare';
import { downloadPDF } from '@/lib/pdf/export';

import { Button } from '@/components/ui/button';

export default function SharePage({ params }: { params: { token: string } }) {
  const { useSharedDocument } = useShare();
  const { data, isLoading: loading, error } = useSharedDocument(params.token);
  
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!contentRef.current) return;
    setIsExporting(true);
    try {
      await downloadPDF(contentRef.current, {
        filename: `shared-${data?.documentType || 'document'}.pdf`,
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
          <p className='text-gray-600'>Chargement du document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='max-w-md w-full mx-4'>
          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center'>
            <div className='w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4'>
              <AlertCircle className='w-8 h-8 text-red-500' />
            </div>
            <h1 className='text-xl font-bold text-gray-900 mb-2'>
              Document non disponible
            </h1>
            <p className='text-gray-600'>{(error as Error)?.message || 'Une erreur est survenue'}</p>
          </div>
        </div>
      </div>
    );
  }

  const expiresAt = data?.expiresAt ? new Date(data.expiresAt) : null;
  const daysRemaining = expiresAt
    ? Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-100 sticky top-0 z-10'>
        <div className='max-w-4xl mx-auto px-4 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center'>
              <FileText className='w-5 h-5 text-blue-600' />
            </div>
            <div>
              <h1 className='font-semibold text-gray-900 capitalize'>
                {data?.documentType || 'Document'}
              </h1>
              <div className='flex items-center gap-2 text-xs text-gray-500'>
                <Clock className='w-3 h-3' />
                Expire dans {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}
              </div>
            </div>
          </div>
          <Button onClick={handleDownload} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className='w-4 h-4 animate-spin mr-2' />
            ) : (
              <Download className='w-4 h-4 mr-2' />
            )}
            Télécharger
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-4xl mx-auto px-4 py-8'>
        <div
          ref={contentRef}
          className='bg-white rounded-2xl shadow-sm border border-gray-100 p-8'
        >
          {data?.documentType === 'cv' && (
            <CVPreview document={data.document} />
          )}
          {data?.documentType === 'dossier' && (
            <DossierPreview document={data.document} />
          )}
          {data?.documentType === 'propale' && (
            <PropalePreview document={data.document} />
          )}
        </div>
      </div>
    </div>
  );
}

function CVPreview({ document }: { document: Record<string, unknown> }) {
  const basics = (document.basics as Record<string, unknown>) || {};
  const work = (document.work as Array<Record<string, unknown>>) || [];
  const education =
    (document.education as Array<Record<string, unknown>>) || [];

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='text-center pb-6 border-b border-gray-100'>
        <h1 className='text-3xl font-bold text-gray-900'>
          {String(basics.name || 'Sans nom')}
        </h1>
        <p className='text-lg text-gray-600 mt-1'>
          {String(basics.label || '')}
        </p>
        <div className='flex items-center justify-center gap-4 mt-4 text-sm text-gray-500'>
          {basics.email && <span>{String(basics.email)}</span>}
          {basics.phone && <span>{String(basics.phone)}</span>}
          {(basics.location as Record<string, unknown>)?.city && (
            <span>
              {String((basics.location as Record<string, unknown>).city)}
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      {basics.summary && (
        <div>
          <h2 className='text-lg font-semibold text-gray-900 mb-3'>Profil</h2>
          <p className='text-gray-700'>{String(basics.summary)}</p>
        </div>
      )}

      {/* Work Experience */}
      {work.length > 0 && (
        <div>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>
            Expérience
          </h2>
          <div className='space-y-4'>
            {work.map((job, index) => (
              <div
                key={index}
                className='pb-4 border-b border-gray-100 last:border-0'
              >
                <div className='flex justify-between'>
                  <h3 className='font-medium text-gray-900'>
                    {String(job.position || '')}
                  </h3>
                  <span className='text-sm text-gray-500'>
                    {String(job.startDate || '')} -{' '}
                    {String(job.endDate || 'Present')}
                  </span>
                </div>
                <p className='text-gray-600'>{String(job.name || '')}</p>
                {job.summary && (
                  <p className='text-sm text-gray-700 mt-2'>
                    {String(job.summary)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>
            Formation
          </h2>
          <div className='space-y-4'>
            {education.map((edu, index) => (
              <div key={index}>
                <h3 className='font-medium text-gray-900'>
                  {String(edu.studyType || '')} - {String(edu.area || '')}
                </h3>
                <p className='text-gray-600'>{String(edu.institution || '')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DossierPreview({ document }: { document: Record<string, unknown> }) {
  const client = (document.client as Record<string, unknown>) || {};
  const candidates =
    (document.candidates as Array<Record<string, unknown>>) || [];

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>
          {String(document.title || '')}
        </h1>
        <p className='text-gray-600 mt-1'>
          Réf: {String(document.reference || '')}
        </p>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='p-4 bg-gray-50 rounded-xl'>
          <span className='text-sm text-gray-500'>Client</span>
          <p className='font-medium'>{String(client.name || 'N/A')}</p>
        </div>
        <div className='p-4 bg-gray-50 rounded-xl'>
          <span className='text-sm text-gray-500'>Statut</span>
          <p className='font-medium capitalize'>
            {String(document.status || 'N/A')}
          </p>
        </div>
        <div className='p-4 bg-gray-50 rounded-xl'>
          <span className='text-sm text-gray-500'>Budget</span>
          <p className='font-medium'>
            {document.budget ? `${String(document.budget)}€` : 'N/A'}
          </p>
        </div>
        <div className='p-4 bg-gray-50 rounded-xl'>
          <span className='text-sm text-gray-500'>Deadline</span>
          <p className='font-medium'>
            {document.deadline
              ? new Date(String(document.deadline)).toLocaleDateString('fr-FR')
              : 'N/A'}
          </p>
        </div>
      </div>

      {document.description && (
        <div>
          <h2 className='font-semibold text-gray-900 mb-2'>Description</h2>
          <p className='text-gray-700'>{String(document.description)}</p>
        </div>
      )}

      {candidates.length > 0 && (
        <div>
          <h2 className='font-semibold text-gray-900 mb-3'>
            Candidats proposés
          </h2>
          <div className='space-y-3'>
            {candidates.map((dc, index) => {
              const candidate = (dc.candidate as Record<string, unknown>) || {};
              return (
                <div
                  key={index}
                  className='p-4 border border-gray-200 rounded-xl'
                >
                  <p className='font-medium'>
                    {String(candidate.firstName || '')}{' '}
                    {String(candidate.lastName || '')}
                  </p>
                  <p className='text-sm text-gray-600'>
                    {String(candidate.title || '')}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PropalePreview({ document }: { document: Record<string, unknown> }) {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>
          {String(document.title || 'Proposition commerciale')}
        </h1>
      </div>

      <div className='prose max-w-none'>
        <div
          dangerouslySetInnerHTML={{ __html: String(document.content || '') }}
          className='text-gray-700'
        />
      </div>
    </div>
  );
}
