import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useResumes = () => {
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      const response = await fetch('/api/resumes');
      if (!response.ok) throw new Error('Erreur lors du chargement des CVs');
      return response.json();
    },
  });

  const parseCV = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/cv/parse', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error("Erreur lors de l'analyse du CV");
      return response.json();
    },
  });

  const parseLinkedIn = useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch('/api/linkedin/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedinUrl: url }),
      });
      if (!response.ok) throw new Error("Erreur lors de l'analyse LinkedIn");
      return response.json();
    },
  });

  const deleteResume = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/resumes/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
  });

  return {
    list,
    parseCV,
    parseLinkedIn,
    deleteResume,
  };
};
