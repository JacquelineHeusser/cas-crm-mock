# Versicherungs-Chatbot: Implementierungsplan

## Übersicht

Ein RAG-basierter Chatbot für das CAS CRM Mock System mit zwei Hauptfunktionen:
1. **Policen-Fragen**: Beantwortet Fragen zu bestehenden Policen aus der Datenbank
2. **Versicherungs-Informationen**: Beantwortet allgemeine Versicherungsfragen basierend auf:
   - Zürich Versicherung Website (zurich.ch)
   - Offizielle Schweizer Versicherungsgesetze (VVG, etc.)

## Architektur-Übersicht

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CHATBOT UI (/chatbot)                             │
│  - Message Input                                                     │
│  - Chat History                                                      │
│  - Source Citations (Policen-Links, Website-Links, Gesetzesartikel) │
└──────────────────────┬───────────────────────────────────────────────┘
                       │
                       │ User Query
                       ▼
        ┌──────────────────────────────────────────────────┐
        │   /api/chatbot/query (RAG Engine)                │
        │                                                   │
        │   1. Query Classification (Intent Detection)     │
        │   2. Multi-Source Vector Search                  │
        │   3. Context Building mit Citations              │
        │   4. LLM Generation mit RAG Prompt               │
        │   5. Response mit Quellenangaben                 │
        └───────────┬──────────────────┬───────────────────┘
                    │                  │
          ┌─────────▼──────┐   ┌──────▼────────────┐
          │  Supabase      │   │  LLM Service      │
          │  Vector DB     │   │  (Together.ai)    │
          │  (pgvector)    │   │                   │
          │                │   │  - Chat Model     │
          │  3 Tabellen:   │   │  - Embeddings     │
          │  - policy_chunks    │                   │
          │  - web_chunks  │   └───────────────────┘
          │  - law_chunks  │
          └────────────────┘
                    │
          ┌─────────▼──────────────────────────────┐
          │   Web Scraping & Data Processing       │
          │   - Cheerio (HTML Parsing)             │
          │   - LangChain (Text Chunking)          │
          │   - Cron Jobs (Periodisches Update)    │
          └────────────────────────────────────────┘
```

## Datenquellen

### 1. Policen-Daten (Interne Datenbank)
- **Quelle**: Prisma Database (policies, quotes, customers)
- **Update**: Real-time bei Änderungen
- **Struktur**: Serialisierte Policy-Objekte mit Metadaten

### 2. Zürich Versicherung Website
- **Basis-URL**: https://www.zurich.ch
- **Relevante Bereiche**:
  - `/de/privatkunden` - Privatversicherungen
  - `/de/geschaeftskunden` - Geschäftsversicherungen
  - `/de/services/ratgeber` - Ratgeber & FAQs
  - `/de/ueber-uns/rechtliches` - Rechtliche Informationen
- **Update**: Wöchentlich via Cron Job
- **Scraping-Methode**: Cheerio + Puppeteer (für dynamische Inhalte)

### 3. Schweizer Versicherungsgesetze
- **Quellen**:
  - Bundesgesetz über den Versicherungsvertrag (VVG): https://www.fedlex.admin.ch/eli/cc/24/233_245_233
  - Versicherungsaufsichtsgesetz (VAG): https://www.fedlex.admin.ch/eli/cc/2015/587
- **Update**: Monatlich (Gesetze ändern sich selten)
- **Struktur**: Artikel-basiert mit Paragraphen-Nummern

## Technologie-Stack

### Neue Dependencies
```bash
npm install cheerio puppeteer axios node-cron
```

### Komponenten
- **Web Scraping**: Cheerio (statisch), Puppeteer (dynamisch)
- **Scheduling**: node-cron
- **Text Processing**: LangChain RecursiveCharacterTextSplitter
- **Vector DB**: Supabase pgvector (bereits vorhanden)
- **Embeddings**: Together.ai multilingual-e5-large-instruct
- **LLM**: Together.ai Llama-3.3-70B-Instruct-Turbo

## Implementierungs-Phasen

---

## Phase 1: Architektur & Konzept (1-2 Stunden)

### Schritt 1.1: Prisma Schema erweitern
**Datei**: `prisma/schema.prisma`

Neue Modelle hinzufügen:

```prisma
// =====================================================
// CHATBOT VECTOR TABLES
// =====================================================

