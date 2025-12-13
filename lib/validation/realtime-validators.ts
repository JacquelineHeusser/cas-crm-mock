/**
 * Echtzeit-Validierungsfunktionen für Formular-Inputs
 * Asynchrone Validierung mit detailliertem Feedback
 */

import { 
  isValidZip, 
  getValidCitiesForZip, 
  validateZipCityMatch,
  searchCities 
} from '@/lib/data/swiss-zip-codes';

// Validierungs-Ergebnis Typ
export interface ValidationResult {
  isValid: boolean;
  message?: string;
  suggestions?: string[];
}

/**
 * Validiert eine Schweizer Adresse
 * Prüft auf typische Muster: Strassenname + Hausnummer
 */
export async function validateSwissAddress(address: string): Promise<ValidationResult> {
  if (!address || address.trim().length === 0) {
    return {
      isValid: false,
      message: 'Bitte geben Sie eine Adresse ein',
    };
  }

  // Mindestlänge prüfen
  if (address.trim().length < 3) {
    return {
      isValid: false,
      message: 'Die Adresse ist zu kurz',
    };
  }

  // Typisches Schweizer Adressen-Muster: Strassenname + Hausnummer
  // Beispiele: "Bahnhofstrasse 12", "Hauptstr. 5a", "Rue de la Gare 23"
  const addressPattern = /^[a-zäöüéèàA-ZÄÖÜÉÈÀ\s.\-']+\s+\d+[a-zA-Z]?$/;
  
  if (!addressPattern.test(address.trim())) {
    return {
      isValid: false,
      message: 'Bitte geben Sie eine gültige Adresse ein (z.B. "Bahnhofstrasse 12")',
      suggestions: ['Format: Strassenname + Hausnummer', 'Beispiel: Hauptstrasse 42'],
    };
  }

  return {
    isValid: true,
    message: 'Gültige Adresse',
  };
}

/**
 * Validiert eine Schweizer Postleitzahl (4-stellig)
 * Prüft gegen PLZ-Datenbank
 */
export async function validateSwissZip(zip: string): Promise<ValidationResult> {
  if (!zip || zip.trim().length === 0) {
    return {
      isValid: false,
      message: 'Bitte geben Sie eine PLZ ein',
    };
  }

  // Muss exakt 4 Ziffern sein
  const zipPattern = /^\d{4}$/;
  
  if (!zipPattern.test(zip.trim())) {
    return {
      isValid: false,
      message: 'PLZ muss 4-stellig sein',
    };
  }

  // Prüfen ob PLZ im gültigen Bereich liegt (1000-9999)
  const zipNumber = parseInt(zip, 10);
  if (zipNumber < 1000 || zipNumber > 9999) {
    return {
      isValid: false,
      message: 'Ungültige Schweizer PLZ (1000-9999)',
    };
  }

  // Prüfen ob PLZ in Datenbank existiert
  if (!isValidZip(zip.trim())) {
    return {
      isValid: false,
      message: 'PLZ nicht in Datenbank gefunden',
      suggestions: ['Die PLZ wird trotzdem akzeptiert'],
    };
  }

  // Zeige zugehörige Orte als Info
  const cities = getValidCitiesForZip(zip.trim());
  
  return {
    isValid: true,
    message: 'Gültige PLZ',
    suggestions: cities.length > 0 ? [`Ort: ${cities.join(', ')}`] : undefined,
  };
}

/**
 * Validiert einen Ortsnamen in Kombination mit PLZ
 * Prüft gegen PLZ-Datenbank und bietet Vorschläge
 */
export async function validateCity(city: string, zip?: string): Promise<ValidationResult> {
  if (!city || city.trim().length === 0) {
    return {
      isValid: false,
      message: 'Bitte geben Sie einen Ort ein',
    };
  }

  // Mindestlänge prüfen
  if (city.trim().length < 2) {
    return {
      isValid: false,
      message: 'Der Ortsname ist zu kurz',
    };
  }

  // Erlaubte Zeichen: Buchstaben, Umlaute, Bindestriche, Leerzeichen
  const cityPattern = /^[a-zäöüéèàA-ZÄÖÜÉÈÀ\s\-']+$/;
  
  if (!cityPattern.test(city.trim())) {
    return {
      isValid: false,
      message: 'Der Ortsname enthält ungültige Zeichen',
    };
  }

  // Wenn PLZ angegeben, prüfe ob Ort und PLZ zusammenpassen
  if (zip && zip.trim().length === 4) {
    const isMatch = validateZipCityMatch(zip.trim(), city.trim());
    
    if (!isMatch) {
      const validCities = getValidCitiesForZip(zip.trim());
      
      if (validCities.length > 0) {
        return {
          isValid: false,
          message: `Ort passt nicht zu PLZ ${zip}`,
          suggestions: [`Vorschläge: ${validCities.join(', ')}`],
        };
      }
    } else {
      return {
        isValid: true,
        message: 'Ort und PLZ passen zusammen',
      };
    }
  }

  // Fuzzy Search für Vorschläge
  const similarCities = searchCities(city.trim(), 3);
  
  if (similarCities.length > 0) {
    const suggestions = similarCities.map(
      entry => `${entry.city} (${entry.zip})`
    );
    
    return {
      isValid: true,
      message: 'Gültiger Ort',
      suggestions: suggestions.length > 0 ? [`Ähnliche Orte: ${suggestions.join(', ')}`] : undefined,
    };
  }

  return {
    isValid: true,
    message: 'Gültiger Ort',
  };
}

/**
 * Validiert eine URL (Format und optional Erreichbarkeit)
 * Basis-Validierung hier, Erreichbarkeits-Check in Server Action
 */
export async function validateUrl(url: string): Promise<ValidationResult> {
  if (!url || url.trim().length === 0) {
    // URL ist optional, also nicht als Fehler werten
    return {
      isValid: true,
    };
  }

  // URL muss mit http:// oder https:// starten (oder wir ergänzen es)
  let urlToValidate = url.trim();
  
  if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://')) {
    urlToValidate = 'https://' + urlToValidate;
  }

  // URL-Format validieren
  try {
    const urlObject = new URL(urlToValidate);
    
    // Prüfen ob Domain vorhanden ist
    if (!urlObject.hostname || urlObject.hostname.length < 3) {
      return {
        isValid: false,
        message: 'Ungültige URL-Struktur',
      };
    }

    // Prüfen ob Domain mindestens einen Punkt hat (.ch, .com, etc.)
    if (!urlObject.hostname.includes('.')) {
      return {
        isValid: false,
        message: 'URL benötigt eine gültige Domain (z.B. .ch, .com)',
      };
    }

    return {
      isValid: true,
      message: 'Gültiges URL-Format',
      suggestions: ['Die Erreichbarkeit wird beim Speichern geprüft'],
    };
  } catch (error) {
    return {
      isValid: false,
      message: 'Ungültiges URL-Format',
      suggestions: ['Beispiel: www.firma.ch oder https://firma.ch'],
    };
  }
}

/**
 * Validiert einen Firmennamen
 * Basis-Prüfung, später optional mit Duplikaten-Check
 */
export async function validateCompanyName(name: string): Promise<ValidationResult> {
  if (!name || name.trim().length === 0) {
    return {
      isValid: false,
      message: 'Bitte geben Sie einen Firmennamen ein',
    };
  }

  // Mindestlänge
  if (name.trim().length < 2) {
    return {
      isValid: false,
      message: 'Der Firmenname ist zu kurz',
    };
  }

  // Maximal 200 Zeichen
  if (name.trim().length > 200) {
    return {
      isValid: false,
      message: 'Der Firmenname ist zu lang (max. 200 Zeichen)',
    };
  }

  // Erlaubte Zeichen: Buchstaben, Zahlen, Umlaute, übliche Firmen-Zeichen
  const namePattern = /^[a-zäöüéèàA-ZÄÖÜÉÈÀ0-9\s\-'.&,()]+$/;
  
  if (!namePattern.test(name.trim())) {
    return {
      isValid: false,
      message: 'Der Firmenname enthält ungültige Zeichen',
    };
  }

  // TODO: Optional Duplikaten-Check in Phase 4
  // Placeholder: Alle Namen sind gültig

  return {
    isValid: true,
    message: 'Gültiger Firmenname',
  };
}

/**
 * Hilfsfunktion: Debounce für async Funktionen
 * Verhindert zu häufige API-Calls während der Eingabe
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        resolve(func(...args));
      }, waitMs);
    });
  };
}
