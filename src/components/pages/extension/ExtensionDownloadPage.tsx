'use client';

import {
  Download,
  Eye,
  FileText,
  Globe,
  MousePointer,
  Puzzle,
  Shield,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import { Button } from '@/components/ui/button';

export default function ExtensionDownloadPage() {
  const browsers = [
    {
      name: 'Chrome',
      image: '/images/chrome.svg',
      downloadUrl: '#',
      description: 'Extension officielle pour Chrome',
      users: '10k+',
      rating: 4.8,
    },
    {
      name: 'Firefox',
      image: '/images/firefox.svg',
      downloadUrl: '#',
      description: 'Add-on compatible Firefox',
      users: '5k+',
      rating: 4.7,
    },
    {
      name: 'Edge',
      image: '/images/edge.svg',
      downloadUrl: '#',
      description: 'Extension Microsoft Edge',
      users: '3k+',
      rating: 4.9,
    },
  ];

  const features = [
    {
      icon: MousePointer,
      title: 'Détection automatique',
      description:
        "Détecte automatiquement les offres d'emploi sur LinkedIn, Indeed, et plus encore.",
    },
    {
      icon: Zap,
      title: 'Optimisation instantanée',
      description: "Votre CV s'adapte selon les exigences de l'offre.",
    },
    {
      icon: Shield,
      title: 'Sécurisé et privé',
      description:
        "Vos données restent confidentielles. Aucune information n'est stockée.",
    },
  ];

  const steps = [
    {
      step: 1,
      icon: Download,
      title: "Installez l'extension",
      description:
        'Téléchargez et installez en un clic depuis votre navigateur.',
    },
    {
      step: 2,
      icon: Globe,
      title: 'Aller vers votre site',
      description:
        'Visitez LinkedIn, Indeed, ou tout autre site de recrutement.',
    },
    {
      step: 3,
      icon: Eye,
      title: 'Cliquez sur une offre',
      description:
        "L'extension détecte automatiquement les détails de l'offre.",
    },
    {
      step: 4,
      icon: FileText,
      title: 'Optimisez votre CV',
      description: "Un clic suffit pour adapter votre CV à l'offre détectée.",
    },
  ];

  return (
    <div
      className='min-h-screen '
      style={{
        marginTop: '-100px',
        paddingTop: '100px',
      }}
    >
      {/* Hero Section */}
      <section
        className='px-6 pb-16 pt-28 hero-background'
        style={{
          marginTop: '-100px',
          paddingTop: '230px',
        }}
      >
        <div className='max-w-6xl mx-auto '>
          <div className='grid items-center gap-12 lg:grid-cols-2'>
            {/* Left Content */}
            <div className='text-center lg:text-left'>
              <div className='inline-flex items-center gap-2 px-4 py-2 mb-4 text-sm font-medium text-blue-700 bg-blue-100 rounded-full'>
                <Puzzle className='w-4 h-4' />
                Extension CVmatchr
              </div>

              <h1 className='mb-4 text-3xl font-bold text-gray-900 md:text-5xl'>
                Candidatez plus efficacement avec notre{' '}
                <span className='bg-gradient-to-r from-[#157fbe] to-[#1b5cc6] bg-clip-text text-transparent'>
                  extension navigateur
                </span>
              </h1>

              <p className='mb-8 text-lg text-gray-600'>
                Automatisez votre processus de candidature. Détectez les offres,
                optimisez votre CV et postulez en un clic directement depuis
                votre navigateur.
              </p>

              {/* Browser Download Icons */}
              <div className='mb-8'>
                <div className='flex items-center justify-center gap-4 text-center lg:justify-start'>
                  <p className='text-sm font-medium text-gray-600'>
                    Disponible sur :
                  </p>
                  {browsers.map((browser) => (
                    <a
                      key={browser.name}
                      href={browser.downloadUrl}
                      className='transition-all hover:scale-110'
                      title={`Installer sur ${browser.name}`}
                    >
                      <Image
                        src={`${browser.image}?v=1`}
                        alt={browser.name}
                        width={32}
                        height={32}
                        className='object-contain'
                        unoptimized
                      />
                    </a>
                  ))}
                </div>
              </div>

              <div className='flex items-center justify-center gap-4 text-sm text-gray-600 lg:justify-start'>
                <div className='flex items-center gap-1'>
                  <Shield className='w-4 h-4 text-green-500' />
                  <span>100% sécurisé</span>
                </div>
                <div className='flex items-center gap-1'>
                  <Download className='w-4 h-4 text-blue-500' />
                  <span>Installation gratuite</span>
                </div>
              </div>
            </div>

            {/* Right Content - Screenshot */}
            <div className='relative'>
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

                  {/* Extension in Action */}
                  <div className='space-y-4'>
                    <div className='p-3 border border-gray-200 rounded-lg bg-gradient-to-r from-blue-50 to-white'>
                      <div className='flex items-center gap-3 mb-3'>
                        <div className='w-8 h-8 bg-blue-600 rounded-lg'></div>
                        <div>
                          <div className='font-semibold text-gray-900'>
                            CVmatchr Extension
                          </div>
                          <div className='text-xs text-gray-500'>
                            Offre détectée
                          </div>
                        </div>
                      </div>

                      <div className='mb-3 space-y-2'>
                        <div className='flex items-center gap-2 text-sm'>
                          <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                          <span className='text-gray-700'>
                            Développeur Frontend Senior
                          </span>
                        </div>
                        <div className='p-2 text-xs rounded bg-gray-50'>
                          "React.js, TypeScript, Node.js requis..."
                        </div>
                      </div>

                      <Button size='sm' className='w-full'>
                        <Zap className='w-4 h-4 mr-2' />
                        Adapter mon CV
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className='absolute -top-4 -right-4'>
                <div className='flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-full shadow-lg'>
                  <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                  Actif
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='px-6 py-12 lg:py-20 bg-gradient-to-br from-gray-50 to-blue-50'>
        <div className='max-w-6xl mx-auto '>
          <div className='mb-12 text-center lg:mb-16'>
            <h2 className='mb-4 text-3xl font-bold text-gray-900'>
              Pourquoi utiliser l'extension CVmatchr ?
            </h2>
            <p className='text-lg text-gray-600'>
              Gagnez du temps et augmentez vos chances de succès
            </p>
          </div>

          <div className='grid gap-12 md:grid-cols-3'>
            {features.map((feature, index) => (
              <div key={index} className='text-center'>
                <div className='flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full'>
                  <feature.icon className='w-8 h-8 text-blue-600' />
                </div>
                <h3 className='mb-4 text-xl font-semibold text-gray-900'>
                  {feature.title}
                </h3>
                <p className='leading-relaxed text-gray-600'>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className='px-6 py-12 lg:py-20 bg-gradient-to-r from-gray-50 to-blue-50'>
        <div className='max-w-6xl mx-auto '>
          <div className='mb-8 text-center lg:mb-16'>
            <h2 className='mb-4 text-3xl font-bold text-gray-900 md:text-4xl'>
              Comment utiliser l'extension ?
            </h2>
            <p className='max-w-2xl mx-auto text-xl text-gray-600'>
              4 étapes simples pour optimiser vos candidatures
            </p>
          </div>

          <div className='relative'>
            <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
              {steps.map((step, index) => (
                <div
                  key={index}
                  className='relative z-10 p-6 text-center transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-xl hover:-translate-y-2'
                >
                  <div className='flex items-center justify-center w-16 h-16 mx-auto mb-4 text-white rounded-full shadow-md bg-gradient-to-r from-blue-600 to-blue-700'>
                    <step.icon className='w-8 h-8' />
                  </div>
                  <h3 className='mb-3 text-lg font-semibold text-gray-900'>
                    {step.title}
                  </h3>
                  <p className='text-sm leading-relaxed text-gray-600'>
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Connecting arrows - positioned behind cards */}
            <div className='absolute left-0 right-0 z-0 items-center justify-between hidden px-20 top-1/2 lg:flex'>
              {[...Array(steps.length - 1)].map((_, index) => (
                <div
                  key={index}
                  className='flex items-center justify-center flex-1'
                >
                  <div className='w-24 h-0.5 bg-blue-300'></div>
                  <div className='w-0 h-0 border-t-2 border-b-2 border-l-4 border-l-blue-300 border-t-transparent border-b-transparent'></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='px-6 py-12 lg:py-20 bg-gradient-to-r from-blue-600 to-blue-700'>
        <div className='container max-w-4xl mx-auto text-center'>
          <h2 className='mb-4 text-3xl font-bold text-white'>
            Prêt à optimiser vos candidatures ?
          </h2>
          <p className='mb-8 text-lg text-blue-100'>
            Commencez dès maintenant à optimiser vos candidatures
          </p>

          <div className=''>
            <div className='flex items-center justify-center gap-4'>
              <p className='text-sm font-medium text-blue-200'>
                Disponible sur :
              </p>
              {browsers.map((browser) => (
                <a
                  key={browser.name}
                  href={browser.downloadUrl}
                  className='transition-all hover:scale-110'
                  title={`Installer sur ${browser.name}`}
                >
                  <Image
                    src={browser.image}
                    alt={browser.name}
                    width={32}
                    height={32}
                    className='object-contain'
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
