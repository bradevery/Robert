import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

import { createChatCompletion, SYSTEM_PROMPTS } from '@/lib/ai/openai-client';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
  relatedActions?: Array<{
    action: string;
    label: string;
    context?: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, threadId, history = [], context, contextId } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Le message est requis' },
        { status: 400 }
      );
    }

    // Build conversation history
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPTS.chat },
    ];

    // Add context if available
    if (context) {
      messages.push({
        role: 'system',
        content: `Contexte actuel: ${context}${
          contextId ? ` (ID: ${contextId})` : ''
        }`,
      });
    }

    // Add conversation history
    history.forEach((msg: ChatMessage) => {
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      });
    });

    // Add current message
    messages.push({ role: 'user', content: message });

    const response = await createChatCompletion(messages, {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 2000,
      responseFormat: 'text',
    });

    // Generate suggestions based on context
    const suggestions = generateSuggestions(message, context);

    // Generate related actions
    const relatedActions = generateRelatedActions(message, context);

    const chatResponse: ChatResponse = {
      message: response,
      suggestions,
      relatedActions,
    };

    return NextResponse.json({
      success: true,
      response: chatResponse,
      threadId,
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors du traitement du message',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function generateSuggestions(message: string, _context?: string): string[] {
  const lowerMessage = message.toLowerCase();
  const suggestions: string[] = [];

  if (lowerMessage.includes('cv') || lowerMessage.includes('candidat')) {
    suggestions.push('Comment puis-je améliorer ce CV ?');
    suggestions.push('Quelles compétences sont les plus demandées ?');
    suggestions.push('Aide-moi à évaluer ce profil');
  }

  if (lowerMessage.includes('ao') || lowerMessage.includes("appel d'offre")) {
    suggestions.push('Quels sont les risques de cet AO ?');
    suggestions.push('Aide-moi à estimer le budget');
    suggestions.push('Quels profils sont nécessaires ?');
  }

  if (lowerMessage.includes('dossier') || lowerMessage.includes('propale')) {
    suggestions.push('Génère une propale pour ce dossier');
    suggestions.push('Quels candidats correspondent ?');
    suggestions.push('Aide-moi à préparer la soutenance');
  }

  if (suggestions.length === 0) {
    suggestions.push('Parle-moi des tendances du marché IT');
    suggestions.push('Comment optimiser mes recrutements ?');
    suggestions.push('Aide-moi avec un nouveau dossier');
  }

  return suggestions.slice(0, 3);
}

function generateRelatedActions(
  message: string,
  _context?: string
): Array<{ action: string; label: string; context?: string }> {
  const lowerMessage = message.toLowerCase();
  const actions: Array<{ action: string; label: string; context?: string }> =
    [];

  if (lowerMessage.includes('cv') || lowerMessage.includes('candidat')) {
    actions.push({
      action: 'navigate',
      label: 'Voir mes candidats',
      context: '/mes-candidats',
    });
    actions.push({
      action: 'module',
      label: 'Ouvrir Reviewer',
      context: '/modules/reviewer',
    });
  }

  if (lowerMessage.includes('ao') || lowerMessage.includes('analyse')) {
    actions.push({
      action: 'module',
      label: 'Ouvrir AO Reader',
      context: '/modules/ao-reader',
    });
    actions.push({
      action: 'navigate',
      label: 'Dossiers de Compétences',
      context: '/mes-dossiers',
    });
  }

  if (
    lowerMessage.includes('propale') ||
    lowerMessage.includes('proposition')
  ) {
    actions.push({
      action: 'module',
      label: 'Générer une proposal',
      context: '/modules/proposal',
    });
  }

  if (lowerMessage.includes('matching') || lowerMessage.includes('score')) {
    actions.push({
      action: 'module',
      label: 'Ouvrir Score',
      context: '/modules/score',
    });
  }

  return actions.slice(0, 2);
}
