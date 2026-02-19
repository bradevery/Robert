import { useMutation } from '@tanstack/react-query';

export interface MatchResult {
  candidateId: string;
  name: string;
  avatar: string;
  title: string;
  overallScore: number;
  skillMatch: number;
  experienceMatch: number;
  availabilityMatch: number;
  budgetMatch: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface ScoreResult {
  profile: {
    reference: string;
    fileName?: string;
    info: {
      full_name?: string;
      display_name: string;
      contact_name: string;
    };
  };
  score: number;
  skills: {
    matching: Array<{ name: string; score: number }>;
    missing: Array<{ name: string; score: number }>;
  };
  breakdown: {
    vectorScore: number;
    keywordScore: number;
    embeddingScore: number;
    semanticScore: number;
  };
  competences_techniques?: {
    points_forts: string[];
    points_faibles: string[];
  };
  soft_skills?: {
    points_forts: string[];
    points_faibles: string[];
  };
  donnees_logistiques?: {
    tjm_salaire: string;
    localisation: string;
    disponibilite: string;
    points_vigilance: string[];
  };
  justification: string;
}

interface MatchParams {
  candidate: {
    id: string;
    name: string;
    title: string;
    skills: string[];
    yearsExperience: number;
    availability: string;
    tjm?: number;
  };
  job: {
    description: string;
  };
}

export const useScore = () => {
  const matchCandidate = useMutation({
    mutationFn: async (params: MatchParams): Promise<MatchResult> => {
      const response = await fetch('/api/ai/matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du matching');
      }

      const data = await response.json();
      const matching = data.matching;

      return {
        candidateId: params.candidate.id,
        name: params.candidate.name,
        avatar: params.candidate.name.split(' ').map(n => n[0]).join(''),
        title: params.candidate.title,
        overallScore: matching.overallScore,
        skillMatch: matching.scores.technical,
        experienceMatch: matching.scores.experience,
        availabilityMatch: matching.scores.availability,
        budgetMatch: 85,
        matchedSkills: matching.skillsAnalysis?.matched?.map((s: { skill: string }) => s.skill) || [],
        missingSkills: matching.skillsAnalysis?.missing?.map((s: { skill: string }) => s.skill) || [],
      };
    },
  });

  // For file matching, it's a bit more complex due to SSE, but we can still use a mutation to trigger it
  // and handle the stream inside the mutationFn or separately.
  // Given the current architecture, I'll keep the SSE logic in the component for now but wrap the trigger.
  
  return {
    matchCandidate,
  };
};