// Policen-Chunks für RAG
model PolicyChunk {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  policyId   String   @map("policy_id") @db.Uuid
  content    String   @db.Text
  embedding  Unsupported("vector(1024)")?
  metadata   Json?    // { policyNumber, customerName, type, status }
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt  DateTime @updatedAt @map("updated_at") @db.Timestamptz(3)

  policy Policy @relation(fields: [policyId], references: [id], onDelete: Cascade)

  @@index([policyId])
  @@map("policy_chunks")
}

// Web-Content Chunks (Zürich Website)
model WebChunk {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  sourceUrl  String   @map("source_url") @db.Text
  title      String?  @db.VarChar(500)
  content    String   @db.Text
  embedding  Unsupported("vector(1024)")?
  metadata   Json?    // { category, lastScraped, contentType }
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt  DateTime @updatedAt @map("updated_at") @db.Timestamptz(3)

  @@unique([sourceUrl])
  @@index([sourceUrl])
  @@map("web_chunks")
}

// Gesetzes-Chunks (VVG, VAG)
model LawChunk {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  lawCode    String   @map("law_code") @db.VarChar(20)  // VVG, VAG
  articleNum String   @map("article_num") @db.VarChar(20)  // Art. 1, Art. 2a
  content    String   @db.Text
  embedding  Unsupported("vector(1024)")?
  sourceUrl  String   @map("source_url") @db.Text
  metadata   Json?    // { title, section, effectiveDate }
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt  DateTime @updatedAt @map("updated_at") @db.Timestamptz(3)

  @@unique([lawCode, articleNum])
  @@index([lawCode, articleNum])
  @@map("law_chunks")
}

// Policy Model erweitern
model Policy {
  // ... bestehende Felder ...
  
  policyChunks PolicyChunk[]  // NEU
  
  // ... restliche Felder ...
}
```

**Ausführen**:
```bash
npx prisma db push --force-reset
npx prisma db seed
```

### Schritt 1.2: Vector Indizes erstellen
**Datei**: `scripts/chatbot_vector_setup.sql`

SQL im Supabase Dashboard ausführen:

```sql
-- HNSW Indizes für schnelle Vektorsuche
CREATE INDEX IF NOT EXISTS policy_chunks_embedding_idx 
ON policy_chunks USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS web_chunks_embedding_idx 
ON web_chunks USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS law_chunks_embedding_idx 
ON law_chunks USING hnsw (embedding vector_cosine_ops);

-- RPC Function: Policy Search
CREATE OR REPLACE FUNCTION match_policy_chunks(
  query_embedding vector(1024),
  match_threshold float DEFAULT 0.75,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  policy_id uuid,
  content text,
  similarity float,
  metadata jsonb
)
LANGUAGE sql STABLE
AS $$
  SELECT 
    id,
    policy_id,
    content,
    1 - (embedding <=> query_embedding) AS similarity,
    metadata
  FROM policy_chunks
  WHERE embedding IS NOT NULL
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding ASC
  LIMIT LEAST(match_count, 20);
$$;

-- RPC Function: Web Content Search
CREATE OR REPLACE FUNCTION match_web_chunks(
  query_embedding vector(1024),
  match_threshold float DEFAULT 0.75,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  source_url text,
  title text,
  content text,
  similarity float,
  metadata jsonb
)
LANGUAGE sql STABLE
AS $$
  SELECT 
    id,
    source_url,
    title,
    content,
    1 - (embedding <=> query_embedding) AS similarity,
    metadata
  FROM web_chunks
  WHERE embedding IS NOT NULL
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding ASC
  LIMIT LEAST(match_count, 10);
$$;

-- RPC Function: Law Search
CREATE OR REPLACE FUNCTION match_law_chunks(
  query_embedding vector(1024),
  match_threshold float DEFAULT 0.75,
  match_count int DEFAULT 3
)
RETURNS TABLE (
  id uuid,
  law_code text,
  article_num text,
  content text,
  similarity float,
  source_url text,
  metadata jsonb
)
LANGUAGE sql STABLE
AS $$
  SELECT 
    id,
    law_code,
    article_num,
    content,
    1 - (embedding <=> query_embedding) AS similarity,
    source_url,
    metadata
  FROM law_chunks
  WHERE embedding IS NOT NULL
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding ASC
  LIMIT LEAST(match_count, 5);
