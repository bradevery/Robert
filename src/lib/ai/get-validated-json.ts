import { z } from 'zod';

import { createChatCompletion } from '@/lib/ai/openai-client';

interface GetValidatedJsonOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Sends messages to OpenAI, parses the JSON response, and validates it against a Zod schema.
 * Retries once with a correction prompt if the first attempt fails validation.
 */
export async function getValidatedJson<T>(
  messages: ReadonlyArray<{ role: 'system' | 'user'; content: string }>,
  schema: z.ZodSchema<T>,
  options: GetValidatedJsonOptions = {}
): Promise<T> {
  const {
    model = 'gpt-4o-mini',
    temperature = 0.3,
    maxTokens = 4000,
  } = options;

  let lastError = 'Invalid JSON response';

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await createChatCompletion(
      [
        ...messages,
        ...(attempt === 0
          ? []
          : [
              {
                role: 'system' as const,
                content:
                  'La reponse precedente etait invalide. Corrige et renvoie uniquement un JSON conforme au schema.',
              },
            ]),
      ],
      { model, temperature, maxTokens, responseFormat: 'json' }
    );

    try {
      const parsed = JSON.parse(response);
      const result = schema.safeParse(parsed);
      if (result.success) {
        return result.data;
      }
      lastError = result.error.message;
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Invalid JSON';
    }
  }

  throw new Error(lastError);
}
