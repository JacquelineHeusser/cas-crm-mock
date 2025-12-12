/**
 * LLM Service Layer
 * Abstraktionsschicht für OpenAI und Together.ai
 */

import OpenAI from 'openai';
import Together from 'together-ai';

/**
 * OpenAI Client
 */
export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY fehlt in .env');
  }

  return new OpenAI({ apiKey });
}

/**
 * Together.ai Client
 */
export function getTogetherClient(): Together {
  const apiKey = process.env.TOGETHERAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('TOGETHERAI_API_KEY fehlt in .env');
  }

  return new Together({ apiKey });
}

/**
 * Chat Completion mit konfiguriertem Provider
 */
export async function getChatCompletion(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  }
): Promise<string> {
  const provider = process.env.LLM_PROVIDER || 'together';

  if (provider === 'openai') {
    const client = getOpenAIClient();
    const model = options?.model || process.env.OPENAI_CHAT_MODEL || 'gpt-4';

    const response = await client.chat.completions.create({
      model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
    });

    return response.choices[0]?.message?.content || '';
  } else if (provider === 'together') {
    const client = getTogetherClient();
    const model = options?.model || process.env.TOGETHERAI_CHAT_MODEL || 'meta-llama/Llama-3.3-70B-Instruct-Turbo';

    const response = await client.chat.completions.create({
      model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
    });

    return response.choices[0]?.message?.content || '';
  } else {
    throw new Error(`Unknown LLM provider: ${provider}`);
  }
}
