import { useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export const useOnboardingApi = () => {
  const { update } = useSession();

  const updateProgress = useMutation({
    mutationFn: async (data: { step?: number; done?: boolean }) => {
      const response = await fetch('/api/user/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour de la progression');
      await update();
      return response.json();
    },
  });

  const joinOrganization = useMutation({
    mutationFn: async (slug: string) => {
      const response = await fetch('/api/organizations/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Erreur lors de la rejointure');
      }
      return response.json();
    },
  });

  const createOrganization = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Erreur lors de la création de l'organisation");
      }
      return response.json();
    },
  });

  const inviteTeam = useMutation({
    mutationFn: async (invitations: Record<string, unknown>[]) => {
      const response = await fetch('/api/invitations/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitations }),
      });
      if (!response.ok) throw new Error("Erreur lors de l'invitation de l'équipe");
      return response.json();
    },
  });

  return {
    updateProgress,
    joinOrganization,
    createOrganization,
    inviteTeam,
  };
};
