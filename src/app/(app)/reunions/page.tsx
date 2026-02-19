import { Calendar } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';

export default function ReunionsPage() {
  return (
    <div className='container mx-auto p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Réunions</h1>
          <p className='text-muted-foreground'>
            Planifiez et gérez vos entretiens candidats.
          </p>
        </div>
        <Button>
          <Calendar className='mr-2 h-4 w-4' />
          Planifier
        </Button>
      </div>
      <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-12 flex flex-col items-center justify-center text-center space-y-4'>
        <p className='text-muted-foreground'>
          Le module de gestion des réunions est en cours de développement.
        </p>
      </div>
    </div>
  );
}
