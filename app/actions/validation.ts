/**
 * Server Actions für Validierung
 * Async Validierung die nur serverseitig möglich ist (z.B. URL-Checks)
 */

'use server';

import { ValidationResult } from '@/lib/validation/realtime-validators';

/**
 * Prüft ob eine URL erreichbar ist
 * Führt einen DNS-Lookup und optional einen HEAD-Request durch
 */
export async function checkUrlReachability(url: string): Promise<ValidationResult> {
  if (!url || url.trim().length === 0) {
    return {
      isValid: true, // URL ist optional
    };
  }

  // Normalisiere URL
  let urlToCheck = url.trim();
  
  if (!urlToCheck.startsWith('http://') && !urlToCheck.startsWith('https://')) {
    urlToCheck = 'https://' + urlToCheck;
  }

  try {
    const urlObject = new URL(urlToCheck);
    
    // Prüfe ob Domain vorhanden ist
    if (!urlObject.hostname || urlObject.hostname.length < 3) {
      return {
        isValid: false,
        message: 'Ungültige URL-Struktur',
      };
    }

    // Versuche die URL zu erreichen (HEAD-Request mit Timeout)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 Sekunden Timeout

      const response = await fetch(urlToCheck, {
        method: 'HEAD',
        signal: controller.signal,
        // Keine Cookies oder andere sensible Daten mitsenden
        credentials: 'omit',
        // Folge Redirects
        redirect: 'follow',
      });

      clearTimeout(timeoutId);

      // Akzeptiere alle 2xx und 3xx Status Codes
      if (response.ok || (response.status >= 300 && response.status < 400)) {
        return {
          isValid: true,
          message: 'URL ist erreichbar',
        };
      }

      // 4xx oder 5xx Fehler
      return {
        isValid: false,
        message: `URL nicht erreichbar (Status: ${response.status})`,
        suggestions: ['Bitte überprüfen Sie die URL'],
      };

    } catch (fetchError: any) {
      // Timeout oder Netzwerk-Fehler
      if (fetchError.name === 'AbortError') {
        return {
          isValid: false,
          message: 'URL-Check Timeout (> 5 Sekunden)',
          suggestions: ['Die URL wird trotzdem gespeichert'],
        };
      }

      // DNS-Fehler oder Server nicht erreichbar
      return {
        isValid: false,
        message: 'URL nicht erreichbar',
        suggestions: ['Bitte überprüfen Sie die URL', 'Die URL wird trotzdem gespeichert'],
      };
    }

  } catch (error) {
    // Ungültiges URL-Format
    return {
      isValid: false,
      message: 'Ungültiges URL-Format',
      suggestions: ['Beispiel: www.firma.ch oder https://firma.ch'],
    };
  }
}

/**
 * Validiert eine E-Mail-Adresse (optional für zukünftige Features)
 */
export async function validateEmail(email: string): Promise<ValidationResult> {
  if (!email || email.trim().length === 0) {
    return {
      isValid: false,
      message: 'Bitte geben Sie eine E-Mail-Adresse ein',
    };
  }

  // Basis E-Mail Regex
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailPattern.test(email.trim())) {
    return {
      isValid: false,
      message: 'Ungültige E-Mail-Adresse',
    };
  }

  return {
    isValid: true,
    message: 'Gültige E-Mail-Adresse',
  };
}

/**
 * Prüft ob ein Firmenname bereits existiert (optional)
 * Kann später mit Datenbank-Check erweitert werden
 */
export async function checkCompanyNameExists(name: string): Promise<ValidationResult> {
  if (!name || name.trim().length === 0) {
    return {
      isValid: true,
    };
  }

  // TODO: Datenbank-Check in späteren Phasen
  // Placeholder: Keine Duplikate
  
  return {
    isValid: true,
    message: 'Firmenname verfügbar',
  };
}