$$;
```

### Schritt 1.3: Environment Variables ergänzen
**Datei**: `.env` (manuell bearbeiten)

```bash
# ==================== CHATBOT CONFIG ====================

# Web Scraping
SCRAPING_USER_AGENT=Mozilla/5.0 (compatible; CAS-CRM-Bot/1.0)
SCRAPING_RATE_LIMIT_MS=2000  # 2 Sekunden zwischen Requests

# Zürich Website Base URL
ZURICH_BASE_URL=https://www.zurich.ch

# Cron Schedule (Wöchentlich Sonntag 2 Uhr)
WEB_SCRAPING_CRON=0 2 * * 0

# Query Classification Threshold
INTENT_CONFIDENCE_THRESHOLD=0.7
```

---

## Phase 2: Datenquellen & Web Scraping (3-4 Stunden)

### Schritt 2.1: Policy Serializer
**Datei**: `app/lib/policy-serializer.ts`

```typescript
/**
 * Serialisiert Policy-Daten zu natürlichem Text für Embeddings
 */

import { prisma } from '@/app/lib/prisma';

export interface SerializedPolicy {
  policyId: string;
  content: string;
  metadata: {
    policyNumber: string;
    customerName: string;
    type: string;
    status: string;
    premium: number;
    startDate: string;
    endDate: string;
  };
}

export async function serializePolicy(policyId: string): Promise<SerializedPolicy> {
  const policy = await prisma.policy.findUnique({
    where: { id: policyId },
    include: {
      customer: true,
      quote: true,
    },
  });

  if (!policy) {
    throw new Error(`Policy ${policyId} not found`);
  }

  // Natürlicher deutscher Text
  const content = `
Police Nummer: ${policy.policyNumber}
Kunde: ${policy.customer.displayName}
Versicherungstyp: ${policy.type}
Status: ${policy.status}
Prämie: CHF ${policy.premium} pro ${policy.paymentFrequency}
Deckungssumme: CHF ${policy.coverageAmount}
Laufzeit: ${new Date(policy.startDate).toLocaleDateString('de-CH')} bis ${new Date(policy.endDate).toLocaleDateString('de-CH')}
Selbstbehalt: CHF ${policy.deductible || 0}
${policy.notes ? `Notizen: ${policy.notes}` : ''}
  `.trim();

  return {
    policyId: policy.id,
    content,
    metadata: {
      policyNumber: policy.policyNumber,
      customerName: policy.customer.displayName,
      type: policy.type,
      status: policy.status,
      premium: policy.premium,
      startDate: policy.startDate.toISOString(),
      endDate: policy.endDate.toISOString(),
    },
  };
}

