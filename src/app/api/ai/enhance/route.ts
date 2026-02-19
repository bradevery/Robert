import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { text, type, apiKey, context, tone, targetLanguage } =
      await request.json();

    if (!text || !type || !apiKey) {
      return NextResponse.json(
        { error: 'Text, type, and API key are required' },
        { status: 400 }
      );
    }

    // Initialiser OpenAI avec la clé API de l'utilisateur
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    let prompt = '';

    switch (type) {
      case 'improve':
        prompt = `
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
        break;

      case 'fix_grammar':
        prompt = `
Fix any grammar, spelling, and punctuation errors in the following resume text:

"${text}"

Respond with only the corrected text, no explanations.`;
        break;

      case 'change_tone': {
        const toneInstructions = {
          professional: 'Make the text sound more professional and polished',
          confident: 'Make the text sound more confident and assertive',
          casual: 'Make the text sound more conversational and approachable',
          formal: 'Make the text sound more formal and academic',
        };
        const instruction =
          toneInstructions[tone as keyof typeof toneInstructions] ||
          'Improve the professional tone';

        prompt = `
${instruction} for this resume text:

"${text}"

Respond with only the revised text, no explanations.`;
        break;
      }

      case 'translate':
        prompt = `
Translate the following resume text to ${targetLanguage || 'English'}:

"${text}"

Make sure the translation:
- Maintains professional tone
- Uses appropriate terminology for resumes/CVs
- Keeps the same structure and format

Respond with only the translated text, no explanations.`;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid enhancement type' },
          { status: 400 }
        );
    }

    const completion = await openai.chat.completions.create({
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
      completion.choices[0]?.message?.content?.trim() || text;

    // Générer des suggestions basées sur le type
    const suggestions = generateSuggestions(type);

    return NextResponse.json({
      enhancedText,
      originalText: text,
      suggestions,
    });
  } catch (error) {
    console.error('OpenAI API Error:', error);

    if (error instanceof Error) {
      // Gestion des erreurs spécifiques à l'API OpenAI
      if (error.message.includes('Invalid API key')) {
        return NextResponse.json(
          {
            error:
              'Invalid OpenAI API key. Please check your key and try again.',
          },
          { status: 401 }
        );
      }

      if (error.message.includes('quota')) {
        return NextResponse.json(
          {
            error:
              'OpenAI API quota exceeded. Please check your billing or try again later.',
          },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to enhance text. Please try again.' },
      { status: 500 }
    );
  }
}

function generateSuggestions(type: string): string[] {
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
