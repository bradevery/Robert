'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { create } from 'zustand';

import { useOnboardingApi } from './useOnboardingApi';

interface OnboardingStore {
  currentStep: number;
  setStep: (step: number) => void;
  data: {
    profile?: {
      firstName?: string;
      lastName?: string;
      role?: string;
      phone?: string;
      avatar?: string;
    };
    organization?: {
      name?: string;
      slug?: string;
      sector?: string;
      size?: string;
      logo?: string;
    };
    invitations?: Array<{
      email: string;
      role: string;
    }>;
  };
  setProfileData: (data: OnboardingStore['data']['profile']) => void;
  setOrganizationData: (data: OnboardingStore['data']['organization']) => void;
  setInvitations: (data: OnboardingStore['data']['invitations']) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  currentStep: 1,
  data: {},
  setStep: (step) => set({ currentStep: step }),
  setProfileData: (profile) =>
    set((state) => ({ data: { ...state.data, profile } })),
  setOrganizationData: (organization) =>
    set((state) => ({ data: { ...state.data, organization } })),
  setInvitations: (invitations) =>
    set((state) => ({ data: { ...state.data, invitations } })),
  reset: () => set({ currentStep: 1, data: {} }),
}));

const ONBOARDING_STEPS = [
  { step: 1, path: '/onboarding/welcome', name: 'Bienvenue' },
  { step: 2, path: '/onboarding/profile', name: 'Profil' },
  { step: 3, path: '/onboarding/organization', name: 'Organisation' },
  { step: 4, path: '/onboarding/invite-team', name: 'Équipe' },
  { step: 5, path: '/onboarding/first-dc', name: 'Premier DC' },
] as const;

export function useOnboarding() {
  const router = useRouter();
  const { currentStep, setStep, data, reset } = useOnboardingStore();
  const { updateProgress } = useOnboardingApi();

  const totalSteps = ONBOARDING_STEPS.length;
  const progress = useMemo(
    () => Math.round((currentStep / totalSteps) * 100),
    [currentStep, totalSteps]
  );

  const currentStepConfig = useMemo(
    () => ONBOARDING_STEPS.find((s) => s.step === currentStep),
    [currentStep]
  );

  const goToStep = useCallback(
    (step: number) => {
      const stepConfig = ONBOARDING_STEPS.find((s) => s.step === step);
      if (stepConfig) {
        setStep(step);
        router.push(stepConfig.path);
      }
    },
    [router, setStep]
  );

  const nextStep = useCallback(async () => {
    const next = currentStep + 1;

    try {
      // Save progress to server
      await updateProgress.mutateAsync({ step: next });

      if (next > totalSteps) {
        // Complete onboarding
        await updateProgress.mutateAsync({ done: true });
        reset();
        router.push('/dashboard');
      } else {
        goToStep(next);
      }
    } catch (error) {
      console.error('Error saving onboarding progress:', error);
      // Still navigate even if save fails
      if (next > totalSteps) {
        router.push('/dashboard');
      } else {
        goToStep(next);
      }
    }
  }, [currentStep, totalSteps, goToStep, router, reset, updateProgress]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  const skipStep = useCallback(() => {
    nextStep();
  }, [nextStep]);

  const completeOnboarding = useCallback(async () => {
    try {
      await updateProgress.mutateAsync({ done: true });
      reset();
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      router.push('/dashboard');
    }
  }, [router, reset, updateProgress]);

  return {
    currentStep,
    totalSteps,
    progress,
    steps: ONBOARDING_STEPS,
    currentStepConfig,
    data,
    goToStep,
    nextStep,
    prevStep,
    skipStep,
    completeOnboarding,
  };
}
