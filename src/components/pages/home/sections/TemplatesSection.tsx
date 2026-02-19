'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { useCarousel } from '@/hooks/useCarousel';

export default function TemplatesSection() {
  const { scrollCarousel } = useCarousel();

  const templates = [
    {
      id: 'modern',
      title: 'Modern',
      description: 'Design épuré et professionnel',
      badge: { text: 'Populaire', className: 'text-blue-800 bg-blue-100' },
      hoverColor: 'bg-blue-600',
      bgGradient: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100',
      blueEffect: 'shadow-blue-200/50 ring-1 ring-blue-100/50',
    },
    {
      id: 'classic',
      title: 'Classic',
      description: 'Traditionnel et intemporel',
      hoverColor: 'bg-gray-600',
      bgGradient: 'bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50',
      blueEffect: 'shadow-slate-200/50 ring-1 ring-blue-100/30',
    },
    {
      id: 'creative',
      title: 'Creative',
      description: 'Pour les profils créatifs',
      badge: { text: 'Nouveau', className: 'text-purple-800 bg-purple-100' },
      hoverColor: 'bg-purple-600',
      bgGradient: 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50',
      blueEffect: 'shadow-purple-200/50 ring-1 ring-blue-100/40',
    },
    {
      id: 'minimal',
      title: 'Minimal',
      description: 'Simple et efficace',
      hoverColor: 'bg-green-600',
      bgGradient: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50',
      blueEffect: 'shadow-emerald-200/50 ring-1 ring-blue-100/40',
    },
    {
      id: 'executive',
      title: 'Executive',
      description: 'Pour les postes de direction',
      badge: { text: 'Premium', className: 'text-slate-800 bg-slate-100' },
      hoverColor: 'bg-slate-600',
      bgGradient: 'bg-gradient-to-br from-amber-50 via-orange-50 to-blue-50',
      blueEffect: 'shadow-amber-200/50 ring-1 ring-blue-100/40',
    },
  ];

  return (
    <section className='py-12 overflow-hidden lg:py-20'>
      <div className='mb-8 text-center wrapper lg:mb-16'>
        <h2 className='mb-4 text-3xl font-bold text-gray-900 md:text-4xl'>
          Choisissez votre modèle
        </h2>
        <p className='max-w-2xl text-xl text-gray-600 lg:mx-auto'>
          Votre CV optimisé par l'IA sera généré dans le design professionnel
          que vous sélectionnez
        </p>
      </div>

      <div className='relative'>
        {/* Carousel Navigation */}
        <div className='absolute z-10 hidden transform -translate-y-1/2 left-4 top-1/2 md:block'>
          <button
            onClick={() => scrollCarousel('left', 'templates-carousel')}
            className='flex items-center justify-center w-12 h-12 transition-colors bg-white border border-gray-200 rounded-full shadow-lg hover:bg-gray-50'
          >
            <ChevronLeft className='w-6 h-6 text-gray-600' />
          </button>
        </div>
        <div className='absolute z-10 hidden transform -translate-y-1/2 right-4 top-1/2 md:block'>
          <button
            onClick={() => scrollCarousel('right', 'templates-carousel')}
            className='flex items-center justify-center w-12 h-12 transition-colors bg-white border border-gray-200 rounded-full shadow-lg hover:bg-gray-50'
          >
            <ChevronRight className='w-6 h-6 text-gray-600' />
          </button>
        </div>

        {/* Mobile scroll indicator */}
        <div className='mx-5 mb-4 text-center md:hidden'>
          <p className='text-sm text-gray-500'>
            Faites défiler horizontalement pour voir plus de modèles →
          </p>
        </div>

        {/* Carousel Container */}
        <div
          id='templates-carousel'
          className='flex gap-8 px-6 py-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory'
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {templates.map((template) => (
            <div
              key={template.id}
              className='relative flex-shrink-0 transition-all duration-300 transform cursor-pointer group hover:scale-105 snap-center'
            >
              <div
                className={`relative w-80 overflow-hidden transition-all duration-300 ${template.bgGradient} border border-gray-200 shadow-lg ${template.blueEffect} h-[450px] rounded-xl group-hover:shadow-xl group-hover:${template.blueEffect} group-hover:shadow-2xl`}
              >
                <div className='absolute inset-0 transition-opacity duration-300 bg-blue-500/5 opacity-40 group-hover:opacity-60 rounded-xl'></div>

                <Image
                  src='/images/cv1.png'
                  alt={`Template ${template.title}`}
                  fill
                  className='relative z-10 object-contain object-center p-4 transition-transform duration-300 group-hover:scale-105'
                  sizes='320px'
                />

                {template.badge && (
                  <div className='absolute z-20 top-4 right-4'>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${template.badge.className} shadow-sm`}
                    >
                      {template.badge.text}
                    </span>
                  </div>
                )}

                <div
                  className={`absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center transition-all duration-300 opacity-0 ${template.bgGradient} group-hover:opacity-100`}
                >
                  <h3 className='mb-2 text-xl font-bold text-gray-900'>
                    {template.title}
                  </h3>
                  <p className='mb-4 text-sm text-gray-600'>
                    {template.description}
                  </p>
                  <Link href='/login'>
                    <button className='px-6 py-2 text-sm font-medium text-white transition-colors duration-200 bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700'>
                      Sélectionner ce design
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
