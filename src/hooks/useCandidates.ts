import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useCandidates = (search?: string) => {
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: ['candidates', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const response = await fetch(`/api/candidates?${params}`);
      if (!response.ok) throw new Error('Erreur lors du chargement des candidats');
      return response.json();
    },
  });

  const create = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erreur lors de la création');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await fetch(`/api/candidates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/candidates/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });

  return {
    list,
    create,
    update,
    remove,
  };
};
