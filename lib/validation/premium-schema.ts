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
    eigenSchadenSum: 100000,
    haftpflichtSum: 1000000,
    rechtsschutzSum: 50000,
    crimeSum: 0,
    deductible: 5000,
    waitingPeriod: 'n/a',
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
    eigenSchadenSum: 250000,
    haftpflichtSum: 2000000,
    rechtsschutzSum: 50000,
    crimeSum: 0,
    deductible: 2500,
    waitingPeriod: '48 Stunden',
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
    eigenSchadenSum: 500000,
    haftpflichtSum: 5000000,
    rechtsschutzSum: 50000,
    crimeSum: 250000,
    deductible: 0,
    waitingPeriod: '24 Stunden',
  },
};
