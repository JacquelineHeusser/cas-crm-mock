/**
 * API Route für Policy Embedding Sync
 * Synchronisiert alle aktiven Policen zur Vector Database
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/lib/supabase-client';
import { getAllPoliciesForEmbedding } from '@/app/lib/policy-serializer';
import { generateEmbeddings } from '@/app/lib/embeddings';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 Minuten

export async function POST() {
  try {
    const supabase = getSupabaseAdmin();
    
    // 1. Alle Policen holen
    const policies = await getAllPoliciesForEmbedding();
    console.log(`[Policy Sync] Processing ${policies.length} policies`);

    if (policies.length === 0) {
      return NextResponse.json({
        success: true,
        policiesSynced: 0,
        message: 'Keine Policen zum Synchronisieren gefunden',
      });
    }

    // 2. Embeddings generieren (Batch)
    const contents = policies.map(p => p.content);
    const embeddings = await generateEmbeddings(contents);

    // 3. In DB speichern (Upsert)
    const now = new Date().toISOString();
    const records = policies.map((policy, i) => ({
      policy_id: policy.policyId,
      content: policy.content,
      embedding: `[${embeddings[i].join(',')}]`,
      metadata: policy.metadata,
      created_at: now,
      updated_at: now,
    }));

    // Alte Chunks löschen
    const policyIds = policies.map(p => p.policyId);
    const { error: deleteError } = await supabase
      .from('policy_chunks')
      .delete()
      .in('policy_id', policyIds);

    if (deleteError) {
      console.error('[Policy Sync] Delete error:', deleteError);
    }

    // Neue Chunks einfügen
    const { error: insertError } = await supabase
      .from('policy_chunks')
      .insert(records);

    if (insertError) {
      console.error('[Policy Sync] Insert error:', insertError);
      throw insertError;
    }

    console.log(`[Policy Sync] ✓ ${policies.length} Policen synchronisiert`);

    return NextResponse.json({
      success: true,
      policiesSynced: policies.length,
    });
  } catch (error) {
    console.error('[Policy Sync] Error:', error);
    return NextResponse.json(
      { 
        error: 'Policy sync failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
