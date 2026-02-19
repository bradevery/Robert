'use client';

import { Chrome, Download, MousePointer, Zap } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Button } from '@/components/ui/button';

export default function ExtensionSection() {
  const features = [
    {
      icon: MousePointer,
      title: 'Détection auto',
      description: "Détecte et récupère l'offre automatiquement.",
    },
    {
      icon: Zap,
      title: 'CV optimisé',
      description: "Votre CV s'adapte instantanément à l'offre.",
    },
    {
      icon: Chrome,
      title: 'Multi-navigateurs',
      description: 'Chrome, Firefox et Edge.',
    },
  ];

  return (
    <section className='px-6 py-12 lg:py-20'>
      <div className='max-w-6xl mx-auto '>
        <div className='grid items-center gap-16 lg:grid-cols-2'>
          {/* Left Content */}
          <div className='text-center lg:text-left'>
            <div className='mb-6'>
              <div className='inline-flex items-center gap-2 px-4 py-2 mb-4 text-sm font-medium text-blue-700 bg-blue-100 rounded-full'>
                <Chrome className='w-4 h-4' />
                Extension
              </div>
              <h2 className='mb-4 text-3xl font-bold text-gray-900 md:text-4xl'>
                Candidatez en un clic
              </h2>
              <p className='mb-8 text-xl text-gray-600'>
                Plus besoin de copier-coller avec l'extension
              </p>
            </div>

            <div className='max-w-md mx-auto mb-8 space-y-6 lg:max-w-none lg:mx-0'>
              {features.map((feature, index) => (
                <div
                  key={index}
                  className='flex justify-start gap-4 lg:justify-start'
                >
                  <div className='flex items-center justify-center flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg'>
                    <feature.icon className='w-6 h-6 text-blue-600' />
                  </div>
                  <div className='flex-1 text-left'>
                    <h3 className='mb-2 text-lg font-bold text-gray-900'>
                      {feature.title}
                    </h3>
                    <p className='text-gray-600'>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className='flex flex-col justify-center gap-4 sm:flex-row lg:justify-start'>
              <Link href='/extension'>
                <Button size='lg' className='w-full font-bold sm:w-auto'>
                  <Download className='w-5 h-5 ' />
                  Télécharger l'extension
                </Button>
              </Link>
              <Link href='/extension'>
                <Button
                  variant='outline'
                  size='lg'
                  className='w-full sm:w-auto border-2 border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50'
                >
                  Voir un exemple
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Content - Extension Preview */}
          <div className='relative flex justify-center lg:justify-end'>
            <div className='relative p-6 bg-white shadow-2xl rounded-2xl'>
              {/* Browser Window Mockup */}
              <div className='mb-4'>
                <div className='flex items-center gap-2 mb-3'>
                  <div className='flex gap-1'>
                    <div className='w-3 h-3 bg-red-400 rounded-full'></div>
                    <div className='w-3 h-3 bg-yellow-400 rounded-full'></div>
                    <div className='w-3 h-3 bg-green-400 rounded-full'></div>
                  </div>
                  <div className='flex-1 h-6 bg-gray-100 rounded'></div>
                </div>

                {/* Extension Popup Mockup */}
                <div className='p-4 border border-gray-200 rounded-lg bg-gradient-to-br from-blue-50 to-white'>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='w-8 h-8 bg-blue-600 rounded-lg'></div>
                    <div>
                      <div className='font-semibold text-gray-900'>
                        CVmatchr
                      </div>
                      <div className='text-sm text-gray-500'>Extension</div>
                    </div>
                  </div>

                  <div className='mb-4 space-y-2'>
                    <div className='flex items-center gap-2 text-sm'>
                      <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                      <span className='text-gray-700'>
                        Offre détectée: Développeur Frontend
                      </span>
                    </div>
                    <div className='p-2 text-xs rounded bg-gray-50'>
                      "Nous recherchons un développeur React.js expérimenté..."
                    </div>
                  </div>

                  <Button size='sm' className='w-full'>
                    <Zap className='w-4 h-4 mr-2' />
                    Optimiser mon CV
                  </Button>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className='absolute -top-4 -right-4'>
              <div className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-full shadow-lg'>
                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                Active
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
