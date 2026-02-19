'use client';

import { CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

export default function BeforeAfterSection() {
  const examples = [
    {
      id: 1,
      jobTitle: 'Développeur Frontend',
      before: {
        issues: [
          'CV générique sans mots-clés du poste',
          'Compétences techniques noyées',
          'Expérience mal mise en valeur',
        ],
      },
      after: {
        improvements: [
          'CV adapté avec les technologies demandées',
          'Compétences React/TypeScript en avant',
          'Projets pertinents mis en évidence',
        ],
        result: '+300% de réponses',
      },
    },
    {
      id: 2,
      jobTitle: 'Chef de Projet Marketing',
      before: {
        issues: [
          'Résultats quantifiés absents',
          'Jargon technique inapproprié',
          'Format peu professionnel',
        ],
      },
      after: {
        improvements: [
          'KPIs et ROI clairement affichés',
          'Vocabulaire marketing adapté',
          'Design moderne et clean',
        ],
        result: "+250% d'entretiens",
      },
    },
  ];

  return (
    <section className='px-6 py-16 bg-gradient-to-r from-gray-50 to-blue-50'>
      <div className='max-w-6xl mx-auto '>
        <div className='mb-16 text-center'>
          <h2 className='mb-4 text-3xl font-bold text-gray-900 md:text-4xl'>
            Transformations réelles de nos utilisateurs
          </h2>
          <p className='max-w-2xl mx-auto text-xl text-gray-600'>
            Découvrez comment l'IA a optimisé des CV pour des secteurs
            spécifiques
          </p>
        </div>

        <div className='space-y-16'>
          {examples.map((example) => (
            <div key={example.id} className='grid gap-8 lg:grid-cols-2'>
              {/* AVANT */}
              <div className='relative'>
                <div className='mb-4 text-center'>
                  <h3 className='text-xl font-semibold text-gray-900'>
                    CV pour : {example.jobTitle}
                  </h3>
                  <div className='inline-flex items-center gap-2 px-4 py-2 mt-2 text-red-800 bg-red-100 rounded-full'>
                    <XCircle className='w-4 h-4' />
                    AVANT l'optimisation
                  </div>
                </div>

                <div className='relative overflow-hidden bg-white border-2 border-red-200 shadow-lg rounded-xl'>
                  <div className='absolute top-0 left-0 right-0 h-1 bg-red-500'></div>
                  <Image
                    src='/images/cv1.png'
                    alt={`CV avant optimisation - ${example.jobTitle}`}
                    width={400}
                    height={500}
                    className='w-full h-auto opacity-75'
                  />
                  <div className='absolute inset-0 bg-red-500/10'></div>
                </div>

                <div className='mt-4 space-y-2'>
                  <h4 className='font-semibold text-red-800'>
                    Problèmes identifiés :
                  </h4>
                  {example.before.issues.map((issue, index) => (
                    <div
                      key={index}
                      className='flex items-start gap-2 text-sm text-gray-600'
                    >
                      <XCircle className='flex-shrink-0 w-4 h-4 mt-0.5 text-red-500' />
                      {issue}
                    </div>
                  ))}
                </div>
              </div>

              {/* APRÈS */}
              <div className='relative'>
                <div className='mb-4 text-center'>
                  <h3 className='text-xl font-semibold text-gray-900'>
                    CV optimisé par l'IA
                  </h3>
                  <div className='inline-flex items-center gap-2 px-4 py-2 mt-2 text-green-800 bg-green-100 rounded-full'>
                    <CheckCircle className='w-4 h-4' />
                    APRÈS l'optimisation
                  </div>
                </div>

                <div className='relative overflow-hidden bg-white border-2 border-green-200 shadow-lg rounded-xl'>
                  <div className='absolute top-0 left-0 right-0 h-1 bg-green-500'></div>
                  <Image
                    src='/images/cv2.png'
                    alt={`CV après optimisation - ${example.jobTitle}`}
                    width={400}
                    height={500}
                    className='w-full h-auto'
                  />
                  <div className='absolute inset-0 bg-green-500/5'></div>
                </div>

                <div className='mt-4 space-y-2'>
                  <h4 className='font-semibold text-green-800'>
                    Améliorations apportées :
                  </h4>
                  {example.after.improvements.map((improvement, index) => (
                    <div
                      key={index}
                      className='flex items-start gap-2 text-sm text-gray-600'
                    >
                      <CheckCircle className='flex-shrink-0 w-4 h-4 mt-0.5 text-green-500' />
                      {improvement}
                    </div>
                  ))}
                  <div className='p-3 mt-4 border border-green-200 rounded-lg bg-green-50'>
                    <div className='font-bold text-green-800'>
                      Résultat : {example.after.result}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='mt-16 text-center'>
          <div className='inline-flex items-center gap-2 px-6 py-3 text-blue-800 bg-blue-100 rounded-full'>
            <CheckCircle className='w-5 h-5' />
            <span className='font-semibold'>
              En moyenne, nos utilisateurs obtiennent 3x plus de réponses
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
