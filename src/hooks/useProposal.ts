import { useMutation } from '@tanstack/react-query';

import { ProposalResult } from '@/stores/proposal-store';

export const useProposal = () => {
  const generate = useMutation({
    mutationFn: async (formData: FormData): Promise<ProposalResult> => {
      const response = await fetch('/api/ai/propale', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Erreur lors de la génération');
      }

      const data = await response.json();
      return data.proposal as ProposalResult;
    },
  });

  return {
    generate,
  };
};
