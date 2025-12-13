/**
 * Embedding Service Layer
 * Zentrale Embedding-Generierung mit Provider-Abstraktion
 */

import { getOpenAIClient, getTogetherClient } from './ai';

// Embedding-Dimensionen pro Modell
export const EMBEDDING_DIMENSIONS: Record<string, number> = {
  'text-embedding-3-small': 1536,
  'text-embedding-3-large': 3072,
  'intfloat/multilingual-e5-large-instruct': 1024, // Empfohlen für Deutsch
};

/**
 * Generiert Embedding mit OpenAI
 */
export async function generateEmbeddingOpenAI(
  text: string,
  model?: string
): Promise<number[]> {
  const client = getOpenAIClient();
  const embeddingModel = model || process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

  const response = await client.embeddings.create({
    model: embeddingModel,
    input: text.replace(/\n/g, ' '),
  });

  return response.data[0].embedding;
}

/**
 * Generiert Embedding mit Together.ai
 */
export async function generateEmbeddingTogether(
  text: string,
  model?: string
): Promise<number[]> {
  // Fallback zu OpenAI wenn Together.ai nicht verfügbar
  if (!process.env.TOGETHERAI_API_KEY) {
    console.warn('[Embeddings] TOGETHERAI_API_KEY fehlt - verwende OpenAI als Fallback');
    return generateEmbeddingOpenAI(text);
  }
  
  const client = getTogetherClient();
  const embeddingModel = model || process.env.TOGETHERAI_EMBEDDING_MODEL || 'intfloat/multilingual-e5-large-instruct';

  const response = await client.embeddings.create({
    model: embeddingModel,
    input: text.replace(/\n/g, ' '),
  });

  return response.data[0].embedding;
}

/**
 * Generiert Embedding mit konfiguriertem Provider
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const provider = process.env.EMBEDDING_PROVIDER || 'openai';

  if (provider === 'openai') {
    return generateEmbeddingOpenAI(text);
  } else if (provider === 'together') {
    return generateEmbeddingTogether(text);
  } else {
    throw new Error(`Unknown embedding provider: ${provider}`);
  }
}

/**
 * Generiert Embeddings für mehrere Texte (Batch)
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const provider = process.env.EMBEDDING_PROVIDER || 'openai';

  if (provider === 'openai') {
    const client = getOpenAIClient();
    const model = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

    const response = await client.embeddings.create({
      model,
      input: texts.map(t => t.replace(/\n/g, ' ')),
    });

    return response.data.map((d: any) => d.embedding);
  } else if (provider === 'together') {
    const client = getTogetherClient();
    const model = process.env.TOGETHERAI_EMBEDDING_MODEL || 'intfloat/multilingual-e5-large-instruct';

    const response = await client.embeddings.create({
      model,
      input: texts.map(t => t.replace(/\n/g, ' ')),
    });

    return response.data.map((d: any) => d.embedding);
  } else {
    throw new Error(`Unknown embedding provider: ${provider}`);
  }
}
