/**
 * Scraper für Schweizer Versicherungsgesetze (fedlex.admin.ch)
 * Extrahiert Gesetzesartikel für den Chatbot
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
    
    const response = await axios.get(url, { 
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CAS-CRM-Bot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'de-CH,de;q=0.9',
      },
    });
    
    const $ = cheerio.load(response.data);

    const articles: LawArticle[] = [];

    // Fedlex-Struktur: Artikel sind in verschiedenen Strukturen möglich
    // Versuche mehrere Selektoren
    const articleSelectors = [
      '.article',
      'article',
      '[class*="article"]',
      '.law-article',
    ];

    let foundArticles = false;

    for (const selector of articleSelectors) {
      $(selector).each((_, element) => {
        const $article = $(element);
        
        // Artikel-Nummer extrahieren (z.B. "Art. 1", "Art. 2a")
        let articleNum = $article.find('.article-number, .art-number, [class*="number"]').first().text().trim();
        
        // Fallback: Suche nach "Art." im Text
        if (!articleNum) {
          const text = $article.text();
          const match = text.match(/Art\.\s*\d+[a-z]?/i);
          if (match) {
            articleNum = match[0];
          }
        }
        
        // Artikel-Inhalt
        let content = $article.find('.article-content, .art-content, [class*="content"]').text().trim();
        
        // Fallback: Gesamter Artikel-Text
        if (!content) {
          content = $article.text().trim();
        }
        
        // Titel (optional)
        const title = $article.find('.article-title, .art-title, h2, h3').first().text().trim();

        if (articleNum && content && content.length > 20) {
          articles.push({
            lawCode,
            articleNum: articleNum.replace(/\s+/g, ' '),
            content: `${articleNum}${title ? ' ' + title : ''}\n\n${content}`,
            sourceUrl: url,
            metadata: {
              title: title || articleNum,
            },
          });
          foundArticles = true;
        }
      });

      if (foundArticles) break;
    }

    // Fallback: Wenn keine Artikel gefunden, versuche einfache Textextraktion
    if (articles.length === 0) {
      console.warn(`[Law Scraper] Keine Artikel mit Selektoren gefunden, versuche Textextraktion`);
      
      const bodyText = $('body').text();
      const articleMatches = bodyText.match(/Art\.\s*\d+[a-z]?[^\n]*[\s\S]{0,500}/gi);
      
      if (articleMatches) {
        articleMatches.forEach((match, index) => {
          const lines = match.split('\n');
          const articleNum = lines[0].match(/Art\.\s*\d+[a-z]?/i)?.[0] || `Art. ${index + 1}`;
          
          articles.push({
            lawCode,
            articleNum,
            content: match.trim(),
            sourceUrl: url,
            metadata: {
              title: articleNum,
            },
          });
        });
      }
    }

    console.log(`[Law Scraper] ✓ ${lawCode}: ${articles.length} Artikel extrahiert`);
    return articles;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`[Law Scraper] HTTP Error ${error.response?.status} für ${lawCode}`);
    } else {
      console.error(`[Law Scraper] Error scraping ${lawCode}:`, error);
    }
    return [];
  }
}

export async function scrapeAllLaws(): Promise<LawArticle[]> {
  const allArticles: LawArticle[] = [];

  console.log(`[Law Scraper] Starte Scraping von ${LAW_SOURCES.length} Gesetzen...`);

  for (const law of LAW_SOURCES) {
    const articles = await scrapeLaw(law.code, law.url);
    allArticles.push(...articles);
    
    // Rate Limiting zwischen Gesetzen
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log(`[Law Scraper] ✓ Scraping abgeschlossen: ${allArticles.length} Artikel total`);
  return allArticles;
}
