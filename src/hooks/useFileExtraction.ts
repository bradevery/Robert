import { useMutation } from '@tanstack/react-query';

interface ExtractTextResponse {
  text: string;
}

export const useFileExtraction = () => {
  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/files/extract-text', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Extraction du fichier impossible');
      }

      const data: ExtractTextResponse = await res.json();
      
      if (!data.text || data.text.trim().length < 50) {
        throw new Error('Le fichier ne contient pas assez de texte exploitable.');
      }

      return data.text;
    },
  });
};
