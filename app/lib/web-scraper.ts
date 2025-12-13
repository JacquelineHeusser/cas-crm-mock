/**
 * Web Scraper für Zürich Versicherung Website
 * Extrahiert relevante Inhalte für den Chatbot
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
const USER_AGENT = process.env.SCRAPING_USER_AGENT || 'Mozilla/5.0 (compatible; CAS-CRM-Bot/1.0)';
const RATE_LIMIT = parseInt(process.env.SCRAPING_RATE_LIMIT_MS || '2000');

// Relevante URL-Patterns für Scraping
const SCRAPING_TARGETS = [
  '/de/privatkunden/hausrat',
  '/de/privatkunden/haftpflicht',
  '/de/privatkunden/auto',
  '/de/privatkunden/leben',
  '/de/privatkunden/rechtsschutz',
  '/de/geschaeftskunden/betriebshaftpflicht',
  '/de/geschaeftskunden/gebaeudeversicherung',
  '/de/geschaeftskunden/cyber',
  '/de/services/ratgeber',
];

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function scrapePage(url: string): Promise<ScrapedContent | null> {
  try {
    console.log(`[Scraper] Fetching: ${url}`);
    
    const response = await axios.get(url, {
      headers: { 
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'de-CH,de;q=0.9',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    // Entferne nicht relevante Elemente
    $('script, style, nav, header, footer, .cookie-banner, .navigation, .menu').remove();

    // Extrahiere Titel
    const title = $('h1').first().text().trim() || 
                  $('title').text().trim() || 
                  'Unbekannter Titel';

    // Extrahiere Hauptinhalt
    let mainContent = '';
    
    // Versuche verschiedene Content-Selektoren
    const contentSelectors = [
      'main',
      'article',
      '.content',
      '.main-content',
      '#content',
      '.page-content',
    ];

    for (const selector of contentSelectors) {
      const content = $(selector).text().trim();
      if (content && content.length > mainContent.length) {
        mainContent = content;
      }
    }

    // Fallback: Body-Content
    if (!mainContent || mainContent.length < 100) {
      mainContent = $('body').text().trim();
    }

    // Bereinige Whitespace
    mainContent = mainContent
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    if (!mainContent || mainContent.length < 100) {
      console.warn(`[Scraper] Zu wenig Content auf ${url} (${mainContent.length} Zeichen)`);
      return null;
    }

    // Kategorie aus URL ableiten
    const category = url.includes('/privatkunden') ? 'Privatkunden' :
                     url.includes('/geschaeftskunden') ? 'Geschäftskunden' :
                     url.includes('/ratgeber') ? 'Ratgeber' : 
                     'Allgemein';

    console.log(`[Scraper] ✓ ${title} (${mainContent.length} Zeichen)`);

    return {
      url,
      title,
      content: mainContent,
      category,
      lastScraped: new Date().toISOString(),
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`[Scraper] HTTP Error ${error.response?.status} für ${url}`);
    } else {
      console.error(`[Scraper] Error fetching ${url}:`, error);
    }
    return null;
  }
}

export async function scrapeZurichWebsite(): Promise<ScrapedContent[]> {
  const results: ScrapedContent[] = [];

  console.log(`[Scraper] Starte Scraping von ${SCRAPING_TARGETS.length} Seiten...`);

  for (const path of SCRAPING_TARGETS) {
    const url = `${ZURICH_BASE_URL}${path}`;
    const content = await scrapePage(url);
    
    if (content) {
      results.push(content);
    }

    // Rate Limiting zwischen Requests
    await delay(RATE_LIMIT);
  }

  console.log(`[Scraper] ✓ Scraping abgeschlossen: ${results.length}/${SCRAPING_TARGETS.length} Seiten erfolgreich`);
  return results;
}

export async function chunkWebContent(content: ScrapedContent): Promise<Array<{
  content: string;
  index: number;
}>> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ['\n\n', '\n', '. ', ' ', ''],
  });

  const chunks = await splitter.splitText(content.content);

  return chunks.map((chunk, index) => ({
    content: `${content.title}\n\n${chunk}`,
    index,
  }));
}
