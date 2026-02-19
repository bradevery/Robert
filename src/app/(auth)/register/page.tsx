'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { useAuth } from '@/hooks/useAuth';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, 'Le prénom doit contenir au moins 2 caractères'),
    lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().email('Email invalide'),
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre'
      ),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'Vous devez accepter les conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const { register: registerMutation } = useAuth();
  const isLoading = registerMutation.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerMutation.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });

      toast.success('Compte créé ! Vérifiez votre email.');
      router.push('/login?registered=true');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Une erreur est survenue'
      );
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'linkedin') => {
    setSocialLoading(provider);
    try {
      await signIn(provider, { callbackUrl: '/onboarding/welcome' });
    } catch {
      toast.error('Erreur lors de la connexion');
      setSocialLoading(null);
    }
  };

  return (
    <>
      <div className='mb-8 text-center'>
        <h1 className='mb-2 text-3xl font-bold text-gray-900'>
          Créer un compte
        </h1>
        <p className='text-gray-600'>
          Commencez à créer vos dossiers de compétences
        </p>
      </div>

      <Card className='border-gray-100 shadow-xl'>
        <CardContent className='p-8'>
          {/* Social Register */}
          <div className='mb-6 space-y-3'>
            <Button
              type='button'
              variant='outline'
              className='w-full h-12 gap-3 text-gray-700 border-2 border-gray-200 rounded-xl hover:bg-gray-50'
              onClick={() => handleSocialLogin('google')}
              disabled={!!socialLoading}
            >
              {socialLoading === 'google' ? (
                <Loader2 className='w-5 h-5 animate-spin' />
              ) : (
                <svg className='w-5 h-5' viewBox='0 0 24 24'>
                  <path
                    fill='#4285F4'
                    d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                  />
                  <path
                    fill='#34A853'
                    d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                  />
                  <path
                    fill='#FBBC05'
                    d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                  />
                  <path
                    fill='#EA4335'
                    d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                  />
                </svg>
              )}
              S'inscrire avec Google
            </Button>

            <Button
              type='button'
              className='w-full h-12 gap-3 text-white bg-[#0077B5] hover:bg-[#005885] rounded-xl'
              onClick={() => handleSocialLogin('linkedin')}
              disabled={!!socialLoading}
            >
              {socialLoading === 'linkedin' ? (
                <Loader2 className='w-5 h-5 animate-spin' />
              ) : (
                <svg
                  className='w-5 h-5'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
                </svg>
              )}
              S'inscrire avec LinkedIn
            </Button>
          </div>

          {/* Divider */}
          <div className='relative mb-6'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-200' />
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-4 text-gray-500 bg-white'>ou par email</span>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block mb-2 text-sm font-medium text-gray-700'>
                  Prénom
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
                  Nom
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
                Email professionnel
              </label>
              <Input
                type='email'
                placeholder='vous@entreprise.com'
                className='h-12 rounded-xl'
                {...register('email')}
              />
              {errors.email && (
                <p className='mt-1 text-sm text-red-500'>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className='block mb-2 text-sm font-medium text-gray-700'>
                Mot de passe
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

            {/* Terms Checkbox */}
            <div className='flex items-start gap-3'>
              <input
                type='checkbox'
                id='acceptTerms'
                className='w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                {...register('acceptTerms')}
              />
              <label htmlFor='acceptTerms' className='text-sm text-gray-600'>
                J'accepte les{' '}
                <Link href='/terms' className='text-blue-600 hover:underline'>
                  conditions d'utilisation
                </Link>{' '}
                et la{' '}
                <Link href='/privacy' className='text-blue-600 hover:underline'>
                  politique de confidentialité
                </Link>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className='text-sm text-red-500'>
                {errors.acceptTerms.message}
              </p>
            )}

            <Button
              type='submit'
              className='w-full h-12 text-white bg-blue-600 hover:bg-blue-700 rounded-xl'
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className='w-5 h-5 animate-spin' />
              ) : (
                'Créer mon compte'
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className='mt-6 text-center'>
            <p className='text-gray-600'>
              Déjà un compte ?{' '}
              <Link
                href='/login'
                className='font-semibold text-blue-600 hover:text-blue-700'
              >
                Se connecter
              </Link>
            </p>
          </div>
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
