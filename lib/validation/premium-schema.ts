/**
 * Validation Schema für Prämien-Auswahl
 */

import { z } from 'zod';

export const premiumSchema = z.object({
  package: z.enum(['BASIC', 'OPTIMUM', 'PREMIUM']),
});

export type PremiumData = z.infer<typeof premiumSchema>;

// Paket-Definitionen
export const PACKAGES = {
  BASIC: {
    name: 'BASIC',
    price: 2500,
    coverages: [
      'Cyber Daten- und Systemwiederherstellung',
      'Cyber Krisenmanagement',
      'Cyber Haftpflicht',
      'Cyber Rechtsschutz',
    ],
    eigenSchadenSum: 100000,      // CHF 100'000
    haftpflichtSum: 500000,       // CHF 500'000
    rechtsschutzSum: 50000,       // CHF 50'000
    crimeSum: 0,                  // Nicht verfügbar
    deductible: 1000,             // CHF 1'000
    waitingPeriod: 'n/a',         // Nicht verfügbar
  },
  OPTIMUM: {
    name: 'OPTIMUM',
    price: 4200,
    coverages: [
      'Cyber Daten- und Systemwiederherstellung',
      'Cyber Krisenmanagement',
      'Cyber Haftpflicht',
      'Cyber Rechtsschutz',
      'Cyber Betriebsunterbruch',
    ],
    eigenSchadenSum: 250000,      // CHF 250'000
    haftpflichtSum: 500000,       // CHF 500'000
    rechtsschutzSum: 50000,       // CHF 50'000
    crimeSum: 0,                  // Nicht verfügbar
    deductible: 1000,             // CHF 1'000
    waitingPeriod: '24 Stunden',  // 24h
  },
  PREMIUM: {
    name: 'PREMIUM',
    price: 6800,
    coverages: [
      'Cyber Daten- und Systemwiederherstellung',
      'Cyber Krisenmanagement',
      'Cyber Haftpflicht',
      'Cyber Rechtsschutz',
      'Cyber Betriebsunterbruch',
      'Cyber Diebstahl',
      'Cyber Betrug',
    ],
    eigenSchadenSum: 500000,      // CHF 500'000
    haftpflichtSum: 1000000,      // CHF 1'000'000
    rechtsschutzSum: 50000,       // CHF 50'000
    crimeSum: 250000,             // CHF 250'000
    deductible: 500,              // CHF 500
    waitingPeriod: '12 Stunden',  // 12h
  },
};
