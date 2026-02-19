import { useMutation } from '@tanstack/react-query';

export const useAuth = () => {
  const register = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de l'inscription");
      }
      return response.json();
    },
  });

  const forgotPassword = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la demande");
      }
      return response.json();
    },
  });

  const resetPassword = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la réinitialisation");
      }
      return response.json();
    },
  });

  const verifyEmail = useMutation({
    mutationFn: async (token: string) => {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la vérification");
      }
      return response.json();
    },
  });

  const useValidateResetToken = (token: string | null) => {
    return useQuery({
      queryKey: ['validate-reset-token', token],
      queryFn: async () => {
        if (!token) return false;
        const response = await fetch(`/api/auth/validate-reset-token?token=${token}`);
        return response.ok;
      },
      enabled: !!token,
      retry: false,
    });
  };

  return {
    register,
    forgotPassword,
    resetPassword,
    verifyEmail,
    useValidateResetToken,
  };
};
