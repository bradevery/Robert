import OpenAI from 'openai';

// Types pour les améliorations IA
export interface AIEnhancementRequest {
  text: string;
  type: 'improve' | 'fix_grammar' | 'change_tone' | 'translate';
  tone?: 'professional' | 'confident' | 'casual' | 'formal';
  targetLanguage?: string;
  context?: string;
}

export interface AIEnhancementResponse {
  enhancedText: string;
  originalText: string;
  suggestions?: string[];
}

class OpenAIService {
  private client: OpenAI | null = null;

  constructor() {
    // Le client sera initialisé avec la clé API de l'utilisateur
  }

  initialize(apiKey: string) {
    this.client = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // Pour l'utilisation côté client
    });
  }

  async enhanceText(
    request: AIEnhancementRequest
  ): Promise<AIEnhancementResponse> {
    if (!this.client) {
      throw new Error(
        'OpenAI client not initialized. Please provide your API key.'
      );
    }

    try {
      let prompt = '';

      switch (request.type) {
        case 'improve':
          prompt = this.getImprovePrompt(request.text, request.context);
          break;
        case 'fix_grammar':
          prompt = this.getGrammarPrompt(request.text);
          break;
        case 'change_tone':
          prompt = this.getTonePrompt(request.text, request.tone);
          break;
        case 'translate':
          prompt = this.getTranslatePrompt(
            request.text,
            request.targetLanguage
          );
          break;
        default:
          throw new Error('Invalid enhancement type');
      }

      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a professional resume writing assistant. Provide clear, concise, and professional text improvements. Always respond in the same language as the input text unless specifically asked to translate.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      });

      const enhancedText =
        completion.choices[0]?.message?.content?.trim() || request.text;

      return {
        enhancedText,
        originalText: request.text,
        suggestions: this.generateSuggestions(request.type),
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(
        'Failed to enhance text. Please check your API key and try again.'
      );
    }
  }

  private getImprovePrompt(text: string, context?: string): string {
    return `
Improve the following resume text to make it more professional, impactful, and ATS-friendly:

${context ? `Context: ${context}` : ''}

Original text: "${text}"

Please provide an improved version that:
- Uses strong action verbs
- Quantifies achievements where possible
- Is concise and clear
- Follows professional resume writing standards
- Maintains the original meaning

Respond with only the improved text, no explanations.`;
  }

  private getGrammarPrompt(text: string): string {
    return `
Fix any grammar, spelling, and punctuation errors in the following resume text:

"${text}"

Respond with only the corrected text, no explanations.`;
  }

  private getTonePrompt(text: string, tone?: string): string {
    const toneInstructions = {
      professional: 'Make the text sound more professional and polished',
      confident: 'Make the text sound more confident and assertive',
      casual: 'Make the text sound more conversational and approachable',
      formal: 'Make the text sound more formal and academic',
    };

    const instruction =
      toneInstructions[tone as keyof typeof toneInstructions] ||
      'Improve the professional tone';

    return `
${instruction} for this resume text:

"${text}"

Respond with only the revised text, no explanations.`;
  }

  private getTranslatePrompt(text: string, targetLanguage?: string): string {
    return `
Translate the following resume text to ${targetLanguage || 'English'}:

"${text}"

Make sure the translation:
- Maintains professional tone
- Uses appropriate terminology for resumes/CVs
- Keeps the same structure and format

Respond with only the translated text, no explanations.`;
  }

  private generateSuggestions(type: string): string[] {
    const suggestions = {
      improve: [
        'Consider adding specific metrics or numbers to quantify your achievements',
        'Use stronger action verbs to start your bullet points',
        'Focus on results and impact rather than just responsibilities',
      ],
      fix_grammar: [
        'Always proofread your resume before submitting',
        'Consider using a grammar checking tool for additional verification',
        'Ask a colleague to review your resume for any missed errors',
      ],
      change_tone: [
        "Ensure the tone matches the industry and role you're applying for",
        'Maintain consistency in tone throughout your entire resume',
        'Consider the company culture when choosing your tone',
      ],
      translate: [
        'Have a native speaker review the translation',
        'Ensure industry-specific terms are accurately translated',
        'Check that the translated version maintains professional standards',
      ],
    };

    return suggestions[type as keyof typeof suggestions] || [];
  }

  // Méthode pour vérifier si l'API key est valide
  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const tempClient = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
      });

      await tempClient.models.list();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Instance singleton
export const openaiService = new OpenAIService();

// Hook pour utiliser le service OpenAI dans les composants React
export const useOpenAI = () => {
  const enhanceText = async (
    request: AIEnhancementRequest
  ): Promise<AIEnhancementResponse> => {
    return openaiService.enhanceText(request);
  };

  const initializeService = (apiKey: string) => {
    openaiService.initialize(apiKey);
  };

  const validateApiKey = async (apiKey: string): Promise<boolean> => {
    return openaiService.validateApiKey(apiKey);
  };

  return {
    enhanceText,
    initializeService,
    validateApiKey,
  };
};
