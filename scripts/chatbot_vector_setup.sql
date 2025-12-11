-- =====================================================
-- CHATBOT VECTOR SETUP
-- =====================================================
-- Dieses SQL muss im Supabase Dashboard (SQL Editor) ausgeführt werden
-- Nach dem Prisma Schema Push

-- 0. pgvector Extension aktivieren (falls noch nicht geschehen)
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- HNSW INDIZES FÜR PERFORMANCE
-- =====================================================

-- Index für Policy Chunks
CREATE INDEX IF NOT EXISTS policy_chunks_embedding_idx 
ON policy_chunks USING hnsw (embedding vector_cosine_ops);

-- Index für Web Chunks
CREATE INDEX IF NOT EXISTS web_chunks_embedding_idx 
ON web_chunks USING hnsw (embedding vector_cosine_ops);

-- Index für Law Chunks
CREATE INDEX IF NOT EXISTS law_chunks_embedding_idx 
ON law_chunks USING hnsw (embedding vector_cosine_ops);

-- =====================================================
-- RPC FUNCTIONS FÜR SIMILARITY SEARCH
-- =====================================================

-- 1. Policy Search Function
CREATE OR REPLACE FUNCTION match_policy_chunks(
  query_embedding vector(1024),
  match_threshold float DEFAULT 0.75,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  policy_id text,
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

-- 2. Web Content Search Function
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

-- 3. Law Search Function
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

-- =====================================================
-- VERIFY SETUP
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Chatbot Vector Search Setup erfolgreich!';
  RAISE NOTICE '   - pgvector Extension: aktiviert';
  RAISE NOTICE '   - HNSW Indizes: erstellt (policy_chunks, web_chunks, law_chunks)';
  RAISE NOTICE '   - match_policy_chunks(): bereit';
  RAISE NOTICE '   - match_web_chunks(): bereit';
  RAISE NOTICE '   - match_law_chunks(): bereit';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Nächste Schritte:';
  RAISE NOTICE '   1. Prisma Schema pushen: npx prisma db push';
  RAISE NOTICE '   2. Embeddings generieren via API Routes';
END $$;
