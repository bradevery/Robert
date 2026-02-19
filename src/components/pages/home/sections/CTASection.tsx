import { Clock, Users } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Button } from '@/components/ui/button';

export default function CTASection() {
  return (
    <section className='py-20 px-6  bg-[#2e67c5] cv-blue-cta-background text-white'>
      <div className='container max-w-4xl mx-auto text-center'>
        {/* Urgency Banner */}
        <div className='inline-flex items-center gap-2 px-4 py-2 mb-6 text-orange-900 bg-orange-100 rounded-full'>
          <Clock className='hidden w-4 h-4 md:block' />
          <span className='text-sm font-semibold'>
            Offre limitée : Optimisation gratuite ce mois-ci
          </span>
        </div>

        <h2 className='mb-6 text-4xl font-bold md:text-5xl'>
          Prêt à transformer votre CV en machine à entretiens ?
        </h2>

        <p className='mb-4 text-xl opacity-90'>
          Ne perdez plus de temps avec un CV qui ne vous ressemble pas.
        </p>

        <div className='flex flex-wrap items-center justify-center gap-4 mb-8'>
          <div className='flex items-center gap-2 text-green-300'>
            <Users className='hidden w-5 h-5 md:block' />
            <span>+150 CV optimisés cette semaine</span>
          </div>
          <div className='hidden w-1 h-6 bg-white/30 md:block'></div>
          <div className='flex items-center gap-2 text-green-300'>
            <Clock className='hidden w-5 h-5 md:block' />
            <span>Résultats en 2 minutes</span>
          </div>
        </div>

        <div className='flex flex-col items-center gap-4 md:justify-center sm:flex-row'>
          <Button
            size='lg'
            className='px-8 py-4 font-bold text-blue-900 transition-all duration-200 bg-white shadow-lg font-bo ld text-md hover:bg-gray-50 hover:scale-105'
            asChild
          >
            <Link href='/login'>Optimiser mon CV GRATUITEMENT</Link>
          </Button>
          <Button
            size='lg'
            variant='outline'
            className='px-8 py-4 text-lg font-bold text-white border-white hover:bg-white hover:text-blue-600'
            asChild
          >
            <Link href='#demo'>Voir un exemple</Link>
          </Button>
        </div>

        <p className='mt-6 text-sm opacity-75'>
          Aucune carte de crédit • Résultats instantanés • Garantie satisfaction
        </p>

        <div className='mt-4 text-xs opacity-60'>
          Offre limitée : Les 100 premiers utilisateurs de ce mois bénéficient
          de l'optimisation gratuite
        </div>
      </div>
    </section>
  );
}
