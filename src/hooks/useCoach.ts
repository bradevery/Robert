import { useMutation } from '@tanstack/react-query';

interface ChatParams {
  message: string;
  history: Array<{ role: string; content: string }>;
  context: string;
}

interface ChatResponse {
  response: {
    message: string;
  };
}

export const useCoach = () => {
  const sendMessage = useMutation({
    mutationFn: async (params: ChatParams): Promise<string> => {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur API');
      }

      const data: ChatResponse = await response.json();
      if (!data.response?.message) {
        throw new Error('Réponse IA vide');
      }
      return data.response.message;
    },
  });

  return {
    sendMessage,
  };
};
