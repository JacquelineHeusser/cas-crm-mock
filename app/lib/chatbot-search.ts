/**
 * Multi-Source Vector Search für Chatbot
 * Sucht parallel in Policy, Web und Law Chunks
 *
 * Wichtig: Wir verwenden hier direkte SQL-Queries über Prisma,
 * um Berechtigungsprobleme mit dem Supabase Service Role Key zu vermeiden.
 */

import { prisma } from '@/app/lib/prisma';
import { generateEmbedding } from './embeddings';

export interface PolicyResult {
  id: string;
  policyId: string;
  content: string;
  similarity: number;
  metadata: {
    policyNumber: string;
    userName: string;
    companyName: string | null;
    status: string;
  };
}

export interface WebResult {
  id: string;
  sourceUrl: string;
  title: string;
  content: string;
  similarity: number;
  metadata: {
    category: string;
  };
}

export interface LawResult {
  id: string;
  lawCode: string;
  articleNum: string;
  content: string;
  similarity: number;
  sourceUrl: string;
}

export interface SearchResults {
  policies: PolicyResult[];
  webContent: WebResult[];
  laws: LawResult[];
}

export async function searchPolicies(query: string): Promise<PolicyResult[]> {
  try {
    const embedding = await generateEmbedding(query);
    const embeddingVector = `[${embedding.join(',')}]`;
    const matchCount = 5;

    const rows = await prisma.$queryRawUnsafe<{
      id: string;
      policyId: string;
      content: string;
      similarity: number;
      metadata: any;
    }[]>(
      `
      SELECT
        id,
        policy_id AS "policyId",
        content,
        1 - (embedding <=> $1::vector) AS similarity,
        metadata
      FROM policy_chunks
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> $1::vector
      LIMIT $2
      `,
      embeddingVector,
      matchCount,
    );

    return rows || [];
  } catch (error) {
    console.error('[Policy Search] Error:', error);
    return [];
  }
}

export async function searchWebContent(query: string): Promise<WebResult[]> {
  try {
    const embedding = await generateEmbedding(query);
    const embeddingVector = `[${embedding.join(',')}]`;
    const threshold = 0.75;
    const matchCount = 10;

    const rows = await prisma.$queryRawUnsafe<{
      id: string;
      source_url: string;
      title: string | null;
      content: string;
      similarity: number;
    }[]>(
      `
      SELECT
        id,
        source_url,
        title,
        content,
        1 - (embedding <=> $1::vector) AS similarity
      FROM web_chunks
      WHERE embedding IS NOT NULL
        AND 1 - (embedding <=> $1::vector) > $2
      ORDER BY embedding <=> $1::vector
      LIMIT $3
      `,
      embeddingVector,
      threshold,
      matchCount,
    );

    return (
      rows?.map(row => ({
        id: row.id,
        sourceUrl: row.source_url,
        title: row.title ?? '',
        content: row.content,
        similarity: row.similarity,
        metadata: {
          category: 'Allgemein',
        },
      })) || []
    );
  } catch (error) {
    console.error('[Web Search] Error:', error);
    return [];
  }
}

export async function searchLaws(query: string): Promise<LawResult[]> {
  try {
    const embedding = await generateEmbedding(query);
    const embeddingVector = `[${embedding.join(',')}]`;
    const threshold = 0.75;
    const matchCount = 3;

    const rows = await prisma.$queryRawUnsafe<{
      id: string;
      law_code: string;
      article_num: string;
      content: string;
      similarity: number;
      source_url: string;
    }[]>(
      `
      SELECT
        id,
        law_code,
        article_num,
        content,
        1 - (embedding <=> $1::vector) AS similarity,
        source_url
      FROM law_chunks
      WHERE embedding IS NOT NULL
        AND 1 - (embedding <=> $1::vector) > $2
      ORDER BY embedding <=> $1::vector
      LIMIT $3
      `,
      embeddingVector,
      threshold,
      matchCount,
    );

    return (
      rows?.map(row => ({
        id: row.id,
        lawCode: row.law_code,
        articleNum: row.article_num,
        content: row.content,
        similarity: row.similarity,
        sourceUrl: row.source_url,
      })) || []
    );
  } catch (error) {
    console.error('[Law Search] Error:', error);
    return [];
  }
}

/**
 * Sucht parallel in allen drei Datenquellen
 */
export async function searchAll(query: string): Promise<SearchResults> {
  const [policies, webContent, laws] = await Promise.all([
    searchPolicies(query),
    searchWebContent(query),
    searchLaws(query),
  ]);

  return { policies, webContent, laws };
}
