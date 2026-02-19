'use client';

import { ArrowLeft, Home, Search } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page non trouvée',
};

export default function NotFound() {
  return (
    <main className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'>
      <div className='relative cv-shadow-background-repeat bg-gradient-to-br from-blue-50/80 via-white/90 to-purple-50/80 backdrop-blur-sm'>
        <section className='flex min-h-screen flex-col items-center justify-center px-6 text-center'>
          <div className='max-w-2xl mx-auto'>
            {/* 404 Illustration */}
            <div className='mb-8'>
              <div className='relative'>
                <div className='text-8xl md:text-9xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text opacity-20'>
                  404
                </div>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='w-24 h-24 md:w-32 md:h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg'>
                    <Search className='w-12 h-12 md:w-16 md:h-16 text-white' />
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className='space-y-6'>
              <h1 className='text-3xl md:text-5xl font-bold text-gray-900'>
                Page non trouvée
              </h1>
              <p className='text-lg md:text-xl text-gray-600 max-w-md mx-auto'>
                Désolé, la page que vous recherchez n'existe pas ou a été
                déplacée.
              </p>
            </div>

            {/* Actions */}
            <div className='mt-10 flex flex-col sm:flex-row gap-4 justify-center'>
              <Link
                href='/'
                className='inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg'
              >
                <Home className='w-5 h-5 mr-2' />
                Retour à l'accueil
              </Link>
              <button
                onClick={() => window.history.back()}
                className='inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-lg'
              >
                <ArrowLeft className='w-5 h-5 mr-2' />
                Page précédente
              </button>
            </div>

            {/* Additional Help */}
            <div className='mt-12 p-6 bg-white/60 backdrop-blur-sm border border-white/20 rounded-lg shadow-sm'>
              <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                Besoin d'aide ?
              </h3>
              <p className='text-gray-600 mb-4'>
                Explorez nos fonctionnalités principales ou contactez notre
                support.
              </p>
              <div className='flex flex-wrap gap-2 justify-center'>
                <Link
                  href='/templates'
                  className='text-blue-600 hover:text-blue-700 font-medium text-sm'
                >
                  Modèles CV
                </Link>
                <span className='text-gray-300'>•</span>
                <Link
                  href='/features'
                  className='text-blue-600 hover:text-blue-700 font-medium text-sm'
                >
                  Fonctionnalités
                </Link>
                <span className='text-gray-300'>•</span>
                <Link
                  href='/contact'
                  className='text-blue-600 hover:text-blue-700 font-medium text-sm'
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
