import { useMutation, useQuery } from '@tanstack/react-query';

interface ShareParams {
  documentId: string;
  documentType: 'cv' | 'dossier';
}

interface ShareResponse {
  shareUrl: string;
  expiresAt: string;
}

export interface SharedDocument {
  documentType: string;
  document: Record<string, unknown>;
  expiresAt: string;
}

export const useShare = () => {
  const createShare = useMutation({
    mutationFn: async (params: ShareParams): Promise<ShareResponse> => {
      const response = await fetch('/api/share/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du lien de partage');
      }

      return response.json();
    },
  });

  const useSharedDocument = (token: string) => {
    return useQuery({
      queryKey: ['shared-document', token],
      queryFn: async (): Promise<SharedDocument> => {
        const response = await fetch(`/api/share/${token}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to load document');
        }
        return response.json();
      },
      retry: false,
    });
  };

  return {
    createShare,
    useSharedDocument,
  };
};
