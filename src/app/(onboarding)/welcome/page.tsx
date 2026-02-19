'use client';

import { FileText, Sparkles, Target, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

import { useOnboarding, useOnboardingStore } from '@/hooks/use-onboarding';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const BENEFITS = [
  {
    icon: FileText,
    title: 'Dossiers de compétences',
    description: 'Créez des DC professionnels en quelques minutes',
    color: 'text-blue-600 bg-blue-100',
  },
  {
    icon: Users,
    title: 'CVthèque centralisée',
    description: 'Gérez tous vos candidats en un seul endroit',
    color: 'text-green-600 bg-green-100',
  },
  {
    icon: Target,
    title: 'Matching IA',
    description: 'Trouvez les meilleurs profils pour vos missions',
    color: 'text-purple-600 bg-purple-100',
  },
];

export default function WelcomePage() {
  const { data: session } = useSession();
  const { nextStep } = useOnboarding();
  const { setStep } = useOnboardingStore();

  // Set step on mount
  useEffect(() => {
    setStep(1);
  }, [setStep]);

  const firstName = session?.user?.name?.split(' ')[0] ?? 'vous';

  return (
    <div className='text-center'>
      {/* Welcome Message */}
      <div className='mb-8'>
        <div className='flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full'>
          <Sparkles className='w-8 h-8 text-blue-600' />
        </div>
        <h1 className='mb-2 text-3xl font-bold text-gray-900'>
          Bienvenue, {firstName} !
        </h1>
        <p className='text-lg text-gray-600'>
          Vous êtes à quelques étapes de transformer votre façon de créer des
          dossiers de compétences.
        </p>
      </div>

      {/* Benefits */}
      <Card className='mb-8 border-gray-100 shadow-xl'>
        <CardContent className='p-6'>
          <div className='space-y-4'>
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className='flex items-start gap-4 p-4 text-left transition-colors rounded-xl hover:bg-gray-50'
              >
                <div className={`p-3 rounded-xl ${benefit.color}`}>
                  <benefit.icon className='w-6 h-6' />
                </div>
                <div>
                  <h3 className='font-semibold text-gray-900'>
                    {benefit.title}
                  </h3>
                  <p className='text-sm text-gray-600'>{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Button
        size='lg'
        className='w-full h-14 text-lg text-white bg-blue-600 hover:bg-blue-700 rounded-xl'
        onClick={nextStep}
      >
        Commencer la configuration
      </Button>

      <p className='mt-4 text-sm text-gray-500'>
        Cette configuration ne prendra que 2 minutes
      </p>
    </div>
  );
}
