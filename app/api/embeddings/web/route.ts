/**
 * API Route für Web Content Embedding Sync
 * Scrapt Zürich Website und synchronisiert zur Vector Database
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/lib/supabase-client';
import { scrapeZurichWebsite, chunkWebContent } from '@/app/lib/web-scraper';
import { generateEmbeddings } from '@/app/lib/embeddings';

export const runtime = 'nodejs';
export const maxDuration = 600; // 10 Minuten

export async function POST() {
  try {
    const supabase = getSupabaseAdmin();
    
    // 1. Website scrapen
    const scrapedPages = await scrapeZurichWebsite();
    console.log(`[Web Sync] Scraped ${scrapedPages.length} pages`);

    if (scrapedPages.length === 0) {
      return NextResponse.json({
        success: true,
        pagesScraped: 0,
        chunksCreated: 0,
        message: 'Keine Seiten erfolgreich gescrapt',
      });
    }

    let totalChunks = 0;

    // 2. Für jede Page: Chunking + Embeddings
    for (const page of scrapedPages) {
      const chunks = await chunkWebContent(page);
      const contents = chunks.map(c => c.content);
      const embeddings = await generateEmbeddings(contents);

      // 3. In DB speichern
      const now = new Date().toISOString();
      const records = chunks.map((chunk, i) => ({
        source_url: page.url,
        title: page.title,
        content: chunk.content,
        embedding: `[${embeddings[i].join(',')}]`,
        metadata: {
          category: page.category,
          lastScraped: page.lastScraped,
          chunkIndex: chunk.index,
        },
        created_at: now,
        updated_at: now,
      }));

      // Alte Chunks für diese URL löschen
      const { error: deleteError } = await supabase
        .from('web_chunks')
        .delete()
        .eq('source_url', page.url);

      if (deleteError) {
        console.error(`[Web Sync] Delete error for ${page.url}:`, deleteError);
      }

      // Neue Chunks einfügen
      const { error: insertError } = await supabase
        .from('web_chunks')
        .insert(records);

      if (insertError) {
        console.error(`[Web Sync] Insert error for ${page.url}:`, insertError);
        throw insertError;
      }

      totalChunks += chunks.length;
      console.log(`[Web Sync] ✓ ${page.url}: ${chunks.length} Chunks`);
    }

    console.log(`[Web Sync] ✓ ${scrapedPages.length} Seiten, ${totalChunks} Chunks synchronisiert`);

    return NextResponse.json({
      success: true,
      pagesScraped: scrapedPages.length,
      chunksCreated: totalChunks,
    });
  } catch (error) {
    console.error('[Web Sync] Error:', error);
    return NextResponse.json(
      { 
        error: 'Web sync failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
