'use client';

import Link from 'next/link';

import { useOnboarding } from '@/hooks/use-onboarding';

import Logo from '@/components/common/Logo';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentStep, totalSteps, progress, steps } = useOnboarding();

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'>
      {/* Header */}
      <header className='sticky top-0 z-10 px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm'>
        <div className='flex items-center justify-between max-w-3xl mx-auto'>
          <Link href='/'>
            <Logo size='md' />
          </Link>

          {/* Progress Indicator */}
          <div className='flex items-center gap-2'>
            <span className='text-sm text-gray-500'>
              Étape {currentStep} sur {totalSteps}
            </span>
            <div className='flex gap-1'>
              {steps.map((step) => (
                <div
                  key={step.step}
                  className={`w-8 h-1.5 rounded-full transition-colors ${
                    step.step <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className='h-1 bg-gray-100'>
        <div
          className='h-full transition-all duration-500 bg-blue-600'
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <main className='flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12'>
        <div className='w-full max-w-xl'>{children}</div>
      </main>
    </div>
  );
}
