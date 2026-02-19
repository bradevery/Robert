'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Building2, Loader2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { useOnboarding, useOnboardingStore } from '@/hooks/use-onboarding';
import { useOnboardingApi } from '@/hooks/useOnboardingApi';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const SECTORS = [
  { value: 'esn', label: 'ESN / SSII' },
  { value: 'cabinet', label: 'Cabinet de recrutement' },
  { value: 'enterprise', label: 'Entreprise' },
  { value: 'startup', label: 'Startup' },
  { value: 'other', label: 'Autre' },
];

const SIZES = [
  { value: '1-10', label: '1-10 employés' },
  { value: '11-50', label: '11-50 employés' },
  { value: '51-200', label: '51-200 employés' },
  { value: '200+', label: '200+ employés' },
];

const organizationSchema = z.object({
  name: z.string().min(2, "Nom de l'entreprise requis"),
  sector: z.string().optional(),
  size: z.string().optional(),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

export default function OrganizationPage() {
  const { nextStep, prevStep, data } = useOnboarding();
  const { setStep, setOrganizationData } = useOnboardingStore();
  const { createOrganization, joinOrganization } = useOnboardingApi();
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [inviteCode, setInviteCode] = useState('');

  const isLoading = createOrganization.isPending || joinOrganization.isPending;

  // Set step on mount
  useEffect(() => {
    setStep(3);
  }, [setStep]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: data.organization?.name ?? '',
      sector: data.organization?.sector ?? '',
      size: data.organization?.size ?? '',
    },
  });

  const onSubmit = async (formData: OrganizationFormData) => {
    try {
      // Generate slug from name
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Save to store
      setOrganizationData({ ...formData, slug });

      // Create organization
      await createOrganization.mutateAsync({ ...formData, slug });

      nextStep();
    } catch {
      toast.error('Erreur lors de la création');
    }
  };

  const handleJoinOrg = async () => {
    if (!inviteCode.trim()) {
      toast.error("Entrez un code d'invitation");
      return;
    }

    try {
      await joinOrganization.mutateAsync(inviteCode);
      toast.success("Vous avez rejoint l'organisation !");
      nextStep();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Code d'invitation invalide");
    }
  };

  return (
    <div>
      <div className='mb-8 text-center'>
        <h1 className='mb-2 text-3xl font-bold text-gray-900'>
          Votre organisation
        </h1>
        <p className='text-gray-600'>
          Créez ou rejoignez une organisation pour collaborer
        </p>
      </div>

      {/* Mode Toggle */}
      <div className='flex gap-2 p-1 mb-6 bg-gray-100 rounded-xl'>
        <button
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            mode === 'create'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setMode('create')}
        >
          <Building2 className='w-4 h-4' />
          Créer
        </button>
        <button
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            mode === 'join'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setMode('join')}
        >
          <Users className='w-4 h-4' />
          Rejoindre
        </button>
      </div>

      <Card className='border-gray-100 shadow-xl'>
        <CardContent className='p-8'>
          {mode === 'create' ? (
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
              <div>
                <label className='block mb-2 text-sm font-medium text-gray-700'>
                  Nom de l'entreprise *
                </label>
                <Input
                  placeholder='Ma Société'
                  className='h-12 rounded-xl'
                  {...register('name')}
                />
                {errors.name && (
                  <p className='mt-1 text-sm text-red-500'>
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-gray-700'>
                  Secteur d'activité
                </label>
                <select
                  className='w-full h-12 px-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                  {...register('sector')}
                >
                  <option value=''>Sélectionnez un secteur</option>
                  {SECTORS.map((sector) => (
                    <option key={sector.value} value={sector.value}>
                      {sector.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-gray-700'>
                  Taille de l'entreprise
                </label>
                <select
                  className='w-full h-12 px-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                  {...register('size')}
                >
                  <option value=''>Sélectionnez une taille</option>
                  {SIZES.map((size) => (
                    <option key={size.value} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Navigation */}
              <div className='flex justify-between pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  className='gap-2 rounded-xl'
                  onClick={prevStep}
                >
                  <ArrowLeft className='w-4 h-4' />
                  Retour
                </Button>

                <Button
                  type='submit'
                  className='gap-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl'
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : (
                    <>
                      Créer l'organisation
                      <ArrowRight className='w-4 h-4' />
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className='space-y-6'>
              <div>
                <label className='block mb-2 text-sm font-medium text-gray-700'>
                  Code d'invitation
                </label>
                <Input
                  placeholder="Entrez le code d'invitation"
                  className='h-12 rounded-xl'
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                />
                <p className='mt-2 text-sm text-gray-500'>
                  Demandez le code d'invitation à l'administrateur de
                  l'organisation
                </p>
              </div>

              {/* Navigation */}
              <div className='flex justify-between pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  className='gap-2 rounded-xl'
                  onClick={prevStep}
                >
                  <ArrowLeft className='w-4 h-4' />
                  Retour
                </Button>

                <Button
                  className='gap-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl'
                  onClick={handleJoinOrg}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : (
                    <>
                      Rejoindre
                      <ArrowRight className='w-4 h-4' />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
