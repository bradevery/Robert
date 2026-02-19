'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  ArrowLeft,
  Briefcase,
  Building,
  Calendar,
  Clock,
  Download,
  Edit,
  FileText,
  Share2,
  Trash2,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { DossierTemplate } from '@/components/cv-builder/templates/DossierTemplate';
import { Button } from '@/components/ui/button';
import LoadingState from '@/components/ui/loading-state';
import { DossierStatusBadge } from '@/components/ui/status-indicator';

import type { CV } from '@/stores/cv-store-unified';
import type { Dossier } from '@/stores/dossiers-store';
import { useDossiersStore } from '@/stores/dossiers-store';

export default function DossierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { getDossierById, fetchDossiers, deleteDossier, loading } =
    useDossiersStore();
  const [dossier, setDossier] = useState<Dossier | undefined>(undefined);

  useEffect(() => {
    const existing = getDossierById(id);
    if (existing) {
      setDossier(existing);
    } else {
      fetchDossiers().then(() => {
        const fetched = useDossiersStore
          .getState()
          .dossiers.find((d) => d.id === id);
        if (fetched) setDossier(fetched);
        else if (!loading) notFound();
      });
    }
  }, [id, getDossierById, fetchDossiers, loading]);

  const handleDelete = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce dossier ?')) {
      await deleteDossier(id);
      router.push('/mes-dossiers');
    }
  };

  const cvPreview = useMemo(() => {
    if (!dossier) return null;
    // Construct a compatible CV object for the template
    return {
      id: dossier.id,
      title: dossier.title,
      slug: dossier.slug,
      data: dossier.data || {},
      metadata: dossier.metadata || {
        theme: { primary: '#2563eb', text: '#1f2937', background: '#ffffff' },
        typography: {
          font: { family: 'Inter', url: '' },
          size: { body: 14, heading: 24 },
        },
      },
      company: (dossier.metadata as any)?.company || undefined,
    } as unknown as CV;
  }, [dossier]);

  if (loading && !dossier)
    return <LoadingState message='Chargement du dossier...' />;
  if (!dossier)
    return <div className='p-8 text-center'>Dossier introuvable</div>;

  const candidateName = dossier.data?.basics?.firstName
    ? `${dossier.data.basics.firstName} ${dossier.data.basics.lastName}`
    : 'Candidat inconnu';

  const candidateTitle = dossier.data?.basics?.title || 'Titre non défini';

  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm'>
        <div className='px-8 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Link
                href='/mes-dossiers'
                className='p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <ArrowLeft className='w-5 h-5' />
              </Link>
              <div>
                <div className='flex items-center gap-3'>
                  <h1 className='text-xl font-bold text-gray-900'>
                    {dossier.title}
                  </h1>
                  <DossierStatusBadge status={dossier.status as any} />
                </div>
                <div className='flex items-center gap-4 mt-1 text-sm text-gray-500'>
                  <span className='flex items-center gap-1'>
                    <Clock className='w-3.5 h-3.5' />
                    Mis à jour le{' '}
                    {new Date(dossier.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <Button
                variant='outline'
                className='gap-2 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100'
                onClick={handleDelete}
              >
                <Trash2 className='w-4 h-4' />
              </Button>
              <Link href={`/cv-builder?id=${dossier.id}`}>
                <Button className='bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-xl shadow-sm'>
                  <Edit className='w-4 h-4' />
                  Éditer dans le Designer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8'>
        {/* Left Sidebar - Details */}
        <div className='lg:col-span-4 space-y-6'>
          {/* Candidate Card */}
          <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm'>
            <h3 className='text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2'>
              <User className='w-4 h-4' /> Infos Candidat
            </h3>
            <div className='flex items-center gap-4 mb-4'>
              <div className='w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg'>
                {dossier.data?.basics?.firstName?.[0] || '?'}
                {dossier.data?.basics?.lastName?.[0] || '?'}
              </div>
              <div>
                <div className='font-bold text-gray-900'>{candidateName}</div>
                <div className='text-sm text-gray-500'>{candidateTitle}</div>
              </div>
            </div>

            <div className='space-y-3 pt-4 border-t border-gray-100'>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-500'>Email</span>
                <span className='font-medium text-gray-900'>
                  {dossier.data?.basics?.email || '—'}
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-500'>Téléphone</span>
                <span className='font-medium text-gray-900'>
                  {dossier.data?.basics?.phone || '—'}
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-500'>Expérience</span>
                <span className='font-medium text-gray-900'>
                  {dossier.data?.basics?.yearsOfExperience
                    ? `${dossier.data.basics.yearsOfExperience} ans`
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Context Card */}
          <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm'>
            <h3 className='text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2'>
              <Briefcase className='w-4 h-4' /> Contexte
            </h3>

            <div className='space-y-4'>
              <div>
                <span className='text-xs text-gray-500 block mb-1'>
                  Client associé
                </span>
                <div className='font-medium text-gray-900 flex items-center gap-2'>
                  {dossier.clientId ? (
                    <>
                      <Building className='w-4 h-4 text-gray-400' />
                      {/* Client name would need to be fetched or stored in metadata. Using ID or 'Client' for now if not available */}
                      {(dossier.metadata as any)?.clientName ||
                        'Client ' + dossier.clientId.substring(0, 8)}
                    </>
                  ) : (
                    <span className='text-gray-400 italic'>
                      Aucun client associé
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className='text-xs text-gray-500 block mb-1'>
                  Date de création
                </span>
                <div className='font-medium text-gray-900 flex items-center gap-2'>
                  <Calendar className='w-4 h-4 text-gray-400' />
                  {new Date(dossier.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm'>
            <h3 className='text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2'>
              <FileText className='w-4 h-4' /> Actions
            </h3>
            <div className='space-y-3'>
              <Button
                variant='outline'
                className='w-full justify-start gap-2 rounded-xl'
              >
                <Download className='w-4 h-4' /> Télécharger en PDF
              </Button>
              <Button
                variant='outline'
                className='w-full justify-start gap-2 rounded-xl'
              >
                <Share2 className='w-4 h-4' /> Partager le dossier
              </Button>
            </div>
          </div>
        </div>

        {/* Right Content - Preview */}
        <div className='lg:col-span-8'>
          <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full'>
            <div className='p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center'>
              <h3 className='font-bold text-gray-700'>Aperçu du document</h3>
              <span className='text-xs text-gray-500 bg-white px-2 py-1 rounded border'>
                Format A4
              </span>
            </div>

            <div className='flex-1 bg-gray-100 p-8 overflow-auto flex justify-center items-start min-h-[600px]'>
              {/* Scaled preview container */}
              <div className='origin-top transform scale-[0.65] md:scale-[0.8] lg:scale-[0.6] xl:scale-[0.7] 2xl:scale-[0.8] shadow-2xl transition-transform duration-300'>
                {cvPreview && <DossierTemplate cv={cvPreview} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
