/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from 'next/navigation';
import React from 'react';

import prismadb from '@/lib/prisma.db';

import { getTemplate } from '@/components/templates';

export default async function PublicResumePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Récupérer le CV public par slug
  const resume = await prismadb.resume.findFirst({
    where: {
      slug,
      isPublic: true,
    },
    include: {
      user: {
        select: {
          name: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!resume) {
    notFound();
  }

  // Enregistrer la vue (côté serveur)
  const ipAddress = 'server-side'; // Dans un vrai environnement, récupérer l'IP
  const userAgent = 'server-side';

  await prismadb.resumeView.create({
    data: {
      resumeId: resume.id,
      ipAddress,
      userAgent,
    },
  });

  // Récupérer le template
  const template = getTemplate(resume.metadata.template as any);

  if (!template) {
    return <div>Template non trouvé</div>;
  }

  const TemplateComponent = template.component;

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header avec informations sur le CV */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-4xl mx-auto px-4 py-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                {resume.title}
              </h1>
              <p className='text-gray-600'>
                CV public de {resume.user.firstName} {resume.user.lastName}
              </p>
            </div>
            <div className='text-right text-sm text-gray-500'>
              <p>
                Mis à jour le{' '}
                {new Date(resume.updatedAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu du CV */}
      <div className='max-w-4xl mx-auto px-4 py-8'>
        <div className='bg-white shadow-lg rounded-lg overflow-hidden'>
          <TemplateComponent resume={resume as any} className='p-8' />
        </div>
      </div>

      {/* Footer */}
      <div className='bg-white border-t mt-12'>
        <div className='max-w-4xl mx-auto px-4 py-6'>
          <div className='flex items-center justify-between text-sm text-gray-500'>
            <p>Ce CV a été créé avec notre CV Builder</p>
            <p>
              Créé le {new Date(resume.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
