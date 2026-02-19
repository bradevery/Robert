'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { useOnboarding, useOnboardingStore } from '@/hooks/use-onboarding';
import { useSettings } from '@/hooks/useSettings';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const ROLES = [
  { value: 'manager', label: 'Responsable recrutement' },
  { value: 'recruiter', label: 'Chargé de recrutement' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'director', label: 'Dirigeant' },
  { value: 'other', label: 'Autre' },
];

const profileSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  role: z.string().min(1, 'Fonction requise'),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { nextStep, prevStep, data } = useOnboarding();
  const { setStep, setProfileData } = useOnboardingStore();
  const { updateProfile } = useSettings();
  const isLoading = updateProfile.isPending;

  // Set step on mount
  useEffect(() => {
    setStep(2);
  }, [setStep]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: data.profile?.firstName ?? '',
      lastName: data.profile?.lastName ?? '',
      role: data.profile?.role ?? '',
      phone: data.profile?.phone ?? '',
    },
  });

  const onSubmit = async (formData: ProfileFormData) => {
    try {
      // Save to store
      setProfileData(formData);

      // Save to API
      await updateProfile.mutateAsync({
        name: `${formData.firstName} ${formData.lastName}`,
        ...formData,
      });

      nextStep();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  return (
    <div>
      <div className='mb-8 text-center'>
        <h1 className='mb-2 text-3xl font-bold text-gray-900'>Votre profil</h1>
        <p className='text-gray-600'>
          Quelques informations pour personnaliser votre expérience
        </p>
      </div>

      <Card className='border-gray-100 shadow-xl'>
        <CardContent className='p-8'>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block mb-2 text-sm font-medium text-gray-700'>
                  Prénom *
                </label>
                <Input
                  placeholder='Jean'
                  className='h-12 rounded-xl'
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <p className='mt-1 text-sm text-red-500'>
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-gray-700'>
                  Nom *
                </label>
                <Input
                  placeholder='Dupont'
                  className='h-12 rounded-xl'
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p className='mt-1 text-sm text-red-500'>
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className='block mb-2 text-sm font-medium text-gray-700'>
                Fonction *
              </label>
              <select
                className='w-full h-12 px-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                {...register('role')}
              >
                <option value=''>Sélectionnez votre fonction</option>
                {ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className='mt-1 text-sm text-red-500'>
                  {errors.role.message}
                </p>
              )}
            </div>

            <div>
              <label className='block mb-2 text-sm font-medium text-gray-700'>
                Téléphone
              </label>
              <Input
                type='tel'
                placeholder='+33 6 12 34 56 78'
                className='h-12 rounded-xl'
                {...register('phone')}
              />
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
                    Continuer
                    <ArrowRight className='w-4 h-4' />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
