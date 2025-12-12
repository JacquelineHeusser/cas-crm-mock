/**
 * Multi-Source Vector Search für Chatbot
 * Sucht parallel in Policy, Web und Law Chunks
 */

import { getSupabaseAdmin } from './supabase-client';
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
    const supabase = getSupabaseAdmin();
    const embedding = await generateEmbedding(query);
    
    const { data, error } = await supabase.rpc('match_policy_chunks', {
      query_embedding: `[${embedding.join(',')}]`,
      match_threshold: parseFloat(process.env.VECTOR_MATCH_THRESHOLD || '0.75'),
      match_count: 5,
    });

    if (error) {
      // Graceful Degradation: RPC-Funktion existiert noch nicht
      if (error.code === '42883' || error.message?.includes('does not exist')) {
        console.warn('[Policy Search] RPC function not available. Run SQL setup first.');
        return [];
      }
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('[Policy Search] Error:', error);
    return [];
  }
}

export async function searchWebContent(query: string): Promise<WebResult[]> {
  try {
    const supabase = getSupabaseAdmin();
    const embedding = await generateEmbedding(query);
    
    const { data, error } = await supabase.rpc('match_web_chunks', {
      query_embedding: `[${embedding.join(',')}]`,
      match_threshold: 0.75,
      match_count: 10,
    });

    if (error) {
      // Graceful Degradation
      if (error.code === '42883' || error.message?.includes('does not exist')) {
        console.warn('[Web Search] RPC function not available. Run SQL setup first.');
        return [];
      }
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('[Web Search] Error:', error);
    return [];
  }
}

export async function searchLaws(query: string): Promise<LawResult[]> {
  try {
    const supabase = getSupabaseAdmin();
    const embedding = await generateEmbedding(query);
    
    const { data, error } = await supabase.rpc('match_law_chunks', {
      query_embedding: `[${embedding.join(',')}]`,
      match_threshold: 0.75,
      match_count: 3,
    });

    if (error) {
      // Graceful Degradation
      if (error.code === '42883' || error.message?.includes('does not exist')) {
        console.warn('[Law Search] RPC function not available. Run SQL setup first.');
        return [];
      }
      throw error;
    }

    return data || [];
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
