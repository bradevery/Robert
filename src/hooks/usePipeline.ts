import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const usePipeline = (pipelineId?: string | null) => {
  const queryClient = useQueryClient();

  const session = useQuery({
    queryKey: ['pipeline', pipelineId],
    queryFn: async () => {
      if (!pipelineId) return null;
      const response = await fetch(`/api/pipeline/${pipelineId}`);
      if (!response.ok) throw new Error('Erreur lors du chargement de la session');
      return response.json();
    },
    enabled: !!pipelineId,
  });

  const updateSession = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      if (!pipelineId) throw new Error('Pas de session active');
      const response = await fetch(`/api/pipeline/${pipelineId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline', pipelineId] });
    },
  });

  return {
    session,
    updateSession,
  };
};
