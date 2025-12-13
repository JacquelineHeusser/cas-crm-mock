/**
 * Chatbot Query API mit RAG
 * Orchestriert Intent Classification, Vector Search und LLM Generation
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

    // 1. Intent Classification (grobe Einordnung)
    const classification = classifyIntent(query);
    console.log('[Chatbot] Intent (raw):', classification.intent, `(${(classification.confidence * 100).toFixed(0)}%)`);

    // Effektiven Intent bestimmen: persönlicher Bezug => policy, sonst eher general
    const lowerQuery = query.toLowerCase();
    const hasPolicyNumber = /\d{4,}/.test(query);
    // Persönlicher Bezug: ich/meine/... oder direkte Kundenansprache (Kunde, Herr, Frau, Firma)
    const hasPersonalRef =
      /\b(meine|mein|ich|unsere|unser|wir|kunde|kunden|herr|frau|firma)\b/.test(lowerQuery) ||
      /kundenkonto|meine police|meine versicherung|meine prämie/.test(lowerQuery);
    const isDefinitionQuestion = /^\s*was\s+ist\b/i.test(query) || /definition|bedeutet|allgemein/i.test(lowerQuery);
    const mentionsZurich = /zürich|zurich/.test(lowerQuery);

    let effectiveIntent = classification.intent;

    if (hasPersonalRef || hasPolicyNumber) {
      // Klar persönliche Frage => immer Policy-Kontext verwenden
      effectiveIntent = 'policy';
    } else if (isDefinitionQuestion && !hasPersonalRef && !hasPolicyNumber) {
      // Reine Definitionsfrage ohne persönlichen Bezug => allgemein
      effectiveIntent = 'general';
    } else if (mentionsZurich && !hasPersonalRef && !hasPolicyNumber) {
      // Allgemeine Frage zu Zürich-Produkten ohne persönlichen Bezug
      effectiveIntent = 'general';
    }

    console.log('[Chatbot] Intent (effective):', effectiveIntent);

    // 2. Multi-Source Vector Search
    const searchResults = await searchAll(query);
    console.log('[Chatbot] Search Results:', {
      policies: searchResults.policies.length,
      webContent: searchResults.webContent.length,
      laws: searchResults.laws.length,
    });

    // 3. Context Building (abhängig vom effektiven Intent)
    const context = buildContext(searchResults, effectiveIntent);

    // 4. RAG Prompt
    const systemPrompt = `Du bist ein hilfreicher Versicherungs-Assistent für die Zürich Versicherung.

WICHTIGE REGELN:
1. Beantworte Fragen präzise und verständlich auf Deutsch (Schweizer Rechtschreibung)
2. Nutze IMMER die bereitgestellten Quellen als Basis für deine Antworten
3. Wenn du Informationen von der Zürich Website verwendest, erwähne dies
4. Wenn du Gesetzesartikel zitierst, nenne den Artikel und das Gesetz
5. Bei Policy-Fragen: Beziehe dich auf die konkreten Daten aus der Datenbank
6. Wenn keine relevanten Informationen verfügbar sind, sage das ehrlich
7. Sei freundlich und professionell

${context}`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory,
      { role: 'user' as const, content: query },
    ];

    // 5. LLM Generation
    const answer = await getChatCompletion(messages);

    // 6. Citations extrahieren (abhängig vom effektiven Intent)
    const citations = extractCitations(searchResults, effectiveIntent);

    return NextResponse.json({
      answer,
      citations,
      intent: effectiveIntent,
      sources: {
        policies: searchResults.policies.length,
        webContent: searchResults.webContent.length,
        laws: searchResults.laws.length,
      },
    });
  } catch (error) {
    console.error('[Chatbot] Error:', error);
    console.error('[Chatbot] Error details:', JSON.stringify(error, null, 2));
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Query failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Baut den Context für das LLM aus den Search Results
 */
