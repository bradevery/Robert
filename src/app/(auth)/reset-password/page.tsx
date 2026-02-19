'use client';

export const dynamic = 'force-dynamic';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { useAuth } from '@/hooks/useAuth';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { useValidateResetToken, resetPassword: resetMutation } = useAuth();
  const { data: isTokenValid, isLoading: isValidating } = useValidateResetToken(token);
  const isLoading = resetMutation.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    try {
      await resetMutation.mutateAsync({
        token,
        password: data.password,
      });

      setIsSuccess(true);
      toast.success('Mot de passe réinitialisé !');
    } catch {
      toast.error('Une erreur est survenue');
    }
  };

  // Loading state
  if (isValidating) {
    return (
      <div className='text-center'>
        <Loader2 className='w-8 h-8 mx-auto text-blue-600 animate-spin' />
        <p className='mt-4 text-gray-600'>Vérification du lien...</p>
      </div>
    );
  }

  // Invalid token state
  if (!token || !isTokenValid) {
    return (
      <>
        <div className='mb-8 text-center'>
          <div className='flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full'>
            <XCircle className='w-8 h-8 text-red-600' />
          </div>
          <h1 className='mb-2 text-3xl font-bold text-gray-900'>
            Lien invalide
          </h1>
          <p className='text-gray-600'>
            Ce lien de réinitialisation est invalide ou a expiré.
          </p>
        </div>

        <Card className='border-gray-100 shadow-xl'>
          <CardContent className='p-8 text-center'>
            <Link href='/forgot-password'>
              <Button className='w-full h-12 text-white bg-blue-600 hover:bg-blue-700 rounded-xl'>
                Demander un nouveau lien
              </Button>
            </Link>
          </CardContent>
        </Card>
      </>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <>
        <div className='mb-8 text-center'>
          <div className='flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full'>
            <CheckCircle className='w-8 h-8 text-green-600' />
          </div>
          <h1 className='mb-2 text-3xl font-bold text-gray-900'>
            Mot de passe réinitialisé
          </h1>
          <p className='text-gray-600'>
            Votre mot de passe a été modifié avec succès.
          </p>
        </div>

        <Card className='border-gray-100 shadow-xl'>
          <CardContent className='p-8 text-center'>
            <Link href='/login'>
              <Button className='w-full h-12 text-white bg-blue-600 hover:bg-blue-700 rounded-xl'>
                Se connecter
              </Button>
            </Link>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <div className='mb-8 text-center'>
        <h1 className='mb-2 text-3xl font-bold text-gray-900'>
          Nouveau mot de passe
        </h1>
        <p className='text-gray-600'>
          Choisissez un nouveau mot de passe sécurisé
        </p>
      </div>

      <Card className='border-gray-100 shadow-xl'>
        <CardContent className='p-8'>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div>
              <label className='block mb-2 text-sm font-medium text-gray-700'>
                Nouveau mot de passe
              </label>
              <div className='relative'>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder='8 caractères minimum'
                  className='h-12 pr-10 rounded-xl'
                  {...register('password')}
                />
                <button
                  type='button'
                  className='absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-gray-600'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className='w-5 h-5' />
                  ) : (
                    <Eye className='w-5 h-5' />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className='mt-1 text-sm text-red-500'>
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className='block mb-2 text-sm font-medium text-gray-700'>
                Confirmer le mot de passe
              </label>
              <Input
                type='password'
                placeholder='Confirmez votre mot de passe'
                className='h-12 rounded-xl'
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className='mt-1 text-sm text-red-500'>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type='submit'
              className='w-full h-12 text-white bg-blue-600 hover:bg-blue-700 rounded-xl'
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className='w-5 h-5 animate-spin' />
              ) : (
                'Réinitialiser le mot de passe'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Back to home */}
      <div className='mt-8 text-center'>
        <Link
          href='/'
          className='inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700'
        >
          <ArrowLeft className='w-4 h-4' />
          Retour à l'accueil
        </Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
