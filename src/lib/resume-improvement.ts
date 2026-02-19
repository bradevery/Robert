import OpenAI from 'openai';

import {
  cosineSimilarity,
  extractKeywords,
  generateEmbedding,
} from './openai-embeddings';
import {
  StructuredJobData,
  StructuredResumeData,
} from './structured-extraction';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ImprovementResult {
  originalScore: number;
  improvedScore: number;
  improvedResume: string;
  iterations: number;
  suggestions: string[];
}

/**
 * Iteratively improve a resume to better match a job description using embeddings
 */
export async function improveResumeWithEmbeddings(
  resumeText: string,
  jobDescription: string,
  maxIterations = 3
): Promise<ImprovementResult> {
  try {
    // Extract keywords for embedding comparison
    const resumeKeywords = extractKeywords(resumeText);
    const jobKeywords = extractKeywords(jobDescription);

    // Generate initial embeddings
    const [resumeEmbedding, jobEmbedding] = await Promise.all([
      generateEmbedding(resumeKeywords),
      generateEmbedding(jobKeywords),
    ]);

    // Calculate initial similarity score
    let currentScore = cosineSimilarity(resumeEmbedding, jobEmbedding);
    let currentResume = resumeText;
    let bestResume = resumeText;
    let bestScore = currentScore;

    const suggestions: string[] = [];

    for (let i = 0; i < maxIterations; i++) {
      // Generate improvement suggestions using LLM
      const improvementPrompt = `
You are an expert resume writer. Analyze this resume against the job description and suggest specific improvements to increase the matching score.

Current resume:
${currentResume}

Job description:
${jobDescription}

Current matching score: ${(currentScore * 100).toFixed(1)}%

Provide specific, actionable suggestions to improve keyword matching and overall compatibility. Focus on:
1. Adding relevant keywords naturally
2. Highlighting relevant experience
3. Improving skill descriptions
4. Quantifying achievements

Return your response as a JSON object:
{
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "improved_resume": "The improved version of the resume with your suggestions applied"
}
`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a resume optimization expert.' },
          { role: 'user', content: improvementPrompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
        max_tokens: 2000,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      const improvedResume = result.improved_resume || currentResume;

      // Calculate new score
      const newResumeKeywords = extractKeywords(improvedResume);
      const newResumeEmbedding = await generateEmbedding(newResumeKeywords);
      const newScore = cosineSimilarity(newResumeEmbedding, jobEmbedding);

      suggestions.push(...(result.suggestions || []));

      // Update best score if improved
      if (newScore > bestScore) {
        bestScore = newScore;
        bestResume = improvedResume;
      }

      // If score didn't improve significantly, stop
      if (newScore - currentScore < 0.05) {
        break;
      }

      currentResume = improvedResume;
      currentScore = newScore;
    }

    return {
      originalScore: cosineSimilarity(resumeEmbedding, jobEmbedding),
      improvedScore: bestScore,
      improvedResume: bestResume,
      iterations: suggestions.length,
      suggestions,
    };
  } catch (error) {
    console.error('Error in resume improvement:', error);
    // Return original resume if improvement fails
    return {
      originalScore: 0,
      improvedScore: 0,
      improvedResume: resumeText,
      iterations: 0,
      suggestions: ['Unable to generate improvements at this time'],
    };
  }
}

/**
 * Calculate comprehensive matching score using multiple methods
 */
export async function calculateComprehensiveScore(
  resumeText: string,
  jobDescription: string,
  structuredResume?: StructuredResumeData,
  structuredJob?: StructuredJobData
): Promise<{
  embeddingScore: number;
  keywordScore: number;
  overallScore: number;
  breakdown: {
    keywords: number;
    experience: number;
    skills: number;
    education: number;
  };
}> {
  try {
    // Embedding-based score
    const resumeKeywords = extractKeywords(resumeText);
    const jobKeywords = extractKeywords(jobDescription);

    const [resumeEmbedding, jobEmbedding] = await Promise.all([
      generateEmbedding(resumeKeywords),
      generateEmbedding(jobKeywords),
    ]);

    const embeddingScore = cosineSimilarity(resumeEmbedding, jobEmbedding);

    // Keyword matching score
    const resumeWords = new Set(resumeKeywords.split(' '));
    const jobWords = new Set(jobKeywords.split(' '));
    const commonWords = new Set(
      Array.from(resumeWords).filter((x) => jobWords.has(x))
    );
    const keywordScore = commonWords.size / Math.max(jobWords.size, 1);

    // Structured data scores (if available)
    let experienceScore = 0.5;
    let skillsScore = 0.5;
    let educationScore = 0.5;

    if (structuredResume && structuredJob) {
      // Experience matching
      const resumeExperience = structuredResume.experiences.length;
      const jobExperienceRequired =
        parseInt(structuredJob.parsed.experience_required) || 0;
      experienceScore = Math.min(
        resumeExperience / Math.max(jobExperienceRequired, 1),
        1
      );

      // Skills matching
      const resumeSkills = new Set(
        structuredResume.skills.map((s) => s.toLowerCase())
      );
      const jobSkills = new Set(
        structuredJob.parsed.skills.map((s) => s.toLowerCase())
      );
      const matchedSkills = new Set(
        Array.from(resumeSkills).filter((x) => jobSkills.has(x))
      );
      skillsScore = matchedSkills.size / Math.max(jobSkills.size, 1);

      // Education matching (simplified)
      educationScore = structuredResume.education.length > 0 ? 0.8 : 0.3;
    }

    const overallScore =
      embeddingScore * 0.4 +
      keywordScore * 0.3 +
      experienceScore * 0.15 +
      skillsScore * 0.15;

    return {
      embeddingScore,
      keywordScore,
      overallScore,
      breakdown: {
        keywords: keywordScore,
        experience: experienceScore,
        skills: skillsScore,
        education: educationScore,
      },
    };
  } catch (error) {
    console.error('Error calculating comprehensive score:', error);
    return {
      embeddingScore: 0,
      keywordScore: 0,
      overallScore: 0,
      breakdown: {
        keywords: 0,
        experience: 0,
        skills: 0,
        education: 0,
      },
    };
  }
}
