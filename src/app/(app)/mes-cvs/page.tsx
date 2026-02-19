'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Download,
  Edit3,
  Eye,
  FileText,
  Loader2,
  Plus,
  Star,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import React, { useMemo } from 'react';

import { useResumes } from '@/hooks/useResumes';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EmptyState from '@/components/ui/empty-state';
import Skeleton from '@/components/ui/skeleton';

interface CVItem {
  id: number | string;
  title: string;
  template: string;
  lastModified: string;
  status: string;
  atsScore: number | null;
  applications: number;
  createdAt: string;
}

function MyCVsPage() {
  const { list: resumesQuery, deleteResume } = useResumes();
  const { data, isLoading, error } = resumesQuery;

  const cvList = useMemo(() => {
    if (!data?.resumes) return [];
    return data.resumes.map((resume: any, index: number) => {
      const templateName = resume?.metadata?.templateName || 'Standard';
      const status = resume.isLocked
        ? 'Verrouillé'
        : resume.isPublic
        ? 'Public'
        : 'Brouillon';
      return {
        id: resume.id || index,
        title: resume.title || 'CV sans titre',
        template: templateName,
        lastModified: new Date(resume.updatedAt).toLocaleDateString('fr-FR'),
        status,
        atsScore: typeof resume.atsScore === 'number' ? resume.atsScore : null,
        applications: 0,
        createdAt: new Date(resume.createdAt).toLocaleDateString('fr-FR'),
      } as CVItem;
    });
  }, [data]);

  const handleDelete = async (id: string | number) => {
    if (typeof id !== 'string') return;
    if (confirm('Êtes-vous sûr de vouloir supprimer ce CV ?')) {
      try {
        await deleteResume.mutateAsync(id);
        toast.success('CV supprimé');
      } catch {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-r from-gray-50 to-blue-50'>
      <div className='container py-8 pt-20 lg:py-12 lg:pt-8'>
        {/* Header Section */}
        <div className='flex flex-col mb-8 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <h1 className='mb-2 text-3xl font-bold text-gray-900'>Mes CV</h1>
            <p className='text-gray-600'>
              Gérez et optimisez tous vos CV en un seul endroit
            </p>
          </div>
          <div className='mt-4 lg:mt-0'>
            <Button
              className='bg-gradient-to-r from-[#157fbe] to-[#1b5cc6] hover:from-[#11689e] hover:to-[#174ca3] font-bold'
              asChild
            >
              <Link href='/builder'>
                <Plus className='w-4 h-4 mr-2' />
                Nouveau CV
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}

        {/* CV List */}
        <Card className='border-0 shadow-lg bg-white/90 backdrop-blur-sm'>
          <CardHeader>
            <CardTitle className='text-xl'>Tous mes CV</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='space-y-4'>
                {[...Array(3)].map((_, index) => (
                  <div
                    key={`cv-skel-${index}`}
                    className='p-6 border rounded-lg bg-white/70'
                  >
                    <div className='flex items-center gap-6'>
                      <Skeleton className='w-16 h-20' />
                      <div className='flex-1 space-y-2'>
                        <Skeleton className='h-4 w-48' />
                        <Skeleton className='h-3 w-32' />
                        <Skeleton className='h-3 w-40' />
                      </div>
                      <div className='hidden sm:block w-32 space-y-2'>
                        <Skeleton className='h-4 w-20' />
                        <Skeleton className='h-3 w-16' />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className='p-12 text-center text-red-500'>
                Erreur lors du chargement des CVs.
              </div>
            ) : cvList.length === 0 ? (
              <EmptyState
                title='Aucun CV'
                description='Créez votre premier CV pour commencer.'
                icon={FileText}
                actionLabel='Nouveau CV'
                actionHref='/builder'
              />
            ) : (
              <div className='space-y-4'>
                {cvList.map((cv) => (
                  <div
                    key={cv.id}
                    className='flex items-center justify-between p-6 transition-all duration-300 border rounded-lg shadow-sm bg-white/70 backdrop-blur-sm hover:bg-white/90 hover:shadow-md border-white/20'
                  >
                    <div className='flex items-center space-x-6'>
                      <div className='flex items-center justify-center w-16 h-20 border rounded shadow-lg bg-white/90 backdrop-blur-sm border-white/40'>
                        <FileText className='w-8 h-8 text-gray-400' />
                      </div>
                      <div>
                        <h3 className='mb-1 text-lg font-semibold text-gray-900'>
                          {cv.title}
                        </h3>
                        <p className='mb-1 text-sm text-gray-600'>
                          Template: {cv.template}
                        </p>
                        <p className='text-xs text-gray-500'>
                          Créé le {cv.createdAt} • Modifié {cv.lastModified}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center space-x-6'>
                      <div className='text-center'>
                        <Badge
                          variant={
                            cv.status === 'Optimisé'
                              ? 'default'
                              : cv.status === 'En révision'
                              ? 'secondary'
                              : 'outline'
                          }
                          className='mb-2'
                        >
                          {cv.status}
                        </Badge>
                        <p className='text-sm font-semibold text-gray-900'>
                          Score ATS:{' '}
                          {cv.atsScore === null ? '—' : `${cv.atsScore}%`}
                        </p>
                      </div>

                      <div className='text-center'>
                        <p className='text-lg font-bold text-gray-900'>
                          {cv.applications}
                        </p>
                        <p className='text-xs text-gray-600'>candidatures</p>
                      </div>

                      <div className='flex items-center space-x-2'>
                        <Button variant='ghost' size='sm' title='Voir' asChild>
                          <Link href={`/mes-cvs/${cv.id}`}>
                            <Eye className='w-4 h-4' />
                          </Link>
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          title='Modifier'
                          asChild
                        >
                          <Link href={`/cv-builder?id=${cv.id}`}>
                            <Edit3 className='w-4 h-4' />
                          </Link>
                        </Button>
                        <Button variant='ghost' size='sm' title='Optimiser'>
                          <Star className='w-4 h-4' />
                        </Button>
                        <Button variant='ghost' size='sm' title='Télécharger'>
                          <Download className='w-4 h-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          title='Supprimer'
                          className='text-red-500 hover:text-red-700'
                          onClick={() => handleDelete(cv.id)}
                          disabled={deleteResume.isPending}
                        >
                          {deleteResume.isPending ? (
                            <Loader2 className='w-4 h-4 animate-spin' />
                          ) : (
                            <Trash2 className='w-4 h-4' />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default MyCVsPage;
