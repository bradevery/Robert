import { useQuery } from '@tanstack/react-query';

interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
}

interface OrganizationResponse {
  organization: OrganizationData;
}

export const useOrganization = () => {
  return useQuery({
    queryKey: ['organization'],
    queryFn: async (): Promise<OrganizationData> => {
      const res = await fetch('/api/organization');
      if (!res.ok) {
        throw new Error(`Erreur lors de la récupération de l'organisation`);
      }
      const data: OrganizationResponse = await res.json();
      return data.organization;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
