'use client';

export const dynamic = 'force-dynamic';

import { ArrowLeft, CheckCircle, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type VerificationStatus = 'loading' | 'success' | 'error' | 'expired';

function VerifyEmailPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<VerificationStatus>('loading');
  const { verifyEmail: verifyMutation } = useAuth();

  useEffect(() => {
    const doVerify = async () => {
      if (!token) {
        setStatus('error');
        return;
      }

      try {
        await verifyMutation.mutateAsync(token);
        setStatus('success');
      } catch (error: any) {
        if (error.message === 'Token expired') {
          setStatus('expired');
        } else {
          setStatus('error');
        }
      }
    };

    doVerify();
  }, [token, verifyMutation]);

  if (status === 'loading') {
    return (
      <div className='text-center'>
        <Loader2 className='w-8 h-8 mx-auto text-blue-600 animate-spin' />
        <p className='mt-4 text-gray-600'>Vérification en cours...</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <>
        <div className='mb-8 text-center'>
          <div className='flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full'>
            <CheckCircle className='w-8 h-8 text-green-600' />
          </div>
          <h1 className='mb-2 text-3xl font-bold text-gray-900'>
            Email vérifié
          </h1>
          <p className='text-gray-600'>
            Votre adresse email a été vérifiée avec succès. Vous pouvez
            maintenant vous connecter.
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

  if (status === 'expired') {
    return (
      <>
        <div className='mb-8 text-center'>
          <div className='flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full'>
            <XCircle className='w-8 h-8 text-orange-600' />
          </div>
          <h1 className='mb-2 text-3xl font-bold text-gray-900'>Lien expiré</h1>
          <p className='text-gray-600'>
            Le lien de vérification a expiré. Veuillez demander un nouveau lien.
          </p>
        </div>

        <Card className='border-gray-100 shadow-xl'>
          <CardContent className='p-8 text-center'>
            <p className='mb-6 text-gray-600'>
              Connectez-vous pour recevoir un nouveau lien de vérification.
            </p>
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
        <div className='flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full'>
          <XCircle className='w-8 h-8 text-red-600' />
        </div>
        <h1 className='mb-2 text-3xl font-bold text-gray-900'>
          Vérification échouée
        </h1>
        <p className='text-gray-600'>
          Une erreur est survenue lors de la vérification de votre email.
        </p>
      </div>

      <Card className='border-gray-100 shadow-xl'>
        <CardContent className='p-8 text-center'>
          <p className='mb-6 text-gray-600'>
            Le lien peut être invalide ou avoir déjà été utilisé.
          </p>
          <div className='space-y-3'>
            <Link href='/login'>
              <Button className='w-full h-12 text-white bg-blue-600 hover:bg-blue-700 rounded-xl'>
                Se connecter
              </Button>
            </Link>
            <Link href='/register'>
              <Button variant='outline' className='w-full h-12 rounded-xl'>
                Créer un nouveau compte
              </Button>
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}
