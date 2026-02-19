import { useMutation } from '@tanstack/react-query';

// Types from the original file, moved here for reuse
export interface ATSCheck {
  id: string;
  label: string;
  status: 'pass' | 'warning' | 'fail';
  detail: string;
}

export interface KeywordAnalysis {
  keyword: string;
  found: boolean;
  frequency: number;
  importance: 'high' | 'medium' | 'low';
}

export interface ImpactAnalysis {
  actionVerbs: number;
  quantifiedResults: number;
  buzzwords: number;
  suggestions: string[];
}

export interface ReviewResult {
  globalScore: number;
  atsScore: number;
  readabilityScore: number;
  impactScore: number;
  atsChecks: ATSCheck[];
  keywords: KeywordAnalysis[];
  impact: ImpactAnalysis;
  improvements: string[];
}

export interface RewriteResult {
  basics: {
    title: string;
    summary: string;
  };
  experiences: Array<{
    company: string;
    role: string;
    description: string;
    improvementsMade: string[];
  }>;
  skills: {
    technical: string[];
    soft: string[];
  };
  language: string;
}

interface AnalyzeCVParams {
  content: string;
  targetOffer?: string;
  resumeId?: string;
}

interface RewriteCVParams {
  cvText: string;
  jobDescription: string;
}

export const useReviewer = () => {
  const analyze = useMutation({
    mutationFn: async ({ content, targetOffer, resumeId }: AnalyzeCVParams): Promise<ReviewResult> => {
      const response = await fetch('/api/ai/reviewer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvData: content,
          targetRole: targetOffer,
          resumeId,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'analyse");
      }

      const data = await response.json();
      return data.review;
    },
  });

  const rewrite = useMutation({
    mutationFn: async ({ cvText, jobDescription }: RewriteCVParams): Promise<RewriteResult> => {
      const response = await fetch('/api/ai/reviewer/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, jobDescription }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la réécriture');
      }

      const data = await response.json();
      return data.rewritten;
    },
  });

  return {
    analyze,
    rewrite,
  };
};