export async function getAllPoliciesForEmbedding() {
  const policies = await prisma.policy.findMany({
    where: {
      status: { not: 'CANCELLED' },
    },
    include: {
      customer: true,
    },
  });

  return Promise.all(
    policies.map(p => serializePolicy(p.id))
  );
}
```

### Schritt 2.2: Web Scraper für Zürich Website
**Datei**: `app/lib/web-scraper.ts`

```typescript
/**
 * Web Scraper für Zürich Versicherung Website
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export interface ScrapedContent {
  url: string;
  title: string;
  content: string;
  category: string;
  lastScraped: string;
}

const ZURICH_BASE_URL = process.env.ZURICH_BASE_URL || 'https://www.zurich.ch';
const USER_AGENT = process.env.SCRAPING_USER_AGENT || 'Mozilla/5.0';
const RATE_LIMIT = parseInt(process.env.SCRAPING_RATE_LIMIT_MS || '2000');

// Relevante URL-Patterns
const SCRAPING_TARGETS = [
  '/de/privatkunden/hausrat',
  '/de/privatkunden/haftpflicht',
  '/de/privatkunden/auto',
  '/de/privatkunden/leben',
  '/de/geschaeftskunden/betriebshaftpflicht',
  '/de/geschaeftskunden/gebaeudeversicherung',
  '/de/services/ratgeber',
];

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function scrapePage(url: string): Promise<ScrapedContent | null> {
  try {
    console.log(`[Scraper] Fetching: ${url}`);
    
    const response = await axios.get(url, {
      headers: { 'User-Agent': USER_AGENT },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    // Entferne Skripte, Styles, Navigation
    $('script, style, nav, header, footer, .cookie-banner').remove();

    // Extrahiere Hauptinhalt
    const title = $('h1').first().text().trim() || $('title').text().trim();
    const mainContent = $('main, article, .content').text().trim();

    if (!mainContent || mainContent.length < 100) {
      console.warn(`[Scraper] Zu wenig Content auf ${url}`);
      return null;
    }

    // Kategorie aus URL ableiten
    const category = url.includes('/privatkunden') ? 'Privatkunden' :
                     url.includes('/geschaeftskunden') ? 'Geschäftskunden' :
                     url.includes('/ratgeber') ? 'Ratgeber' : 'Allgemein';

    return {
      url,
      title,
      content: mainContent,
      category,
      lastScraped: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`[Scraper] Error fetching ${url}:`, error);
    return null;
  }
}

export async function scrapeZurichWebsite(): Promise<ScrapedContent[]> {
  const results: ScrapedContent[] = [];

  for (const path of SCRAPING_TARGETS) {
    const url = `${ZURICH_BASE_URL}${path}`;
    const content = await scrapePage(url);
    
    if (content) {
      results.push(content);
    }

    // Rate Limiting
    await delay(RATE_LIMIT);
  }

  console.log(`[Scraper] Scraped ${results.length} pages`);
  return results;
}

export async function chunkWebContent(content: ScrapedContent): Promise<Array<{
  content: string;
  index: number;
}>> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await splitter.splitText(content.content);

  return chunks.map((chunk, index) => ({
    content: `${content.title}\n\n${chunk}`,
    index,
  }));
}
```

### Schritt 2.3: Law Scraper für Bundesgesetze
**Datei**: `app/lib/law-scraper.ts`

```typescript
/**
 * Scraper für Schweizer Versicherungsgesetze (fedlex.admin.ch)
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

export interface LawArticle {
  lawCode: string;
  articleNum: string;
  content: string;
  sourceUrl: string;
  metadata: {
    title: string;
    section?: string;
  };
}

const LAW_SOURCES = [
  {
    code: 'VVG',
    name: 'Versicherungsvertragsgesetz',
    url: 'https://www.fedlex.admin.ch/eli/cc/24/233_245_233/de',
  },
  {
    code: 'VAG',
    name: 'Versicherungsaufsichtsgesetz',
    url: 'https://www.fedlex.admin.ch/eli/cc/2015/587/de',
  },
];

export async function scrapeLaw(lawCode: string, url: string): Promise<LawArticle[]> {
  try {
    console.log(`[Law Scraper] Fetching ${lawCode} from ${url}`);
    
    const response = await axios.get(url, { timeout: 15000 });
    const $ = cheerio.load(response.data);

    const articles: LawArticle[] = [];

    // Fedlex-Struktur: Artikel sind in <div class="article">
    $('.article').each((_, element) => {
      const $article = $(element);
      
      // Artikel-Nummer extrahieren (z.B. "Art. 1")
      const articleNum = $article.find('.article-number').text().trim();
      
      // Artikel-Inhalt
      const content = $article.find('.article-content').text().trim();
      
      // Titel (optional)
      const title = $article.find('.article-title').text().trim();

      if (articleNum && content) {
        articles.push({
          lawCode,
          articleNum,
          content: `${articleNum} ${title}\n\n${content}`,
          sourceUrl: url,
          metadata: {
            title,
          },
        });
      }
    });

    console.log(`[Law Scraper] Extracted ${articles.length} articles from ${lawCode}`);
    return articles;
  } catch (error) {
    console.error(`[Law Scraper] Error scraping ${lawCode}:`, error);
    return [];
  }
}

export async function scrapeAllLaws(): Promise<LawArticle[]> {
  const allArticles: LawArticle[] = [];

  for (const law of LAW_SOURCES) {
    const articles = await scrapeLaw(law.code, law.url);
    allArticles.push(...articles);
    
    // Rate Limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  return allArticles;
}
```

### Schritt 2.4: Embedding Sync API Routes

**Datei**: `app/api/embeddings/policies/route.ts`

```typescript
/**
 * API Route für Policy Embedding Sync
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/lib/supabase-client';
import { getAllPoliciesForEmbedding } from '@/app/lib/policy-serializer';
import { generateEmbeddings } from '@/app/lib/embeddings';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST() {
  try {
    const supabase = getSupabaseAdmin();
    
    // 1. Alle Policen holen
    const policies = await getAllPoliciesForEmbedding();
    console.log(`[Policy Sync] Processing ${policies.length} policies`);

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

    const { error } = await supabase
      .from('policy_chunks')
      .upsert(records, { onConflict: 'policy_id' });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      policiesSynced: policies.length,
    });
  } catch (error) {
    console.error('[Policy Sync] Error:', error);
    return NextResponse.json(
      { error: 'Policy sync failed' },
      { status: 500 }
    );
  }
}
```

**Datei**: `app/api/embeddings/web/route.ts`

```typescript
/**
 * API Route für Web Content Embedding Sync
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
      await supabase
        .from('web_chunks')
        .delete()
        .eq('source_url', page.url);

      // Neue Chunks einfügen
      const { error } = await supabase
        .from('web_chunks')
        .insert(records);

      if (error) throw error;

      totalChunks += chunks.length;
    }

    return NextResponse.json({
      success: true,
      pagesScraped: scrapedPages.length,
      chunksCreated: totalChunks,
    });
  } catch (error) {
    console.error('[Web Sync] Error:', error);
    return NextResponse.json(
      { error: 'Web sync failed' },
      { status: 500 }
    );
  }
}
```

**Datei**: `app/api/embeddings/laws/route.ts`

```typescript
/**
 * API Route für Law Embedding Sync
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/lib/supabase-client';
import { scrapeAllLaws } from '@/app/lib/law-scraper';
import { generateEmbeddings } from '@/app/lib/embeddings';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST() {
  try {
    const supabase = getSupabaseAdmin();
    
    // 1. Gesetze scrapen
    const articles = await scrapeAllLaws();
    console.log(`[Law Sync] Scraped ${articles.length} articles`);

    // 2. Embeddings generieren
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

    const { error } = await supabase
      .from('law_chunks')
      .upsert(records, { onConflict: 'law_code,article_num' });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      articlesSynced: articles.length,
    });
  } catch (error) {
    console.error('[Law Sync] Error:', error);
    return NextResponse.json(
      { error: 'Law sync failed' },
      { status: 500 }
    );
  }
}
```

---

## Phase 3: Vector Search & Query Classification (2-3 Stunden)

### Schritt 3.1: Multi-Source Vector Search
**Datei**: `app/lib/chatbot-search.ts`

```typescript
/**
 * Multi-Source Vector Search für Chatbot
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
    customerName: string;
    type: string;
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
      if (error.code === '42883') {
        console.warn('[Policy Search] RPC function not available');
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
      if (error.code === '42883') {
        console.warn('[Web Search] RPC function not available');
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
      if (error.code === '42883') {
        console.warn('[Law Search] RPC function not available');
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

export async function searchAll(query: string): Promise<SearchResults> {
  const [policies, webContent, laws] = await Promise.all([
    searchPolicies(query),
    searchWebContent(query),
    searchLaws(query),
  ]);

  return { policies, webContent, laws };
}
```

### Schritt 3.2: Intent Classification
**Datei**: `app/lib/intent-classifier.ts`

```typescript
/**
 * Query Intent Classification
 * Bestimmt, ob User nach Policen oder allgemeinen Infos fragt
 */