function buildContext(results: any, intent: string): string {
  let context = '';

  const isPolicyIntent = intent === 'policy';
  const isGeneralIntent = intent === 'general';
  const isMixedIntent = intent === 'mixed';

  // Policy Context nur für Policy- oder gemischte Fragen
  if ((isPolicyIntent || isMixedIntent) && results.policies.length > 0) {
    context += '\n\nRELEVANTE POLICEN:\n';
    results.policies.forEach((p: any, i: number) => {
      context += `\n[Police ${i + 1}] ${p.metadata.policyNumber}\n`;
      context += `Versicherungsnehmer: ${p.metadata.userName}\n`;
      if (p.metadata.companyName) {
        context += `Unternehmen: ${p.metadata.companyName}\n`;
      }
      context += `Status: ${p.metadata.status}\n`;
      context += `Details: ${p.content}\n`;
      context += `Similarity: ${(p.similarity * 100).toFixed(1)}%\n`;
    });
  }

  // Web Content Context nur für allgemeine oder gemischte Fragen
  if ((isGeneralIntent || isMixedIntent) && results.webContent.length > 0) {
    context += '\n\nINFORMATIONEN VON ZURICH.CH:\n';
    results.webContent.forEach((w: any, i: number) => {
      context += `\n[Quelle ${i + 1}] ${w.title}\n`;
      context += `Kategorie: ${w.metadata.category}\n`;
      context += `URL: ${w.sourceUrl}\n`;
      context += `Inhalt: ${w.content.substring(0, 500)}...\n`;
      context += `Similarity: ${(w.similarity * 100).toFixed(1)}%\n`;
    });
  }

  // Law Context vor allem für allgemeine oder gemischte Fragen
  if ((isGeneralIntent || isMixedIntent) && results.laws.length > 0) {
    context += '\n\nRELEVANTE GESETZESARTIKEL:\n';
    results.laws.forEach((l: any, i: number) => {
      context += `\n[${l.lawCode} ${l.articleNum}]\n`;
      context += `${l.content}\n`;
      context += `Quelle: ${l.sourceUrl}\n`;
      context += `Similarity: ${(l.similarity * 100).toFixed(1)}%\n`;
    });
  }

  if (!context) {
    context = '\n\nKEINE RELEVANTEN INFORMATIONEN IN DER RAG-DATENBANK GEFUNDEN.\n';
    context += 'Beantworte die Frage basierend auf deinem allgemeinen Wissen über Versicherungen,\n';
    context += 'aber weise darauf hin, dass du keine passenden Informationen aus Policen, der Zürich-Website\n';
    context += 'oder den hinterlegten Gesetzestexten gefunden hast.\n';
  }

  return context;
}

/**
 * Extrahiert Citations für die UI
 */
function extractCitations(results: any, intent: string): any[] {
  const citations: any[] = [];

  const isPolicyIntent = intent === 'policy';
  const isGeneralIntent = intent === 'general';
  const isMixedIntent = intent === 'mixed';

  // Policy Citations: nur bei Policy- oder gemischten Fragen
  if (isPolicyIntent || isMixedIntent) {
    results.policies.forEach((p: any) => {
      citations.push({
        type: 'policy',
        title: `Police ${p.metadata.policyNumber}`,
        url: `/policen/${p.policyId}`,
        metadata: {
          userName: p.metadata.userName,
          companyName: p.metadata.companyName,
          status: p.metadata.status,
        },
      });
    });
  }

  // Web Citations: nur bei allgemeinen oder gemischten Fragen
  if (isGeneralIntent || isMixedIntent) {
    results.webContent.forEach((w: any) => {
      citations.push({
        type: 'web',
        title: w.title,
        url: w.sourceUrl,
        category: w.metadata.category,
      });
    });

    // Law Citations: ebenfalls nur für allgemeine oder gemischte Fragen
    results.laws.forEach((l: any) => {
      citations.push({
        type: 'law',
        title: `${l.lawCode} ${l.articleNum}`,
        url: l.sourceUrl,
        lawCode: l.lawCode,
      });
    });
  }

  return citations;
}
