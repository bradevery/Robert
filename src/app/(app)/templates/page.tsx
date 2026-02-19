import { Plus } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';

export default function TemplatesPage() {
  return (
    <div className='container mx-auto p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Templates</h1>
          <p className='text-muted-foreground'>
            Gérez vos modèles de dossiers de compétences.
          </p>
        </div>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Nouveau Template
        </Button>
      </div>

      <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-12 flex flex-col items-center justify-center text-center space-y-4'>
        <div className='h-12 w-12 rounded-full bg-muted flex items-center justify-center'>
          <span className='text-2xl'>📄</span>
        </div>
        <h3 className='text-lg font-semibold'>Aucun template pour le moment</h3>
        <p className='text-muted-foreground max-w-sm'>
          Commencez par créer votre premier template pour standardiser vos
          dossiers de compétences.
        </p>
      </div>
    </div>
  );
}
