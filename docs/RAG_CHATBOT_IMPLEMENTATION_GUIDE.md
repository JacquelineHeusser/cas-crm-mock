# RAG-Chatbot mit Supabase Vector: Implementierungsanleitung

Diese Anleitung beschreibt die Implementierung eines RAG-basierten Chatbots mit Zugriff auf PDF-Dokumente und CRM-Daten.

> **⚠️ Voraussetzung:**
> Diese Anleitung baut auf der [LLM_API_IMPLEMENTATION_GUIDE.md](./LLM_API_IMPLEMENTATION_GUIDE.md) auf.
> Die dort beschriebenen Components (`app/lib/ai.ts`, Environment Variables, Dependencies) werden vorausgesetzt.

## 📋 Inhaltsverzeichnis

1. [Architektur-Übersicht](#architektur-übersicht)
2. [Technologie-Stack](#technologie-stack)
3. [Dependencies](#dependencies)
4. [Dateistruktur](#dateistruktur)
5. [Implementierungs-Reihenfolge](#implementierungs-reihenfolge)
6. [Voraussetzungen](#voraussetzungen)
7. [Automatisierte Tests](#automatisierte-tests)
8. [Manuelle Tests](#manuelle-tests)

---

## Architektur-Übersicht

Der RAG-Chatbot kombiniert Vektor-Suche mit LLM-generierten Antworten:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CHATBOT UI                                   │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Chat Interface (app/chatbot/page.tsx)                         │ │
│  │  - Message Input                                                │ │
│  │  - Chat History                                                 │ │
│  │  - Source Citations (PDF Links, Customer/Event Links)          │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────┬───────────────────────────────────────────────┘
                       │
                       │ Query
                       ▼
        ┌──────────────────────────────────────────────────┐
        │   /api/chatbot/query (Route Handler)             │
        │                                                   │
        │   1. Create embedding for user query             │
        │   2. Search vector DB (pdfs + crm data)          │
        │   3. Retrieve top-k similar chunks               │
        │   4. Build context with sources                  │
        │   5. Call LLM with RAG prompt                    │
        │   6. Return answer + citations                   │
        └───────────┬──────────────────┬───────────────────┘
                    │                  │
          ┌─────────▼──────┐   ┌──────▼────────────┐
          │  Supabase      │   │  LLM Service      │
          │  Vector DB     │   │  (lib/ai.ts)      │
          │  (pgvector)    │   │                   │
          │                │   │  - Chat Model     │
          │  - pdf_chunks  │   │  - Embeddings     │
          │  - crm_chunks  │   └───────────────────┘
          └────────────────┘           │
                    │                  │
          ┌─────────▼──────────────────▼───────────┐
          │   LangChain (Text Processing)          │
          │   - RecursiveCharacterTextSplitter     │
          │   - Text Chunking mit Overlap          │
          └────────────────────────────────────────┘
```

### Komponentenbeschreibung

| Komponente | Beschreibung |
|------------|-------------|
| **Chat Interface** | React-basierte UI-Komponente für Benutzereingaben, Chatverlauf und Quellenangaben |
| **Route Handler** | Next.js API-Route, die den RAG-Workflow orchestriert |
| **Supabase Vector DB** | PostgreSQL-Datenbank mit pgvector-Extension für effiziente Vektorsuche |
| **LLM Service** | Abstraktionsschicht (`lib/ai.ts`) für OpenAI/Together.ai API-Calls |
| **LangChain** | Python/JS-Library für LLM-Anwendungen; hier genutzt für Text-Splitting |
| **pdf_chunks** | Tabelle mit Text-Fragmenten aus PDFs samt Embeddings |
| **crm_chunks** | Tabelle mit serialisierten CRM-Daten (Kunden, Events) samt Embeddings |

### Wichtige RAG-Konzepte

> **RAG (Retrieval-Augmented Generation)** kombiniert Information Retrieval mit generativer KI:
> Statt nur auf das Wissen des LLMs zu vertrauen, werden relevante Dokumente aus einer Datenbank
> abgerufen und als Kontext mitgegeben. So kann das LLM faktisch korrekte Antworten auf Basis
> aktueller, unternehmensspezifischer Daten liefern.

| Begriff | Erklärung |
|---------|----------|
| **Embedding** | Ein Vektor (Array von Zahlen), der die semantische Bedeutung eines Textes repräsentiert. Ähnliche Texte haben ähnliche Vektoren (kleiner Abstand im Vektorraum). |
| **Chunking** | Zerlegung grosser Dokumente in kleinere Text-Fragmente (Chunks), damit jedes Fragment ein eigenes Embedding erhält. Typische Chunk-Grösse: 500–1500 Zeichen. |
| **Overlap** | Überlappung zwischen aufeinanderfolgenden Chunks (z.B. 200 Zeichen), um Kontext an den Chunk-Grenzen nicht zu verlieren. |
| **Serialisierung** | Umwandlung strukturierter Daten (z.B. Customer-Objekt) in lesbaren Text, der dann embedded werden kann. |
| **Similarity Search** | Suche nach Vektoren mit geringstem Abstand zum Query-Vektor (Cosine Similarity). |
| **Top-K** | Die K relevantesten Ergebnisse einer Vektorsuche. |
| **HNSW-Index** | Effizienter Index-Algorithmus für approximative Nearest-Neighbor-Suche in hochdimensionalen Vektorräumen. |

### RAG Use Cases

**Use Case 1: PDF Knowledge Base**
1. PDFs (Flyer, Lebensläufe, Dokumentationen) im `cas-crm-mock-files` Storage Bucket
2. Bei Upload: PDF → Text-Extraction → Chunking → Embeddings → Vector DB
3. Bei Query: Embedding → Similarity Search → Top PDFs → LLM Answer mit PDF-Link

**Use Case 2: CRM Data Knowledge Base**
1. Customer & Event Daten aus Prisma DB
2. Bei manuellem Sync: Data → Text-Serialization → Embedding → Vector DB
3. Bei Query: Embedding → Similarity Search → Top Entities → LLM Answer mit Detail-Link

### Datenfluss (RAG Query):

```
User Query
   ↓
Create Embedding (text-embedding-3-small oder multilingual-e5-large)
   ↓
Vector Similarity Search (Supabase pgvector)
   ↓
Retrieve Top-K Chunks (pdfs + crm)
   ↓
Build RAG Prompt (context + query)
   ↓
LLM Generate Answer
   ↓
Return Answer + Source Citations
```

---

## Technologie-Stack

### Neue Komponenten (zusätzlich zu LLM-Guide):

- **Supabase Vector (pgvector)**: Vector Database für Embeddings
- **@supabase/supabase-js**: JavaScript Client für Supabase
- **unpdf**: PDF Text Extraction (Server-side, Next.js-kompatibel)
- **langchain**: Text Splitting & Chunking
- **react-markdown**: Markdown-Rendering für Chatbot-Antworten
- **@tailwindcss/typography**: Prose-Klassen für formatierte Texte

### Embedding-Modelle:

| Provider | Modell | Native Dims | Sprachen | Empfehlung |
|----------|--------|-------------|----------|------------|
| **Together.ai** | **multilingual-e5-large-instruct** | **1024** | **100+ inkl. Deutsch** | ✅ **Empfohlen!** |
| OpenAI | text-embedding-3-small | 1536 (kürzbar) | 100+ inkl. Deutsch | Alternative |

---

## Dependencies

### Installation

```bash
npm install @supabase/supabase-js unpdf langchain @langchain/textsplitters react-markdown @tailwindcss/typography
```

> **Wichtig**: Verwende `unpdf` statt `pdf-parse`! Die Library `pdf-parse` 2.x verwendet einen Web Worker (`pdfjs-dist`), der serverseitig in Next.js nicht funktioniert.

### package.json Ergänzungen

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.45.0",
    "unpdf": "^0.12.0",
    "langchain": "^0.2.0",
    "@langchain/textsplitters": "^0.0.3",
    "react-markdown": "^9.0.0",
    "@tailwindcss/typography": "^0.5.0"
  }
}
```

### Environment Variables (.env)

Ergänze die bestehende `.env` um:

```bash
# ==================== EMBEDDINGS ====================

# Embedding Provider: 'openai' oder 'together'
# EMPFOHLEN: Together.ai mit multilingual-e5-large-instruct für Deutsch/Englisch
EMBEDDING_PROVIDER=together

# Modell-Auswahl je nach Provider
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
# Multilingual E5: 100 Sprachen, 1024 Dimensionen, optimiert für Retrieval
TOGETHERAI_EMBEDDING_MODEL=intfloat/multilingual-e5-large-instruct

# Embedding Dimensionen (multilingual-e5: 1024 fix, OpenAI: kürzbar)
EMBEDDING_DIMENSIONS=1024

# ==================== VECTOR SEARCH ====================

# Similarity Threshold (0-1, higher = stricter)
# Empfehlung: 0.75 für multilingual-e5-large-instruct
VECTOR_MATCH_THRESHOLD=0.75

# Max anzahl zurückgegebener Chunks
VECTOR_MATCH_COUNT=5

# Chunk-Größe für Text-Splitting
PDF_CHUNK_SIZE=1000
PDF_CHUNK_OVERLAP=200
```

---

## Dateistruktur

```
project/
├── app/
│   ├── api/
│   │   ├── chatbot/
│   │   │   └── query/
│   │   │       └── route.ts              # Chatbot Query API (RAG)
│   │   ├── embeddings/
│   │   │   ├── pdf/route.ts              # PDF Embedding Generation
│   │   │   ├── crm/route.ts              # CRM Embedding Sync
│   │   │   ├── debug/route.ts            # Debug: Embedding-Status prüfen
│   │   │   └── test-search/route.ts      # Debug: Similarity Search testen
│   │   └── files/
│   │       └── route.ts                  # File-Handler mit Auto-Embedding
│   │
│   ├── chatbot/
│   │   └── page.tsx                      # Chatbot UI Page
│   │
│   └── lib/
│   │   ├── ai.ts                         # [BEREITS VORHANDEN] OpenAI/Together.ai Clients
│   │   ├── embeddings.ts                 # Embedding Generation Logic
│   │   ├── vector-search.ts              # Vector Search Utilities
│   │   ├── pdf-processor.ts              # PDF Text Extraction & Chunking
│   │   ├── crm-serializer.ts             # CRM Data → Text Serialization
│   │   ├── supabase-client.ts            # Supabase Client Setup
│   │   └── __tests__/                    # Unit Tests
│   │       ├── embeddings.test.ts        # Embedding Service Tests
│   │       ├── pdf-processor.test.ts     # PDF Processor Tests
│   │       └── crm-serializer.test.ts    # CRM Serializer Tests
│   │
│   └── api/__tests__/                    # API Route Tests
│       └── chatbot-query.test.ts         # Chatbot Query Tests
│
├── components/
│   └── ChatInterface.tsx                 # Chat UI Component
│
├── prisma/
│   ├── schema.prisma                     # [ERWEITERT] + PdfChunk, CrmChunk Models
│   └── vector_setup.sql                  # Vector Indizes & RPC Functions
│
└── .env                                  # Environment Variables
```

---

## Implementierungs-Reihenfolge

### Mensch: Schritt 1 - pgvector Extension aktivieren und .env ergänzen

1. **Öffne Supabase Dashboard:**
   - Gehe zu deinem Projekt
   - Navigiere zu **Database** → **Extensions**
   - Suche nach "vector" und klicke auf **Enable**
   - Warte bis Status = "Active"

> **Schema-Hinweis:** Die pgvector-Extension wird standardmässig im Schema `extensions` installiert.
> Du referenzierst den Vektor-Typ dann als `extensions.vector(dims)`. In Prisma mit `Unsupported()`
> funktioniert auch `vector(dims)` direkt, da Prisma die Typen als Raw-SQL behandelt.

2. **.env ergänzen:** "Siehe oben Environment Variables (.env)"

### Mensch: Schritt 2 - Prisma Schema erweitern

Ergänze `prisma/schema.prisma` am Ende mit den Vector-Tabellen.

> **⚠️ Wichtig: Embedding-Dimensionen festlegen**
>
> Die Vektor-Dimensionen müssen **einmalig vor der Implementierung** festgelegt werden und sind
> danach nicht mehr einfach änderbar (alle Embeddings müssten neu generiert werden).
>
> Die Dimensionen hängen vom gewählten Embedding-Modell ab:
> | Provider | Modell | Dimensionen | Sprachen |
> |----------|--------|-------------|----------|
> | **Together.ai** | **multilingual-e5-large-instruct** | **1024** | ✅ 100+ inkl. Deutsch |
> | OpenAI | text-embedding-3-small | 1536 (kürzbar) | ✅ Multilingual |


**Schema-Erweiterung** (`prisma/schema.prisma`):

```prisma
// =====================================================
// VECTOR TABLES FÜR RAG CHATBOT
// =====================================================

model PdfChunk {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  fileId     String   @db.Uuid
  chunkIndex Int      @map("chunk_index")
  content    String   @db.Text
  embedding  Unsupported("vector(1024)")?  // multilingual-e5-large-instruct: 1024 Dimensionen
  tokenCount Int?     @map("token_count")
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt  DateTime @updatedAt @map("updated_at") @db.Timestamptz(3)

  // Relations
  file File @relation(fields: [fileId], references: [id], onDelete: Cascade)

  @@unique([fileId, chunkIndex])
  @@index([fileId])
  @@map("pdf_chunks")
}

model CrmChunk {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  entityType String   @map("entity_type") @db.VarChar(20)
  entityId   String   @map("entity_id") @db.Uuid
  content    String   @db.Text
  embedding  Unsupported("vector(1024)")?  // multilingual-e5-large-instruct: 1024 Dimensionen
  metadata   Json?
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt  DateTime @updatedAt @map("updated_at") @db.Timestamptz(3)

  @@unique([entityType, entityId])
  @@index([entityType, entityId])
  @@map("crm_chunks")
}

model File {
  // ... bestehende Felder ...

  // HINWEIS: Keine direkte Relation definiert, da File polymorph ist
  // (kann zu Event, Customer oder Contact gehören)
  // ABER: PdfChunks haben eine direkte Relation zu File
  pdfChunks PdfChunk[]

  // ... restliche Felder ...
}
```

Dann Schema pushen und Seed-Daten laden:

```bash
npx prisma db push --force-reset
npx prisma db seed
```


### Mensch: Schritt 3 - Vector Indizes und RPC Functions erstellen

**Ziel**: HNSW-Indizes für schnelle Vektorsuche und RPC-Functions für Similarity Search erstellen. (ist auch in scripts/vector_setup.sql aufgeführt)

**SQL im Supabase Dashboard ausführen**:

```sql
-- 0. pgvector Extension aktivieren
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. HNSW Indizes für Performance
CREATE INDEX IF NOT EXISTS pdf_chunks_embedding_idx 
ON pdf_chunks USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS crm_chunks_embedding_idx 
ON crm_chunks USING hnsw (embedding vector_cosine_ops);

-- 2. Vector Similarity Search Function (PDF)
CREATE OR REPLACE FUNCTION match_pdf_chunks(
  query_embedding vector(1024),  -- multilingual-e5-large-instruct: 1024 Dimensionen
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  "fileId" uuid,
  chunk_index int,
  content text,
  similarity float,
  "fileName" text,
  "storagePath" text
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    pc.id,
    pc."fileId",
    pc.chunk_index,
    pc.content,
    1 - (pc.embedding <=> query_embedding) AS similarity,
    f."fileName",
    f."storagePath"
  FROM pdf_chunks pc
  JOIN files f ON f.id = pc."fileId"
  WHERE pc.embedding IS NOT NULL
    AND 1 - (pc.embedding <=> query_embedding) > match_threshold
  ORDER BY pc.embedding <=> query_embedding ASC
  LIMIT LEAST(match_count, 50);
$$;

-- 3. Vector Similarity Search Function (CRM)
CREATE OR REPLACE FUNCTION match_crm_chunks(
  query_embedding vector(1024),  -- multilingual-e5-large-instruct: 1024 Dimensionen
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  entity_type text,
  entity_id uuid,
  content text,
  similarity float,
  metadata jsonb
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    id,
    entity_type,
    entity_id,
    content,
    1 - (embedding <=> query_embedding) AS similarity,
    metadata
  FROM crm_chunks
  WHERE embedding IS NOT NULL
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding ASC
  LIMIT LEAST(match_count, 50);
$$;

-- 4. Verify Setup
DO $$
BEGIN
  RAISE NOTICE '✅ Vector Search Setup erfolgreich!';
  RAISE NOTICE '   - pgvector Extension: aktiviert';
  RAISE NOTICE '   - HNSW Indizes: erstellt';
  RAISE NOTICE '   - match_pdf_chunks(): bereit';
  RAISE NOTICE '   - match_crm_chunks(): bereit';
END $$;
```

> **Hinweis:** Das SQL muss nur einmalig ausgeführt werden. Die Indizes und Functions
> bleiben bestehen, auch nach `prisma db push`.

### LLM: Schritt 4 - Supabase Client Setup

**Datei**: `app/lib/supabase-client.ts`

**Ziel**: Zwei Supabase Client-Funktionen bereitstellen:

1. **`getSupabaseAdmin()`**:
   - Nutzt `SUPABASE_SERVICE_ROLE_KEY` (Server-side only!)
   - Für Admin-Operationen (Embedding-Insert, Vector-Search, SQL-Ausführung)
   - `createClient()` mit `auth: { autoRefreshToken: false, persistSession: false }`

2. **`getSupabaseClient()`**:
   - Nutzt `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Für Client-side oder authenticated User Operations

**Error Handling**: Werfe Error wenn ENV-Variablen fehlen

---

### LLM: Schritt 5 - Embedding Service Layer

**Datei**: `app/lib/embeddings.ts`

**Ziel**: Zentrale Embedding-Generierung mit Provider-Abstraktion

**Funktionen**:

1. **`EMBEDDING_DIMENSIONS`** (Konstante):
   - Mapping: Modell-Name → Dimensionen
   - `text-embedding-3-small`: 1536
   - `text-embedding-3-large`: 3072
   - `intfloat/multilingual-e5-large-instruct`: 1024 (**empfohlen für Deutsch**)


2. **`generateEmbeddingOpenAI(text, model?)`**:
   - Nutzt `getOpenAIClient()` aus `lib/ai.ts`
   - `client.embeddings.create()` mit Newline-Replacement
   - Returniert `number[]`

3. **`generateEmbeddingTogether(text, model?)`**:
   - Analog für Together.ai

4. **`generateEmbedding(text)`**:
   - Liest `EMBEDDING_PROVIDER` ENV (default: 'openai')
   - Wählt entsprechende Modell-ENV (`OPENAI_EMBEDDING_MODEL` oder `TOGETHERAI_EMBEDDING_MODEL`)
   - Delegiert an provider-spezifische Funktion

5. **`generateEmbeddings(texts[])`** (Batch):
   - Analog zu `generateEmbedding`, aber für Arrays
   - Nutzt Batch-API für Performance

---

### LLM: Schritt 6 - PDF Text Processor

**Datei**: `app/lib/pdf-processor.ts`

**Ziel**: PDF → Text → Chunks mit Token-Counts

**Dependencies**: `unpdf`, `@langchain/textsplitters`

> **Wichtig**: Verwende `unpdf` statt `pdf-parse`! Die Library `pdf-parse` 2.x verwendet einen Web Worker (`pdfjs-dist`), der serverseitig in Next.js nicht funktioniert und zu diesem Fehler führt:
> ```
> Failed to extract text from PDF: Setting up fake worker failed: "Cannot find module pdf.worker.mjs"
> ```

**Interface**:
```typescript
interface PDFChunk {
  content: string;
  index: number;
  tokenCount: number;
}
```

**Funktionen**:

1. **`extractTextFromPDF(buffer: Buffer)`**:
   - `import { extractText } from 'unpdf';`
   - `const result = await extractText(buffer);`
   - `unpdf` gibt ein Array von Seitentexten zurück: `result.text.join('\n\n')`
   - Try-Catch mit sinnvollem Error

2. **`chunkText(text: string)`**:
   - `RecursiveCharacterTextSplitter` mit `PDF_CHUNK_SIZE` und `PDF_CHUNK_OVERLAP` aus ENV
   - Returniert `PDFChunk[]` mit index und tokenCount (grobe Schätzung: `text.length / 4`)

3. **`processPDF(buffer: Buffer)`**:
   - Kombiniert `extractTextFromPDF` + `chunkText`

---

### LLM: Schritt 7 - CRM Data Serializer

**Datei**: `app/lib/crm-serializer.ts`

**Ziel**: Customer & Event Daten → Text für Embeddings

**Funktionen**:

1. **`serializeCustomer(customer)`**:
   - Erstelle natürlichen deutschen Text aus Customer-Feldern
   - Format: "Kunde: [Name]. Typ: [Business/Privat]. Branche: [Industry]. ..." 
   - Verwende nur ausgefüllte Felder (`.filter(Boolean)`)

2. **`serializeEvent(event)`**:
   - Analog für Events
   - Datum formatieren mit `toLocaleDateString('de-DE')`
   - Location als JSON.stringify wenn vorhanden

3. **`getAllCustomersForEmbedding()`**:
   - `prisma.customer.findMany()` mit `where: { isArchived: false }`
   - Select nur relevante Felder

4. **`getAllEventsForEmbedding()`**:
   - `prisma.event.findMany()` mit `where: { status: { not: 'ARCHIVED' } }`

---

### LLM: Schritt 8 - Vector Search Utilities

**Datei**: `app/lib/vector-search.ts`

**Ziel**: Similarity Search via Supabase RPC Functions

**Interfaces**:
```typescript
interface PDFSearchResult {
  id: string;
  fileId: string;
  chunkIndex: number;
  content: string;
  similarity: number;
  fileName: string;
  storagePath: string;
}

interface CRMSearchResult {
  id: string;
  entityType: 'customer' | 'event';
  entityId: string;
  content: string;
  similarity: number;
  metadata: any;
}
```

**Funktionen**:

1. **`searchPDFChunks(query: string)`**:
   - Query → Embedding via `generateEmbedding()`
   - `supabase.rpc('match_pdf_chunks')` mit embedding, threshold, count aus ENV
   - **Graceful Degradation**: Bei fehlenden RPC-Funktionen leeres Array zurückgeben statt Crash

2. **`searchCRMChunks(query: string)`**:
   - Analog mit `match_crm_chunks`

3. **`searchKnowledgeBase(query: string)`**:
   - `Promise.all()` für parallele Suche in beiden Tables
   - Returniert `{ pdfResults, crmResults }`

> **⚠️ Graceful Degradation**: Die RPC-Funktionen existieren möglicherweise nicht, wenn das SQL-Setup noch nicht ausgeführt wurde. Die Vector-Search sollte in diesem Fall leere Ergebnisse zurückgeben und eine Warnung loggen, statt zu crashen:
> ```typescript
> if (error?.code === '42883' || error?.message?.includes('does not exist')) {
>   console.warn('[Vector Search] RPC function not available. Run SQL setup first.');
>   return [];
> }
> ```

**Debug-Endpoints**:

Erstelle zusätzlich zwei Debug-Endpoints für einfachere Fehlersuche:

1. **`app/api/embeddings/debug/route.ts`**: Zeigt Embedding-Status
   - GET: Counts für `crm_chunks` und `pdf_chunks`
   - Prüft Embedding-Format (pgvector-String vs JSON-stringified)
   - Gibt Empfehlung bei falschem Format
   
2. **`app/api/embeddings/test-search/route.ts`**: Testet Similarity Search
   - GET: `?q=Suchbegriff&threshold=0.3`
   - Zeigt alle Ergebnisse mit Similarity-Scores
   - Hilft beim Finden des optimalen Thresholds

---

### LLM: Schritt 9 - PDF Embedding API Route

**Datei**: `app/api/embeddings/pdf/route.ts`

**Ziel**: API Endpoint für Embedding-Generierung und -Löschung von PDF-Dokumenten.

**Kontext**: Dieser Endpoint orchestriert den kompletten Workflow von PDF-Download über Text-Extraktion bis Embedding-Insert. Er wird automatisch nach jedem PDF-Upload aufgerufen (siehe Schritt 10).
**Route Config**:
- `export const runtime = 'nodejs'` (Edge Runtime nicht geeignet wegen pdf-parse Buffer-Handling)
- `export const maxDuration = 60` (Sekunden - für große PDFs mit vielen Seiten)

**POST Handler** (Embedding erstellen):
- **Input Validation**: Zod Schema `RequestSchema = z.object({ fileId: z.string().uuid() })`
- **Flow**:
  1. **File Record holen**: `supabase.from('files').select('*').eq('id', fileId).single()`
     - Bei Fehler oder nicht gefunden: Return 404
  2. **PDF downloaden**: `supabase.storage.from('cas-crm-mock-files').download(file.storage_path)`
     - Convert Blob zu Buffer: `Buffer.from(await pdfData.arrayBuffer())`
     - Bei Fehler: Return 500
  3. **Text extrahieren & chunken**: `await processPDF(buffer)` → `PDFChunk[]`
     - Validierung: Wenn `chunks.length === 0`, return 400 (kein Text extrahierbar)
  4. **Embeddings generieren**: `await generateEmbeddings(chunks.map(c => c.content))`
     - **Wichtig**: Batch-Call für Performance und Kosteneffizienz!
     - Provider wird automatisch aus ENV gewählt
  5. **Insert in DB**: Map chunks zu DB-Records:
     ```typescript
     const chunkRecords = chunks.map((chunk, i) => ({
       file_id: fileId,
       chunk_index: chunk.index,
       content: chunk.content,
       // WICHTIG: pgvector erwartet String-Format "[0.1,0.2,...]", NICHT JSON.stringify()!
       embedding: `[${embeddings[i].join(',')}]`,
       token_count: chunk.tokenCount,
       created_at: new Date().toISOString(),
       updated_at: new Date().toISOString(),
     }));
     ```
     - Insert via: `supabase.from('pdf_chunks').insert(chunkRecords)`
     - **⚠️ KRITISCH**: `JSON.stringify(embedding)` funktioniert NICHT mit pgvector!
- **Response**: `{ success: true, fileId, chunksCreated: chunks.length }`
- **Error Handling**: 
  - Try-Catch Block um gesamten Handler
  - Console-Log für Debugging
  - Aussagekräftige Error Messages in Response
  - 500 Status bei internen Fehlern

**DELETE Handler** (Embeddings löschen):
- **Input**: Query Parameter `?fileId=uuid` (via `new URL(request.url).searchParams`)
- **Validation**: Return 400 wenn fileId fehlt
- **Flow**: `supabase.from('pdf_chunks').delete().eq('file_id', fileId)`
- **Hinweis**: Automatisches Cascade Delete funktioniert durch Foreign Key Constraint wenn Parent-PDF gelöscht wird
- **Response**: `{ success: true }`

---

### LLM: Schritt 10 - PDF Upload Handler erweitern (Auto-Embedding)

**Datei**: `app/api/files/route.ts` (EXISTING FILE - nur POST Handler erweitern!)

**Ziel**: Nach erfolgreichem PDF-Upload automatisch Embeddings generieren, damit PDFs sofort durchsuchbar sind.

**Kontext**: Der bestehende File-Handler unter `app/api/files/route.ts` ist bereits ein **generischer Handler** für alle Dateiarten (Event-Flyer, Lebensläufe, etc.). Er verwaltet Metadaten mit `entityType` und `fileType`.
Die Embedding-Integration erfolgt zentral in diesem Handler - alle PDFs werden automatisch indiziert, unabhängig davon, ob es ein Event-Flyer oder ein Lebenslauf ist.

**Änderungen am existing POST Handler**:

1. **Nach dem File-Record Insert** - Synchrones Embedding:
   - **Zusätzlicher Code NACH** `prisma.file.create()`
   - **Synchrone Verarbeitung** (blockierend, aber zuverlässig):
     ```typescript
     // Route Config für längere PDF-Verarbeitung
     export const maxDuration = 60;
     
     // Nach Upload: Embedding direkt generieren (synchron)
     if (mimeType === 'application/pdf') {
       console.log('[Auto-Embedding] Starting PDF embedding for file:', file.id);
       
       try {
         const supabase = getSupabaseAdmin();
         
         // 1. PDF downloaden
         const { data: pdfData } = await supabase.storage
           .from('cas-crm-mock-files')
           .download(storagePath);
         
         // 2. Text extrahieren & chunken
         const buffer = Buffer.from(await pdfData.arrayBuffer());
         const chunks = await processPDF(buffer);
         
         // 3. Embeddings generieren (Batch)
         const embeddings = await generateEmbeddings(chunks.map(c => c.content));
         
         // 4. In DB speichern
         const now = new Date().toISOString();
         const chunkRecords = chunks.map((chunk, i) => ({
           fileId: file.id,
           chunk_index: chunk.index,
           content: chunk.content,
           embedding: `[${embeddings[i].join(',')}]`,
           token_count: chunk.tokenCount,
           created_at: now,
           updated_at: now,
         }));
         
         await supabase.from('pdf_chunks').insert(chunkRecords);
         console.log(`[Auto-Embedding] Created ${chunks.length} chunks`);
       } catch (error) {
         console.error('[Auto-Embedding] Error:', error);
       }
     }
     ```

> **⚠️ Warum synchron statt Fire-and-forget?**
> 
> Fire-and-forget (`fetch().catch()`) funktioniert **nicht** auf Vercel Preview Deployments:
> - Preview-URLs sind durch Vercel Authentication geschützt
> - Server-to-Server Calls werden blockiert (SSO-Redirect)
> - Der Container wird nach Response beendet, bevor der fetch ankommt
>
> Die synchrone Lösung ist zuverlässiger und funktioniert überall.

2. **Zusätzliche Imports erforderlich**:
   ```typescript
   import { getSupabaseAdmin } from '@/app/lib/supabase-client';
   import { processPDF } from '@/app/lib/pdf-processor';
   import { generateEmbeddings } from '@/app/lib/embeddings';
   ```

**User Experience**:
- PDF Upload → Response nach Embedding-Generierung (5-30 Sekunden je nach PDF-Größe)
- PDF ist sofort im Chatbot durchsuchbar
- Bei großen PDFs: Loading-Indicator im UI empfohlen

**Error Handling**:
- Try-Catch um Embedding-Logik: Fehler werden geloggt
- Upload-Response wird trotzdem gesendet (File existiert in DB)
- Embedding kann später manuell via `/api/embeddings/pdf` nachgeholt werden

---

### LLM: Schritt 11 - CRM Embedding Sync API Route

**Datei**: `app/api/embeddings/crm/route.ts`

**Ziel**: Bulk-Sync aller CRM-Daten zu Vector DB für initiales Seeding oder periodisches Update.

**Kontext**: Im Gegensatz zu PDFs (die bei Upload synchronisiert werden) müssen CRM-Daten manuell oder via Cron-Job synchronisiert werden, da Änderungen nicht automatisch getriggert werden.

**Route Config**:
- `export const runtime = 'nodejs'`
- `export const maxDuration = 300` (5 Minuten - für viele Entities)

**POST Handler**:
- **Flow**:
  1. **Customers syncen**:
     - `await getAllCustomersForEmbedding()` → Customer Array
     - For each Customer:
       - `serializeCustomer(customer)` → Text
       - `await generateEmbedding(text)` → Vector
       - `supabase.from('crm_chunks').upsert()` mit `onConflict: 'entity_type,entity_id'`
       - Metadata: `{ displayName, type, email }` für spätere Display
  2. **Events syncen**:
     - Analog mit `getAllEventsForEmbedding()`
     - Metadata: `{ title, category, startAt }`
- **Upsert Logik**: `onConflict: 'entity_type,entity_id'` aktualisiert existierende Chunks
- **Response**: `{ success: true, customersSynced, eventsSynced }`
- **Logging**: Console-Log mit Anzahl für Monitoring
- **Error Handling**: Try-Catch, sinnvolle Fehlermeldungen

**Sync-Auslösung via UI**:

Der CRM-Sync wird über einen Button auf der Chatbot-Page (Schritt 13) ausgelöst:

```typescript
// In der Chatbot UI: Button zum Sync triggern
const handleCrmSync = async () => {
  setSyncing(true);
  try {
    const res = await fetch('/api/embeddings/crm', { method: 'POST' });
    const data = await res.json();
    // Toast oder Alert mit Ergebnis: "X Kunden, Y Events synchronisiert"
  } finally {
    setSyncing(false);
  }
};
```

> **Hinweis**: Der Sync muss initial einmal ausgeführt werden und danach nur bei grösseren CRM-Datenänderungen.

---

### LLM: Schritt 12 - Chatbot Query API (RAG)

**Datei**: `app/api/chatbot/query/route.ts`

**Ziel**: RAG-Query mit Context Building und LLM Generation

**POST Handler**:
- **Input**: `{ query: string }` (max 1000 chars)
- **Flow**:
  1. `searchKnowledgeBase(query)` → pdfResults, crmResults
  2. Build Context Strings:
     - PDFs: `"[PDF-1] filename: content\n\n[PDF-2] ..."`
     - CRM: `"[KUNDE-1] name: content\n\n[VERANSTALTUNG-1] ..."`
  3. Build RAG Prompt:
     - **System**: Du bist CRM-Assistent mit Zugriff auf PDFs/Kunden/Events. Zitiere Quellen. Sei ehrlich wenn Info fehlt.
     - **User**: `Kontext:\n{fullContext}\n\n---\n\nFrage: {query}`
  4. `createChatCompletion()` mit `temperature: 0.3` (faktisch!)
  5. Build Citations Array:
     - PDFs → `{ type: 'pdf', id: fileId, title: fileName, url: '/api/files/{id}?download=true' }`
     - Customers → `{ type: 'customer', id: entityId, title: displayName, url: '/kunden/{id}' }`
     - Events → `{ type: 'event', id: entityId, title: title, url: '/veranstaltungen/{id}' }`
  6. Dedupliziere Citations (by id)
  7. **Filtere Citations**: Nur Quellen anzeigen, die tatsächlich in der Antwort erwähnt werden (Title-Matching)
- **Response**:
```typescript
{
  answer: string;
  citations: Citation[];
  contextUsed: boolean;
  sourcesCount: { pdfs, customers, events };
}
```

---

### LLM: Schritt 13 - Chatbot UI Page

**Datei**: `app/chatbot/page.tsx`

**Ziel**: ChatGPT-style Interface mit Citations

**State**:
- `messages: Message[]` mit `{ role: 'user' | 'assistant', content, citations? }`
- `input: string`
- `loading: boolean`

**UI Components**:

1. **Header**:
   - Titel: "🤖 CRM Chatbot"
   - Subtitle: "Frage mich alles über Kunden, Events oder PDFs"

2. **Messages Area**:
   - Empty State: Begrüßung + Beispiel-Buttons (z.B. "Nächste Events", "IT-Kunden")
   - Message Bubbles: User (rechts, blau) / Assistant (links, grau)
   - Citations: Liste unter Assistent-Messages mit Icons (FileText, User, Calendar) und Links
   - Loading Indicator: `Loader2` Icon animiert

3. **Input Form**:
   - Text Input + Send Button (mit `Send` Icon)
   - Disabled während loading

**Fetch Logic**:
- `POST /api/chatbot/query` mit `{ query: input }`
- Error Handling mit Fallback-Message

**Icons**: `lucide-react` (Send, FileText, User, Calendar, ExternalLink, Loader2, MessageSquare)

**Styling**: DaisyUI (TailwindCSS-Erweiterung mit vorgefertigten Komponenten wie `btn`, `card`, `chat-bubble`)

---

### LLM: Schritt 14 - Chatbot in Sidebar integrieren

**Datei**: `app/components/Sidebar.tsx` (EXISTING FILE - navItems erweitern!)

**Ziel**: Den Chatbot als Navigation-Link in der Sidebar hinzufügen.

**Änderungen**:

1. **Import hinzufügen**:
```typescript
import { MessageSquare } from 'lucide-react';
```

2. **navItems Array erweitern**:
```typescript
const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kunden', label: 'Kunden', icon: Users },
  { href: '/kontakte', label: 'Kontakte', icon: UserCircle },
  { href: '/veranstaltungen', label: 'Veranstaltungen', icon: Calendar, requiresEventManager: true },
  { href: '/chatbot', label: 'Chatbot', icon: MessageSquare },  // NEU
  { href: '/benutzerverwaltung', label: 'Benutzerverwaltung', icon: Shield, requiresAdmin: true },
  { href: '/einstellungen', label: 'Einstellungen', icon: Settings, requiresAdmin: true },
];
```

> **Hinweis**: Der Chatbot ist für alle Benutzerrollen sichtbar (kein `requiresAdmin` oder `requiresEventManager`).

---

## Voraussetzungen

### Test-Setup

**Was ist Vitest?**
Vitest ist ein Werkzeug, mit dem man automatisch überprüfen kann, ob der eigene Code korrekt funktioniert – auch dann, wenn ein LLM die Tests generiert. Es führt kleine, klar definierte Prüfungen (Unit Tests) aus, etwa ob eine Funktion das erwartete Ergebnis liefert oder eine Komponente richtig reagiert.

Unit Testing bedeutet, einzelne, abgeschlossene Teile des Codes isoliert zu testen, damit Fehler früh und gezielt sichtbar werden.

**Dependencies installieren**:
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Vitest Config** (`vitest.config.ts`):
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',  // Für React-Komponenten-Tests
    globals: true,          // describe/it/expect global verfügbar
    setupFiles: ['./vitest.setup.ts'],
  },
});
```

**Warum Mocking?**

In Unit Tests wollen wir isolierte Code-Einheiten testen, ohne echte API-Calls zu machen:

- **API-Mocks**: OpenAI/Together.ai API-Calls werden gemockt, um keine echten Kosten zu verursachen
  und Tests schnell und deterministisch zu halten.
- **Prisma-Mocks**: Datenbankzugriffe werden gemockt, um keine echte DB zu benötigen.
- **Supabase-Mocks**: Vector-Search und Storage-Calls werden gemockt.

> **Hinweis**: Für **manuelle Tests** (siehe unten) verwenden wir die echte Supabase-DB aus `.env`.
> Nur die **automatisierten Unit Tests** nutzen Mocks.

---

## Automatisierte Tests

> **Hinweis**: Die folgenden Tests sollen vom LLM implementiert werden. Jeder Abschnitt beschreibt **WAS** getestet werden soll, nicht den vollständigen Code.

---

### LLM: Test 1 - Embedding Service Unit Tests

**Datei**: `app/lib/__tests__/embeddings.test.ts`

**Ziel**: Validierung der Embedding-Generierung und Provider-Abstraktion

**Kontext**: Diese Tests prüfen ob die Embedding-Generation korrekt funktioniert, Provider richtig gewechselt werden und Batch-Processing effizient ist.

**Setup**: 
- Testing Framework: Vitest
- Mock OpenAI/Together.ai Clients mit `vi.mock()`
- Mock ENV Variables für Provider-Switch Tests mit `vi.stubEnv()`

**Test Cases (zu implementieren)**:

#### `generateEmbeddingOpenAI()`
1. **Sollte Vector mit korrekten Dimensionen returnieren**:
   - Mock OpenAI API mit 1536-dim Vector
   - Assert: Result ist `number[]` mit length 1536
   - Assert: Alle Elemente sind numbers

2. **Sollte Newlines aus Text entfernen**:
   - Input mit `\n` Zeichen
   - Assert: API wurde mit replactem Text aufgerufen

#### `generateEmbeddingTogether()`
1. **Sollte Together.ai API aufrufen**:
   - Mock Together.ai Client
   - Assert: Korrekter Modell-Name wird übergeben
   - Assert: Vector mit 768 Dimensionen (m2-bert)

#### `generateEmbedding()` (Unified Interface)
1. **Sollte OpenAI nutzen wenn EMBEDDING_PROVIDER=openai**:
   - Set ENV Variable
   - Assert: OpenAI Client wird aufgerufen
   - Assert: Together Client wird NICHT aufgerufen

2. **Sollte Together.ai nutzen wenn EMBEDDING_PROVIDER=together**:
   - Set ENV Variable  
   - Assert: Together Client wird aufgerufen
   - Assert: OpenAI Client wird NICHT aufgerufen

3. **Sollte default zu OpenAI fallen wenn ENV nicht gesetzt**:
   - Unset EMBEDDING_PROVIDER
   - Assert: OpenAI wird verwendet

#### `generateEmbeddings()` (Batch)
1. **Sollte Array-API nutzen statt mehrere Einzelcalls**:
   - Input: 5 Texte
   - Assert: Nur 1 API Call, nicht 5
   - Assert: `input` Parameter ist Array

2. **Sollte number[][] mit korrekter Anzahl returnieren**:
   - Input: 3 Texte
   - Mock: API returniert 3 Embeddings
   - Assert: Output ist `number[][]` mit length 3
   - Assert: Jedes Element hat korrekte Dimensionen

**Run Command**: `npm test -- embeddings`

---

### LLM: Test 2 - PDF Processor Unit Tests

**Datei**: `app/lib/__tests__/pdf-processor.test.ts`

**Ziel**: Text-Extraktion und Chunking-Logik validieren

**Kontext**: Diese Tests stellen sicher dass PDFs korrekt verarbeitet werden - Text extrahiert, in sinnvolle Chunks aufgeteilt, mit Overlap und Token-Counts.

**Fixtures**: 
- Erstelle `__fixtures__/test.pdf` - Sample PDF mit bekanntem Inhalt (z.B. "Lorem ipsum..." Text, ~2000 chars)
- Für Error-Test: Invaliden Buffer

**Test Cases (zu implementieren)**:

#### `extractTextFromPDF()`
1. **Sollte Text aus PDF extrahieren**:
   - Input: Test-PDF Buffer
   - Assert: Output ist non-empty String
   - Assert: Length > 0

2. **Sollte Error werfen bei ungültigem PDF**:
   - Input: `Buffer.from('not a pdf')`
   - Assert: Wirft Error mit Message "Failed to extract text from PDF"

#### `chunkText()`
1. **Sollte Text in Chunks mit max size aufteilen**:
   - Input: Langer Text (2000 chars)
   - ENV: `PDF_CHUNK_SIZE=500`, `PDF_CHUNK_OVERLAP=100`
   - Assert: Mehrere Chunks entstehen
   - Assert: Jeder Chunk <= 550 chars (mit 10% Toleranz für Satz-Ende)

2. **Sollte Overlap zwischen Chunks erzeugen**:
   - Input: Text mit erkennbaren Worten
   - Assert: Ende von Chunk[n] erscheint teilweise in Chunk[n+1]
   - Prüfe letztes Wort von Chunk 0 ist in Chunk 1

3. **Sollte tokenCount für jeden Chunk berechnen**:
   - Assert: `tokenCount` Property existiert
   - Assert: Grobe Schätzung `text.length / 4` stimmt (±10%)

4. **Sollte index für jeden Chunk setzen**:
   - Assert: Chunk[0].index === 0, Chunk[1].index === 1, etc.

#### `processPDF()` (Integration)
1. **Sollte kompletten Workflow durchführen**:
   - Input: Test-PDF Buffer
   - Assert: Returniert `PDFChunk[]`
   - Assert: Chunks haben `content`, `index`, `tokenCount`

**Run Command**: `npm test -- pdf-processor`

---

### LLM: Test 3 - CRM Serializer Unit Tests

**Datei**: `app/lib/__tests__/crm-serializer.test.ts`

**Ziel**: Konsistenz der Text-Serialisierung prüfen

**Kontext**: Diese Tests stellen sicher dass CRM-Daten in gut lesbaren deutschen Text konvertiert werden, leere Felder gefiltert und Formate korrekt sind.

**Test Cases (zu implementieren)**:

#### `serializeCustomer()`
1. **Sollte alle gefüllten Felder inkludieren**:
   - Input: Customer mit allen Feldern gefüllt
   - Assert: Output enthält "Kunde:", "Typ:", "Branche:", "E-Mail:", etc.
   - Assert: Alle Input-Werte erscheinen im Output

2. **Sollte leere Felder filtern**:
   - Input: Customer mit nur `displayName` und `type`
   - Assert: Output enthält keine "undefined", "null" Strings
   - Assert: Nur ausgefüllte Felder erscheinen

3. **Sollte BUSINESS Typ korrekt übersetzen**:
   - Input: `type: 'BUSINESS'`
   - Assert: Output enthält "Typ: Firmenkunde"

4. **Sollte PRIVATE Typ korrekt übersetzen**:
   - Input: `type: 'PRIVATE'`
   - Assert: Output enthält "Typ: Privatkunde"

#### `serializeEvent()`
1. **Sollte Datum deutsch formatieren**:
   - Input: Event mit `startAt = new Date('2024-12-25')`
   - Assert: Output enthält Datum im Format `dd.mm.yyyy` (Regex: `/\d{1,2}\.\d{1,2}\.\d{4}/`)

2. **Sollte Location als JSON serialisieren**:
   - Input: `location: { venue: 'Kongresshaus', city: 'Zürich' }`
   - Assert: Output enthält "Ort:"
   - Assert: venue und city sind im Output

3. **Sollte Online-Event kennzeichnen**:
   - Input: `isOnline: true`
   - Assert: Output enthält "Online-Veranstaltung"

4. **Sollte Präsenz-Event kennzeichnen**:
   - Input: `isOnline: false`
   - Assert: Output enthält "Präsenz-Veranstaltung"

5. **Sollte Kapazität und Preis mit Einheiten formatieren**:
   - Input: `capacity: 100`, `price: 199.00`
   - Assert: Output enthält "Kapazität: 100 Personen"
   - Assert: Output enthält "Preis: 199 CHF"

#### `getAllCustomersForEmbedding()`
1. **Sollte nur nicht-archivierte Kunden holen**:
   - Mock Prisma mit Sample Customers
   - Assert: `prisma.customer.findMany` wurde mit `where: { isArchived: false }` aufgerufen
   - Assert: Returniert nur aktive Kunden

2. **Sollte nur relevante Felder selecten**:
   - Assert: Select enthält displayName, type, email, etc.
   - Assert: Keine sensitiven/unnötigen Felder

#### `getAllEventsForEmbedding()`
1. **Sollte keine archivierten Events holen**:
   - Mock Prisma
   - Assert: `where: { status: { not: 'ARCHIVED' } }`

**Run Command**: `npm test -- crm-serializer`

---

### LLM: Test 4 - Vector Search Unit Tests

**Datei**: `app/lib/__tests__/vector-search.test.ts`

**Ziel**: Similarity Search Logik testen

**Kontext**: Diese Tests prüfen ob Vector Search korrekt mit Supabase RPC kommuniziert, parallele Ausführung nutzt und Fehler behandelt.

**Setup**: 
- Mock Supabase Client
- Mock `generateEmbedding()` Function

**Test Cases (zu implementieren)**:

#### `searchPDFChunks()`
1. **Sollte RPC mit korrekten Parametern aufrufen**:
   - Mock: Supabase RPC returniert Sample Results
   - Assert: `supabase.rpc` wurde mit `'match_pdf_chunks'` aufgerufen
   - Assert: Parameter enthält `query_embedding` (Array)
   - Assert: `match_threshold` aus ENV (`VECTOR_MATCH_THRESHOLD`)
   - Assert: `match_count` aus ENV (`VECTOR_MATCH_COUNT`)

2. **Sollte Error werfen bei RPC-Fehler**:
   - Mock: RPC returniert `{ data: null, error: {...} }`
   - Assert: Function wirft Error mit Message "Failed to search PDF chunks"

3. **Sollte leeres Array returnieren bei keinen Matches**:
   - Mock: RPC returniert `{ data: [], error: null }`
   - Assert: Result ist leeres Array

4. **Sollte Results mit korrekter Struktur returnieren**:
   - Assert: Jedes Result hat `id`, `fileId`, `content`, `similarity`, `fileName`

#### `searchCRMChunks()`
1. **Sollte match_crm_chunks RPC aufrufen**:
   - Assert: RPC-Name ist `'match_crm_chunks'`
   - Assert: Selbe Parameter-Struktur wie PDF Search

2. **Sollte Results mit entity_type returnieren**:
   - Assert: Results haben `entityType`, `entityId`, `metadata`

#### `searchKnowledgeBase()` (Combined Search)
1. **Sollte beide Searches parallel ausführen**:
   - Mock beide RPC Calls
   - Assert: `Promise.all` wird verwendet (nicht sequentiell)
   - Performance: Beide Calls sollten ~gleichzeitig starten

2. **Sollte Object mit beiden Results returnieren**:
   - Assert: Result hat Properties `pdfResults` und `crmResults`
   - Assert: Beide sind Arrays

**Run Command**: `npm test -- vector-search`

---

### LLM: Test 5 - RAG Query API Integration Tests

**Datei**: `app/api/__tests__/chatbot-query.test.ts`

**Ziel**: End-to-End Test des RAG Query Endpoints

**Kontext**: Diese Tests prüfen den kompletten RAG-Flow: Vector Search, Context Building, LLM Call, Citation Building.

**Setup**: 
- SuperTest oder Next.js App Router Test Utils
- Mock `searchKnowledgeBase()`
- Mock `createChatCompletion()`

**Test Cases (zu implementieren)**:

#### POST `/api/chatbot/query` - Success Cases
1. **Sollte Antwort mit Citations returnieren bei Context-Match**:
   - Mock: Vector Search findet relevante PDF-Chunks
   - Mock: LLM generiert Antwort
   - POST mit `{ query: 'Test query' }`
   - Assert: Status 200
   - Assert: Body hat `answer` (String)
   - Assert: `citations` Array mit PDF-Citation
   - Assert: `contextUsed: true`
   - Assert: `sourcesCount` korrekt

2. **Sollte ohne Context antworten wenn keine Matches**:
   - Mock: Vector Search returniert leere Arrays
   - Mock: LLM beantwortet aus General Knowledge
   - Assert: `contextUsed: false`
   - Assert: `citations` ist leer
   - Assert: `answer` ist trotzdem vorhanden

3. **Sollte Citations deduplizieren**:
   - Mock: 2 PDF-Chunks von selber Datei
   - Assert: Nur 1 Citation im Result (dedupliziert by fileId)

4. **Sollte verschiedene Citation-Typen kombinieren**:
   - Mock: PDF + Customer + Event Results
   - Assert: Citations enthalten alle 3 Typen
   - Assert: Korrekte URLs für jeden Typ

#### POST `/api/chatbot/query` - Validation
1. **Sollte 400 returnieren bei zu langem Query**:
   - Input: Query mit 1001+ Zeichen
   - Assert: Status 400
   - Assert: Zod Validation Error

2. **Sollte 400 returnieren bei fehlendem Query**:
   - Input: `{}` (leeres Object)
   - Assert: Status 400

3. **Sollte 400 returnieren bei ungültigem Query-Typ**:
   - Input: `{ query: 123 }` (Number statt String)
   - Assert: Status 400

#### POST `/api/chatbot/query` - Error Handling
1. **Sollte 500 returnieren bei Vector Search Error**:
   - Mock: `searchKnowledgeBase` wirft Error
   - Assert: Status 500
   - Assert: Sinnvolle Error Message

2. **Sollte 500 returnieren bei LLM Error**:
   - Mock: `createChatCompletion` wirft Error
   - Assert: Status 500

**Run Command**: `npm test -- chatbot-query`

---

## Manuelle Tests

> **Voraussetzungen für alle manuellen Tests**:
> - Dev Server läuft: `npm run dev`
> - pgvector Extension aktiviert
> - Prisma Schema gepusht: `npx prisma db push --force-reset`
> - Vector Indizes erstellt: SQL aus `prisma/vector_setup.sql` im Supabase SQL Editor ausgeführt
> - `.env` vollständig konfiguriert (inkl. `NEXT_PUBLIC_APP_URL`)

---

### Mensch: Test 1 - End-to-End: Automatisches PDF-Embedding

**Ziel**: Vollständiger Workflow von Upload bis Chatbot-Query

**Test-Schritte**:

1. **PDF hochladen**:
   - Navigiere zu File-Upload UI
   - Lade Test-PDF hoch (z.B. Produktdokumentation mit spezifischem Inhalt)
   - **Erwartung**: Success-Response sofort

2. **Auto-Embedding verifizieren** (⏱️ Warte 10-30 Sekunden):
   - Öffne Supabase Dashboard → `pdf_chunks` Table
   - Filter: `file_id = [UUID des hochgeladenen PDFs]`
   - **Erwartung**: 
     - Mehrere Chunks sichtbar
     - `embedding` column ist nicht NULL
     - `content` enthält Text aus PDF

3. **Chatbot Query testen**:
   - Navigiere zu `/chatbot`
   - Stelle Frage basierend auf PDF-Inhalt
   - Beispiel: "Was steht im Dokument über [spezifisches Thema aus PDF]?"
   - **Erwartung**: 
     - Antwort enthält relevante Info aus PDF
     - Citations zeigen PDF-Name und Link
     - Click auf Citation öffnet PDF

**Success Criteria**:
- ✅ PDF wird automatisch durchsuchbar (kein manueller `/api/embeddings/pdf` Call nötig)
- ✅ Chatbot findet relevante Chunks
- ✅ Citations funktionieren

---

### Mensch: Test 2 - CRM Data Sync

**Ziel**: CRM-Daten in Vector DB synchronisieren

**Test-Schritte**:

1. **CRM-Sync triggern** (via UI):
   - Navigiere zu `/chatbot`
   - Klicke auf den **"CRM-Daten synchronisieren"**-Button (oben rechts)
   - **Erwartung**: Toast-Nachricht mit Anzahl synchronisierter Einträge

   *Alternativ via curl (für Debugging):*
   ```bash
   curl -X POST http://localhost:3000/api/embeddings/crm
   ```

2. **Erwartete Response**:
```json
{
  "success": true,
  "customersSynced": 25,
  "eventsSynced": 10
}
```

3. **Verifizierung in DB**:
   - Supabase Dashboard → `crm_chunks` Tabelle
   - **Prüfe**:
     - Einträge mit `entity_type='customer'` vorhanden
     - Einträge mit `entity_type='event'` vorhanden
     - `embedding` column ist nicht NULL
     - `content` enthält serialisierten Text
     - `metadata` enthält JSON mit `displayName`/`title`

**Success Criteria**:
- ✅ Customers und Events sind synchronisiert
- ✅ Embeddings sind generiert
- ✅ Metadata ist korrekt

---

### Mensch: Test 3 - Chatbot RAG Query Varianten

**Ziel**: Verschiedene Query-Typen testen

**Voraussetzung**: 
- PDFs hochgeladen und eingebettet (Test 1)
- CRM-Daten synchronisiert (Test 2)

**Test-Schritte**:

1. **Navigiere zu** `http://localhost:3000/chatbot`

2. **Test PDF-basierte Frage**:
   - **Query**: "Was steht in Dokument [PDF-Name] über [Thema]?"
   - **Erwartung**:
     - Antwort mit relevantem Inhalt
     - Citation mit PDF-Name
     - Link zu PDF funktioniert

3. **Test CRM-basierte Frage (Events)**:
   - **Query**: "Welche Veranstaltungen finden nächsten Monat statt?"
   - **Erwartung**:
     - Antwort listet Events auf
     - Citations mit Event-Namen
     - Links zu Event-Detail-Pages

4. **Test CRM-basierte Frage (Customers)**:
   - **Query**: "Welche Kunden haben wir aus der IT-Branche?"
   - **Erwartung**:
     - Antwort listet Kunden auf
     - Citations mit Kunden-Namen
     - Links zu Customer-Detail-Pages

5. **Test allgemeine Frage (ohne RAG)**:
   - **Query**: "Was ist die Hauptstadt von Deutschland?"
   - **Erwartung**:
     - Direktantwort vom LLM: "Berlin"
     - Keine Citations (kein lokaler Context)
     - `contextUsed: false` in Response

6. **Test kombinierte Frage**:
   - **Query**: "Gibt es Events zum Thema [PDF-Inhalt]?"
   - **Erwartung**:
     - Antwort kombiniert PDF- und Event-Daten
     - Citations von beiden Quellen

**Success Criteria**:
- ✅ Alle Query-Typen funktionieren
- ✅ Citations sind korrekt und Links funktionieren
- ✅ Antworten sind relevant und faktisch korrekt

---

### Mensch: Test 4 - Vector Similarity Search (SQL)

**Ziel**: RPC Functions direkt testen

**Voraussetzung**: Embeddings in DB vorhanden

**Test-Schritte**:

1. **Öffne Supabase SQL Editor**

2. **Test PDF Similarity Search**:
```sql
SELECT * FROM match_pdf_chunks(
  (SELECT embedding FROM pdf_chunks LIMIT 1)::vector(1024),
  0.5,
  5
);
```

**Erwartung**:
- Results mit `similarity` zwischen 0-1
- Sortiert nach höchster Similarity
- Max 5 Results
- Joined mit `files` table (file_name, storage_path vorhanden)

3. **Test CRM Similarity Search**:
```sql
SELECT * FROM match_crm_chunks(
  (SELECT embedding FROM crm_chunks LIMIT 1)::vector(1024),
  0.5,
  5
);
```

**Erwartung**:
- Results mit `entity_type` und `entity_id`
- `metadata` column enthält JSON
- Similarity Scores korrekt berechnet

4. **Test mit verschiedenen Thresholds**:
```sql
-- Strenger Threshold
SELECT COUNT(*) FROM match_pdf_chunks(
  (SELECT embedding FROM pdf_chunks LIMIT 1)::vector(1024),
  0.9,  -- Hoher Threshold
  50
);

-- Lockerer Threshold
SELECT COUNT(*) FROM match_pdf_chunks(
  (SELECT embedding FROM pdf_chunks LIMIT 1)::vector(1024),
  0.3,  -- Niedriger Threshold
  50
);
```

**Erwartung**: Höherer Threshold → weniger Results

**Success Criteria**:
- ✅ RPC Functions funktionieren
- ✅ Similarity Scores sind plausibel
- ✅ Joins funktionieren korrekt

---

### Mensch: Troubleshooting mit Debug-Endpoints

Falls der Chatbot keine Ergebnisse liefert, nutze die Debug-Endpoints:

1. **Embedding-Status prüfen**:
   ```
   GET /api/embeddings/debug
   ```
   - Zeigt Anzahl der Chunks in `crm_chunks` und `pdf_chunks`
   - Prüft ob Embeddings im korrekten Format gespeichert sind
   - **Häufiger Fehler**: `embedding_format: "JSON-stringified (WRONG!)"` → CRM Sync erneut durchführen

2. **Similarity Search testen**:
   ```
   GET /api/embeddings/test-search?q=TechCorp&threshold=0.3
   ```
   - Zeigt alle Ergebnisse mit Similarity-Scores
   - Hilft beim Finden des optimalen Thresholds
   - **Tipp**: Threshold=0 zeigt ALLE Ergebnisse, sortiert nach Similarity

3. **Häufige Probleme**:

   | Problem | Symptom | Lösung |
   |---------|---------|--------|
   | Keine Ergebnisse | `crm_results: { count: 0 }` | CRM-Sync durchführen |
   | RPC fehlt | `function match_crm_chunks does not exist` | SQL-Script ausführen |
   | Falsches Format | `embedding_format: "JSON-stringified"` | Code prüfen: `[${embedding.join(',')}]` statt `JSON.stringify()` |
   | Vercel-Fehler | `ECONNREFUSED 127.0.0.1:3000` | `VERCEL_URL`-Fallback in `/api/files/route.ts` |

