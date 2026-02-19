import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useDashboard = () => {
  const queryClient = useQueryClient();

  const stats = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) throw new Error('Erreur lors du chargement des statistiques');
      return response.json();
    },
  });

  const invitations = useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      const response = await fetch('/api/invitations');
      if (!response.ok) throw new Error('Erreur lors du chargement des invitations');
      return response.json();
    },
  });

  const sendInvitation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erreur lors de l'envoi de l'invitation");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });

  return {
    stats,
    invitations,
    sendInvitation,
  };
};
