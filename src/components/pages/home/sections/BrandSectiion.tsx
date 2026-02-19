import React from 'react';

export default function BrandSectiion() {
  return (
    <section className='px-6 pt-12 pb-6'>
      <div className='max-w-6xl mx-auto '>
        <div className='mb-8 text-center'>
          <p className='mb-6 text-sm font-medium tracking-wide text-gray-500 uppercase'>
            Nos utilisateurs travaillent dans les meilleures entreprises
          </p>
          <div className='flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60'>
            <div className='flex items-center justify-center pt-2'>
              <span className='text-2xl font-bold text-gray-400'>LVMH</span>
            </div>
            <div className='flex items-center justify-center'>
              <span className='text-2xl font-bold text-gray-400'>L'Oréal</span>
            </div>
            <div className='flex items-center justify-center'>
              <span className='text-2xl font-bold text-gray-400'>Total</span>
            </div>
            <div className='flex items-center justify-center'>
              <span className='text-2xl font-bold text-gray-400'>Airbus</span>
            </div>
            <div className='flex items-center justify-center'>
              <span className='text-2xl font-bold text-gray-400'>Danone</span>
            </div>
            <div className='flex items-center justify-center'>
              <span className='text-2xl font-bold text-gray-400'>Orange</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