export type QueryIntent = 'policy' | 'general' | 'mixed';

export interface ClassificationResult {
  intent: QueryIntent;
  confidence: number;
  reasoning: string;
}

// Keywords für Policy-Fragen
const POLICY_KEYWORDS = [
  'police',
  'policen',
  'versicherung',
  'prämie',
  'deckung',
  'selbstbehalt',
  'kunde',
  'vertrag',
  'laufzeit',
  'kündigung',
];

// Keywords für allgemeine Fragen
const GENERAL_KEYWORDS = [
  'was ist',
  'wie funktioniert',
  'erklären',
  'unterschied',
  'arten von',
  'welche',
  'warum',
  'gesetz',
  'rechtlich',
  'vvg',
  'vag',
];

export function classifyIntent(query: string): ClassificationResult {
  const lowerQuery = query.toLowerCase();
  
  // Zähle Keyword-Matches
  const policyMatches = POLICY_KEYWORDS.filter(kw => lowerQuery.includes(kw)).length;
  const generalMatches = GENERAL_KEYWORDS.filter(kw => lowerQuery.includes(kw)).length;
  
  // Spezifische Muster
  const hasPolicyNumber = /\d{4,}/.test(query); // Policen-Nummer
  const hasCustomerName = /kunde|herr|frau/i.test(query);
  const isQuestion = /\?|was|wie|warum|wann|wo|welche/i.test(query);
  
  // Scoring
  let policyScore = policyMatches * 2;
  let generalScore = generalMatches * 2;
  
  if (hasPolicyNumber) policyScore += 5;
  if (hasCustomerName) policyScore += 3;
  if (isQuestion) generalScore += 1;
  
  // Entscheidung
  const total = policyScore + generalScore;
  
  if (total === 0) {
    return {
      intent: 'general',
      confidence: 0.5,
      reasoning: 'Keine klaren Indikatoren gefunden',
    };
  }
  
  const policyConfidence = policyScore / total;
  const generalConfidence = generalScore / total;
  
  if (policyConfidence > 0.7) {
    return {
      intent: 'policy',
      confidence: policyConfidence,
      reasoning: 'Query enthält Policy-spezifische Begriffe',
    };
  }
  
  if (generalConfidence > 0.7) {
    return {
      intent: 'general',
      confidence: generalConfidence,
      reasoning: 'Query ist eine allgemeine Frage',
    };
  }
  
  return {
    intent: 'mixed',
    confidence: Math.max(policyConfidence, generalConfidence),
    reasoning: 'Query enthält sowohl Policy- als auch allgemeine Elemente',
  };
}
```

---

## Phase 4: RAG Query Engine (2-3 Stunden)

### Schritt 4.1: Chatbot Query API
**Datei**: `app/api/chatbot/query/route.ts`

```typescript
/**
 * Chatbot Query API mit RAG
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { searchAll } from '@/app/lib/chatbot-search';
import { classifyIntent } from '@/app/lib/intent-classifier';
import { getChatCompletion } from '@/app/lib/ai';

const QuerySchema = z.object({
  query: z.string().min(1).max(1000),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, conversationHistory = [] } = QuerySchema.parse(body);

    console.log('[Chatbot] Query:', query);

    // 1. Intent Classification
    const classification = classifyIntent(query);
    console.log('[Chatbot] Intent:', classification);

    // 2. Multi-Source Vector Search
    const searchResults = await searchAll(query);
    console.log('[Chatbot] Search Results:', {
      policies: searchResults.policies.length,
      webContent: searchResults.webContent.length,
      laws: searchResults.laws.length,
    });

    // 3. Context Building
    const context = buildContext(searchResults, classification.intent);

    // 4. RAG Prompt
    const systemPrompt = `Du bist ein hilfreicher Versicherungs-Assistent für die Zürich Versicherung.

WICHTIGE REGELN:
1. Beantworte Fragen präzise und verständlich auf Deutsch
2. Nutze IMMER die bereitgestellten Quellen als Basis für deine Antworten
3. Wenn du Informationen von der Zürich Website verwendest, gib die Quelle an
4. Wenn du Gesetzesartikel zitierst, nenne den Artikel und das Gesetz
5. Bei Policy-Fragen: Beziehe dich auf die konkreten Daten aus der Datenbank
6. Wenn keine relevanten Informationen verfügbar sind, sage das ehrlich

${context}`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory,
      { role: 'user' as const, content: query },
    ];

    // 5. LLM Generation
    const answer = await getChatCompletion(messages);

    // 6. Citations extrahieren
    const citations = extractCitations(searchResults);

    return NextResponse.json({
      answer,
      citations,
      intent: classification.intent,
      sources: {
        policies: searchResults.policies.length,
        webContent: searchResults.webContent.length,
        laws: searchResults.laws.length,
      },
    });
  } catch (error) {
    console.error('[Chatbot] Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Query failed' },
      { status: 500 }
    );
  }
}

function buildContext(results: any, intent: string): string {
  let context = '';

  // Policy Context
  if (results.policies.length > 0) {
    context += '\n\nRELEVANTE POLICEN:\n';
    results.policies.forEach((p: any, i: number) => {
      context += `\n[Police ${i + 1}] ${p.metadata.policyNumber}\n`;
      context += `Kunde: ${p.metadata.customerName}\n`;
      context += `Typ: ${p.metadata.type}\n`;
      context += `Details: ${p.content}\n`;
    });
  }

  // Web Content Context
  if (results.webContent.length > 0) {
    context += '\n\nINFORMATIONEN VON ZURICH.CH:\n';
    results.webContent.forEach((w: any, i: number) => {
      context += `\n[Quelle ${i + 1}] ${w.title}\n`;
      context += `URL: ${w.sourceUrl}\n`;
      context += `Inhalt: ${w.content}\n`;
    });
  }

  // Law Context
  if (results.laws.length > 0) {
    context += '\n\nRELEVANTE GESETZESARTIKEL:\n';
    results.laws.forEach((l: any, i: number) => {
      context += `\n[${l.lawCode} ${l.articleNum}]\n`;
      context += `${l.content}\n`;
      context += `Quelle: ${l.sourceUrl}\n`;
    });
  }

  return context;
}

function extractCitations(results: any) {
  const citations = [];

  // Policy Citations
  results.policies.forEach((p: any) => {
    citations.push({
      type: 'policy',
      title: `Police ${p.metadata.policyNumber}`,
      url: `/policen/${p.policyId}`,
      metadata: p.metadata,
    });
  });

  // Web Citations
  results.webContent.forEach((w: any) => {
    citations.push({
      type: 'web',
      title: w.title,
      url: w.sourceUrl,
      category: w.metadata.category,
    });
  });

  // Law Citations
  results.laws.forEach((l: any) => {
    citations.push({
      type: 'law',
      title: `${l.lawCode} ${l.articleNum}`,
      url: l.sourceUrl,
      lawCode: l.lawCode,
    });
  });

  return citations;
}
```

---

## Phase 5: Chatbot UI (2-3 Stunden)

### Schritt 5.1: Chat Interface Component
**Datei**: `components/ChatInterface.tsx`

```typescript
'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Loader2, ExternalLink } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

interface Citation {
  type: 'policy' | 'web' | 'law';
  title: string;
  url: string;
  metadata?: any;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chatbot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: input,
          conversationHistory: messages,
        }),
      });

      const data = await res.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer,
        citations: data.citations,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Entschuldigung, es ist ein Fehler aufgetreten.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl rounded-lg p-4 ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-content'
                  : 'bg-base-200'
              }`}
            >
              <ReactMarkdown className="prose prose-sm">
                {msg.content}
              </ReactMarkdown>

              {/* Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-base-300">
                  <p className="text-xs font-semibold mb-2">Quellen:</p>
                  <div className="space-y-1">
                    {msg.citations.map((cite, j) => (
                      <a
                        key={j}
                        href={cite.url}
                        target={cite.type === 'web' || cite.type === 'law' ? '_blank' : undefined}
                        rel={cite.type === 'web' || cite.type === 'law' ? 'noopener noreferrer' : undefined}
                        className="flex items-center gap-2 text-xs hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>{cite.title}</span>
                        {cite.type === 'web' && (
                          <span className="badge badge-xs">{cite.metadata?.category}</span>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-base-200 rounded-lg p-4">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-base-300">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Stelle eine Frage zu Policen oder Versicherungen..."
            className="input input-bordered flex-1"
            disabled={loading}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !input.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
```

### Schritt 5.2: Chatbot Page
**Datei**: `app/chatbot/page.tsx`

```typescript
import ChatInterface from '@/components/ChatInterface';
import { RefreshCw } from 'lucide-react';

export default function ChatbotPage() {
  return (
    <div className="container mx-auto p-6 h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Versicherungs-Assistent</h1>
          <p className="text-base-content/70 mt-1">
            Fragen zu Policen, Versicherungen und rechtlichen Grundlagen
          </p>
        </div>

        <div className="flex gap-2">
          <SyncButton endpoint="/api/embeddings/policies" label="Policen" />
          <SyncButton endpoint="/api/embeddings/web" label="Website" />
          <SyncButton endpoint="/api/embeddings/laws" label="Gesetze" />
        </div>
      </div>

      <div className="flex-1 bg-base-100 rounded-lg shadow-lg overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
}

function SyncButton({ endpoint, label }: { endpoint: string; label: string }) {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();
      alert(`${label} synchronisiert: ${JSON.stringify(data)}`);
    } catch (error) {
      alert(`Fehler beim Sync: ${error}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={syncing}
      className="btn btn-sm btn-outline"
    >
      <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
      {label}
    </button>
  );
}
```

---

## Phase 6: Testing & Deployment (1-2 Stunden)

### Schritt 6.1: Initiales Daten-Seeding

**Manuell ausführen**:

```bash
# 1. Policen syncen
curl -X POST http://localhost:3000/api/embeddings/policies

# 2. Website scrapen & syncen (dauert ~5 Min)
curl -X POST http://localhost:3000/api/embeddings/web

# 3. Gesetze scrapen & syncen
curl -X POST http://localhost:3000/api/embeddings/laws
```

### Schritt 6.2: Test-Queries

**Test 1: Policy-Frage**
```
Query: "Welche Policen hat Kunde Max Mustermann?"
Erwartung: Policen aus policy_chunks mit Similarity > 0.75
```

**Test 2: Allgemeine Frage**
```
Query: "Was ist eine Hausratversicherung?"
Erwartung: Web-Content von zurich.ch/hausrat
```

**Test 3: Rechtliche Frage**
```
Query: "Was sagt das VVG zur Kündigungsfrist?"
Erwartung: Relevante VVG-Artikel
```

**Test 4: Mixed Intent**
```
Query: "Ist meine Police gemäss VVG korrekt?"
Erwartung: Policy-Daten + VVG-Artikel
```

### Schritt 6.3: Cron Job Setup (Optional)

**Datei**: `app/api/cron/scrape-web/route.ts`

```typescript
/**
 * Cron Job für wöchentliches Web Scraping
 * Vercel Cron: https://vercel.com/docs/cron-jobs
 */

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Verify Cron Secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Trigger Web Scraping
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/embeddings/web`, {
      method: 'POST',
    });

    const data = await res.json();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result: data,
    });
  } catch (error) {
    console.error('[Cron] Web scraping failed:', error);
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    );
  }
}
```

