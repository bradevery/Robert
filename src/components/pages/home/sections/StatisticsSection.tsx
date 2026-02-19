import React from 'react';

export default function StatisticsSection() {
  return (
    <section className='px-6 py-16 text-white bg-transparent cv-shadow-background'>
      <div className='max-w-6xl mx-auto '>
        <div className='grid grid-cols-1 gap-8 text-center md:grid-cols-4'>
          <div className='flex flex-col items-center'>
            <div className='mb-2 text-4xl font-bold md:text-5xl'>10K+</div>
            <p className='text-lg opacity-90'>CV créés</p>
          </div>
          <div className='flex flex-col items-center'>
            <div className='mb-2 text-4xl font-bold md:text-5xl'>95%</div>
            <p className='text-lg opacity-90'>Taux de réussite ATS</p>
          </div>
          <div className='flex flex-col items-center'>
            <div className='mb-2 text-4xl font-bold md:text-5xl'>1600+</div>
            <p className='text-lg opacity-90'>Candidats Satisfaits</p>
          </div>
          <div className='flex flex-col items-center'>
            <div className='mb-2 text-4xl font-bold md:text-5xl'>4.9/5</div>
            <p className='text-lg opacity-90'>Note moyenne utilisateurs</p>
          </div>
        </div>
      </div>
    </section>
  );
}
