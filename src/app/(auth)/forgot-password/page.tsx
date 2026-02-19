'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { useAuth } from '@/hooks/useAuth';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { forgotPassword: forgotMutation } = useAuth();
  const isLoading = forgotMutation.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotMutation.mutateAsync(data.email);
      setIsEmailSent(true);
      toast.success('Email envoyé !');
    } catch {
      toast.error('Une erreur est survenue');
    }
  };

  if (isEmailSent) {
    return (
      <>
        <div className='mb-8 text-center'>
          <div className='flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full'>
            <Mail className='w-8 h-8 text-green-600' />
          </div>
          <h1 className='mb-2 text-3xl font-bold text-gray-900'>
            Email envoyé
          </h1>
          <p className='text-gray-600'>
            Si un compte existe avec l'adresse{' '}
            <span className='font-medium'>{getValues('email')}</span>, vous
            recevrez un lien de réinitialisation.
          </p>
        </div>

        <Card className='border-gray-100 shadow-xl'>
          <CardContent className='p-8 text-center'>
            <p className='mb-6 text-gray-600'>
              Vérifiez votre boîte de réception et vos spams. Le lien expire
              dans 1 heure.
            </p>

            <div className='space-y-3'>
              <Button
                variant='outline'
                className='w-full h-12 rounded-xl'
                onClick={() => setIsEmailSent(false)}
              >
                Renvoyer l'email
              </Button>

              <Link href='/login'>
                <Button className='w-full h-12 text-white bg-blue-600 hover:bg-blue-700 rounded-xl'>
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <div className='mb-8 text-center'>
        <h1 className='mb-2 text-3xl font-bold text-gray-900'>
          Mot de passe oublié
        </h1>
        <p className='text-gray-600'>
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
      </div>

      <Card className='border-gray-100 shadow-xl'>
        <CardContent className='p-8'>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div>
              <label className='block mb-2 text-sm font-medium text-gray-700'>
                Email
              </label>
              <Input
                type='email'
                placeholder='vous@exemple.com'
                className='h-12 rounded-xl'
                {...register('email')}
              />
              {errors.email && (
                <p className='mt-1 text-sm text-red-500'>
                  {errors.email.message}
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
                'Envoyer le lien'
              )}
            </Button>
          </form>

          <div className='mt-6 text-center'>
            <Link
              href='/login'
              className='text-sm text-gray-600 hover:text-gray-900'
            >
              Retour à la connexion
            </Link>
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
