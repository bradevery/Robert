import React from 'react';

export default function ActivitePage() {
  return (
    <div className='container mx-auto p-6 space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Fil d'activité</h1>
        <p className='text-muted-foreground'>
          Suivez les dernières actions de votre équipe.
        </p>
      </div>
      <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-12 flex flex-col items-center justify-center text-center space-y-4'>
        <p className='text-muted-foreground'>
          Le fil d'activité sera bientôt disponible.
        </p>
      </div>
    </div>
  );
}
