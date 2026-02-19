import React from 'react';

export default function IntegrationsPage() {
  return (
    <div className='container mx-auto p-6 space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Intégrations</h1>
        <p className='text-muted-foreground'>
          Connectez vos outils préférés (ATS, CRM, Calendriers).
        </p>
      </div>
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-6'>
          <h3 className='font-semibold'>Google Calendar</h3>
          <p className='text-sm text-muted-foreground mt-2'>
            Synchronisez vos entretiens.
          </p>
          <div className='mt-4 text-sm font-medium text-primary'>À venir</div>
        </div>
        <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-6'>
          <h3 className='font-semibold'>LinkedIn</h3>
          <p className='text-sm text-muted-foreground mt-2'>
            Importez des profils en un clic.
          </p>
          <div className='mt-4 text-sm font-medium text-primary'>À venir</div>
        </div>
      </div>
    </div>
  );
}
