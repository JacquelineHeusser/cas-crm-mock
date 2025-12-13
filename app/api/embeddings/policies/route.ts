/**
 * API Route für Policy Embedding Sync
 * Synchronisiert alle aktiven Policen zur Vector Database
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getAllPoliciesForEmbedding } from '@/app/lib/policy-serializer';
import { generateEmbeddings } from '@/app/lib/embeddings';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 Minuten

export async function POST() {
  try {
    // 1. Alle Policen holen (über Prisma)
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

    // 3. In DB speichern (Delete + Insert über Prisma Raw SQL)
    const policyIds = policies.map(p => p.policyId);

    // Alte Chunks löschen
    await prisma.$executeRawUnsafe(
      `DELETE FROM policy_chunks WHERE policy_id = ANY($1::text[])`,
      policyIds,
    );

    // Neue Chunks einfügen
    for (let i = 0; i < policies.length; i++) {
      const policy = policies[i];
      const embedding = embeddings[i];
      const embeddingVector = `[${embedding.join(',')}]`;

      await prisma.$executeRawUnsafe(
        `
        INSERT INTO policy_chunks
          (policy_id, content, embedding, chunk_index, metadata, created_at, updated_at)
        VALUES
          ($1, $2, $3::vector, 0, $4::jsonb, NOW(), NOW())
        `,
        policy.policyId,
        policy.content,
        embeddingVector,
        JSON.stringify(policy.metadata),
      );
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