**Vercel Cron Config** (`vercel.json`):

```json
{
  "crons": [{
    "path": "/api/cron/scrape-web",
    "schedule": "0 2 * * 0"
  }]
}
```

---

## Zusammenfassung

### Was wurde implementiert:

1. **3 Datenquellen**:
   - Policen aus Datenbank
   - Zürich Website (zurich.ch)
   - Schweizer Versicherungsgesetze (VVG, VAG)

2. **Vector Search**:
   - 3 separate Tabellen mit pgvector
   - HNSW-Indizes für Performance
   - RPC Functions für Similarity Search

3. **RAG Engine**:
   - Intent Classification
   - Multi-Source Context Building
   - LLM Generation mit Citations

4. **UI**:
   - Chat Interface mit Markdown-Support
   - Source Citations mit Links
   - Sync-Buttons für manuelle Updates

### Nächste Schritte:

1. **Initiales Seeding** durchführen (alle 3 Sync-Endpoints)
2. **Test-Queries** ausführen und Qualität prüfen
3. **Threshold-Tuning** für optimale Similarity-Scores
4. **Cron Jobs** für automatisches Update einrichten
5. **Monitoring** für Scraping-Fehler implementieren

### Wichtige Hinweise:

- **Rate Limiting**: Web Scraping respektiert 2-Sekunden-Delay
- **Error Handling**: Graceful Degradation bei fehlenden Daten
- **Citations**: Immer Quellen angeben für Transparenz
- **Kosten**: Embedding-Generierung bei Together.ai ist günstig (~$0.0001/1K tokens)
