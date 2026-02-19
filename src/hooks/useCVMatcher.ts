import { useCallback, useState } from 'react';

import {
  CVData,
  JobData,
  MatchingState,
  SectionSuggestion,
  UploadProgress,
} from '@/types/cv-matcher';

/**
 * Custom hook for CV-Job matching functionality
 * Manages state and API calls for the complete matching workflow
 */
export const useCVMatcher = () => {
  const [state, setState] = useState<MatchingState>({
    step: 1,
    isAnalyzing: false,
  });

  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Parse CV from file upload using Hrflow
   */
  const parseCVFromFile = useCallback(
    async (file: File): Promise<CVData | null> => {
      try {
        setIsLoading(true);
        setUploadProgress({
          stage: 'uploading',
          progress: 10,
          message: 'Téléchargement du CV...',
        });

        const formData = new FormData();
        formData.append('file', file);

        setUploadProgress({
          stage: 'parsing',
          progress: 50,
          message: "Analyse du CV avec l'IA...",
        });

        const response = await fetch('/api/cv/parse', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message);
        }

        setUploadProgress({
          stage: 'complete',
          progress: 100,
          message: 'CV analysé avec succès!',
        });

        setState((prev) => ({
          ...prev,
          cvData: result.data,
          step: 2,
          error: undefined,
        }));

        return result.data;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erreur lors de l'analyse du CV";
        setState((prev) => ({ ...prev, error: errorMessage }));
        return null;
      } finally {
        setIsLoading(false);
        setTimeout(() => setUploadProgress(null), 2000);
      }
    },
    []
  );

  /**
   * Parse CV from LinkedIn profile using Lixit
   */
  const parseCVFromLinkedIn = useCallback(
    async (linkedinUrl: string): Promise<CVData | null> => {
      try {
        setIsLoading(true);
        setUploadProgress({
          stage: 'uploading',
          progress: 20,
          message: 'Connexion à LinkedIn...',
        });

        setUploadProgress({
          stage: 'parsing',
          progress: 60,
          message: 'Extraction des données du profil...',
        });

        const response = await fetch('/api/linkedin/parse', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ linkedinUrl }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message);
        }

        setUploadProgress({
          stage: 'complete',
          progress: 100,
          message: 'Profil LinkedIn importé avec succès!',
        });

        setState((prev) => ({
          ...prev,
          cvData: result.data,
          step: 2,
          error: undefined,
        }));

        return result.data;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erreur lors de l'import LinkedIn";
        setState((prev) => ({ ...prev, error: errorMessage }));
        return null;
      } finally {
        setIsLoading(false);
        setTimeout(() => setUploadProgress(null), 2000);
      }
    },
    []
  );

  /**
   * Parse job description text
   */
  const parseJobDescription = useCallback(
    async (jobDescription: string): Promise<JobData | null> => {
      try {
        setIsLoading(true);
        setUploadProgress({
          stage: 'parsing',
          progress: 30,
          message: "Analyse de l'offre d'emploi...",
        });

        const response = await fetch('/api/job/parse-linkedin', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ jobDescription }),
        });

        setUploadProgress({
          stage: 'matching',
          progress: 70,
          message: 'Optimisation du CV en cours...',
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message);
        }

        setUploadProgress({
          stage: 'complete',
          progress: 100,
          message: 'CV optimisé avec succès!',
        });

        setState((prev) => ({
          ...prev,
          jobData: result.data,
          step: 3,
          error: undefined,
        }));

        return result.data;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erreur lors de l'analyse de l'offre";
        setState((prev) => ({ ...prev, error: errorMessage }));
        return null;
      } finally {
        setIsLoading(false);
        setTimeout(() => setUploadProgress(null), 2000);
      }
    },
    []
  );

  /**
   * Perform complete CV-Job matching analysis
   */
  const analyzeMatch = useCallback(async (): Promise<boolean> => {
    if (!state.cvData || !state.jobData) {
      setState((prev) => ({
        ...prev,
        error: 'CV et description du poste requis',
      }));
      return false;
    }

    try {
      setState((prev) => ({ ...prev, isAnalyzing: true, error: undefined }));

      const response = await fetch('/api/matching/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvData: state.cvData,
          jobDescription: state.jobData.description,
          analysisType: 'complete',
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      setState((prev) => ({
        ...prev,
        results: {
          score: result.data.matchingScore,
          suggestions: result.data.suggestions,
          improvedCV: result.data.improvedCV,
        },
        step: 4,
        isAnalyzing: false,
      }));

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur lors de l'analyse";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isAnalyzing: false,
      }));
      return false;
    }
  }, [state.cvData, state.jobData]);

  /**
   * Reset the matching state
   */
  const resetMatcher = useCallback(() => {
    setState({
      step: 1,
      isAnalyzing: false,
    });
    setUploadProgress(null);
  }, []);

  /**
   * Go to specific step
   */
  const goToStep = useCallback((step: 1 | 2 | 3 | 4) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  /**
   * Update CV data manually
   */
  const updateCVData = useCallback((cvData: CVData) => {
    setState((prev) => ({ ...prev, cvData }));
  }, []);

  /**
   * Update job data manually
   */
  const updateJobData = useCallback((jobData: JobData) => {
    setState((prev) => ({ ...prev, jobData }));
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: undefined }));
  }, []);

  return {
    // State
    state,
    uploadProgress,
    isLoading,

    // CV parsing
    parseCVFromFile,
    parseCVFromLinkedIn,

    // Job parsing
    parseJobDescription,

    // Analysis
    analyzeMatch,

    // Navigation
    goToStep,
    resetMatcher,

    // Manual updates
    updateCVData,
    updateJobData,

    // Error handling
    clearError,

    // Computed values
    hasCV: Boolean(state.cvData),
    hasJob: Boolean(state.jobData),
    canAnalyze: Boolean(state.cvData && state.jobData),
    hasResults: Boolean(state.results),
  };
};

/**
 * Hook for managing individual suggestions
 */
export const useSuggestions = (
  initialSuggestions: SectionSuggestion[] = []
) => {
  const [suggestions, setSuggestions] =
    useState<SectionSuggestion[]>(initialSuggestions);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }, []);

  const markSuggestionAsApplied = useCallback(
    (sectionIndex: number, suggestionIndex: number) => {
      setSuggestions((prev) =>
        prev.map((section, sIdx) => {
          if (sIdx === sectionIndex) {
            return {
              ...section,
              suggestions: section.suggestions.map((suggestion, sgIdx) =>
                sgIdx === suggestionIndex
                  ? { ...suggestion, applied: true }
                  : suggestion
              ),
            };
          }
          return section;
        })
      );
    },
    []
  );

  const getSectionStatus = useCallback((section: SectionSuggestion) => {
    if (section.score >= 85) return 'excellent';
    if (section.score >= 70) return 'good';
    if (section.score >= 50) return 'needs_improvement';
    return 'critical';
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'good':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'needs_improvement':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }, []);

  return {
    suggestions,
    expandedSections,
    toggleSection,
    markSuggestionAsApplied,
    getSectionStatus,
    getStatusColor,
    setSuggestions,
  };
};
