/**
 * API Route für Law Embedding Sync
 * Scrapt Bundesgesetze und synchronisiert zur Vector Database
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/lib/supabase-client';
import { scrapeAllLaws } from '@/app/lib/law-scraper';
import { generateEmbeddings } from '@/app/lib/embeddings';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 Minuten

export async function POST() {
  try {
    const supabase = getSupabaseAdmin();
    
    // 1. Gesetze scrapen
    const articles = await scrapeAllLaws();
    console.log(`[Law Sync] Scraped ${articles.length} articles`);

    if (articles.length === 0) {
      return NextResponse.json({
        success: true,
        articlesSynced: 0,
        message: 'Keine Gesetzesartikel erfolgreich gescrapt',
      });
    }

    // 2. Embeddings generieren (Batch)
    const contents = articles.map(a => a.content);
    const embeddings = await generateEmbeddings(contents);

    // 3. In DB speichern (Upsert)
    const now = new Date().toISOString();
    const records = articles.map((article, i) => ({
      law_code: article.lawCode,
      article_num: article.articleNum,
      content: article.content,
      embedding: `[${embeddings[i].join(',')}]`,
      source_url: article.sourceUrl,
      metadata: article.metadata,
      created_at: now,
      updated_at: now,
    }));

    // Alte Artikel löschen
    const lawCodes = [...new Set(articles.map(a => a.lawCode))];
    const { error: deleteError } = await supabase
      .from('law_chunks')
      .delete()
      .in('law_code', lawCodes);

    if (deleteError) {
      console.error('[Law Sync] Delete error:', deleteError);
    }

    // Neue Artikel einfügen
    const { error: insertError } = await supabase
      .from('law_chunks')
      .insert(records);

    if (insertError) {
      console.error('[Law Sync] Insert error:', insertError);
      throw insertError;
    }

    console.log(`[Law Sync] ✓ ${articles.length} Artikel synchronisiert`);

    return NextResponse.json({
      success: true,
      articlesSynced: articles.length,
    });
  } catch (error) {
    console.error('[Law Sync] Error:', error);
    return NextResponse.json(
      { 
        error: 'Law sync failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
