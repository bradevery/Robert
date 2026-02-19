import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useSettings = () => {
  const queryClient = useQueryClient();

  const settings = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings');
      if (!response.ok) throw new Error('Erreur lors du chargement des paramètres');
      return response.json();
    },
  });

  const profile = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await fetch('/api/user/profile');
      if (!response.ok) throw new Error('Erreur lors du chargement du profil');
      return response.json();
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour des paramètres');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour du profil');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });

  const updateOrganization = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await fetch('/api/organization', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erreur lors de la mise à jour de l'organisation");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
    },
  });

  return {
    settings,
    profile,
    updateSettings,
    updateProfile,
    updateOrganization,
  };
};
