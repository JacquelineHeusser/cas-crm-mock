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
export function getTogetherClient(): any {
  const apiKey = process.env.TOGETHERAI_API_KEY;
  
  if (!apiKey) {
    console.warn('[AI] TOGETHERAI_API_KEY fehlt - verwende OpenAI als Fallback');
    // Fallback zu OpenAI wenn Together.ai nicht konfiguriert ist
    // Gebe OpenAI Client zurück als Fallback
    return getOpenAIClient();
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
  const provider = process.env.LLM_PROVIDER || 'openai';
  console.log('[AI] LLM_PROVIDER:', provider);
  console.log('[AI] OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);

  if (provider === 'openai') {
    const client = getOpenAIClient();
    
    // Validiere und verwende gültiges OpenAI Model
    const envModel = process.env.OPENAI_CHAT_MODEL;
    const validModels = ['gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'];
    let model = options?.model || envModel || 'gpt-4o-mini';
    
    // Fallback zu gpt-4o-mini wenn ungültiges Model
    if (!validModels.includes(model) && !model.startsWith('gpt-')) {
      console.warn(`[AI] Ungültiges Model "${model}" - verwende gpt-4o-mini als Fallback`);
      model = 'gpt-4o-mini';
    }

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
