import { useMutation } from '@tanstack/react-query';

export interface AnalysisResult {
  title: string;
  client: string;
  budget: { min: number; max: number };
  deadline: string;
  skills: { name: string; level: 'required' | 'preferred'; category: string }[];
  profiles: { role: string; count: number; seniorityLevel: string }[];
  risks: {
    type: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
  }[];
  specificClauses: { penalties: string | null; onCall: string | null };
  context: string;
  issues: string[];
  opportunities: string[];
  goNoGoScore: number;
  summary: string;
}

interface AnalyzeAOParams {
  content: string;
  fileName: string;
}

interface CreateDossierParams {
  title: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  goNoGoScore: number;
}

export const useAOReader = () => {
  const analyze = useMutation({
    mutationFn: async ({ content, fileName }: AnalyzeAOParams): Promise<AnalysisResult> => {
      const response = await fetch('/api/ai/ao-reader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, fileName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de l'analyse");
      }

      const data = await response.json();
      const a = data.analysis;

      return {
        title: a?.summary || fileName,
        client: 'Client non spécifié',
        budget: {
          min: a?.extractedBudget || 0,
          max: a?.extractedBudget || 0,
        },
        deadline: a?.keyDates?.[0]?.date || 'Non précisé',
        skills: [
          ...(a?.requiredSkills?.map((s: { skill: string }) => ({
            name: s.skill,
            level: 'required' as const,
            category: 'Compétence',
          })) || []),
          ...(a?.preferredSkills?.map((s: { skill: string }) => ({
            name: s.skill,
            level: 'preferred' as const,
            category: 'Compétence',
          })) || []),
        ],
        profiles:
          a?.requiredProfiles?.map((p: { title: string; count: number; seniority: string }) => ({
            role: p.title,
            count: p.count,
            seniorityLevel: p.seniority,
          })) || [],
        risks: a?.risks || [],
        specificClauses: a?.specificClauses || {
          penalties: null,
          onCall: null,
        },
        context: a?.context || '',
        issues: a?.issues || [],
        opportunities:
          a?.opportunities?.map((o: { description?: string } | string) => (typeof o === 'string' ? o : o.description || '')) || [],
        goNoGoScore: a?.goNoGoScore || 0,
        summary: a?.summary || '',
      };
    },
  });

  const createDossier = useMutation({
    mutationFn: async (params: CreateDossierParams) => {
      const res = await fetch('/api/dossiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        throw new Error('Erreur lors de la création du dossier');
      }
      return res.json();
    },
  });

  return {
    analyze,
    createDossier,
  };
};
