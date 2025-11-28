/**
 * Zod Validation Schemas für Cyber-Offertrechner
 * Mehrstufiges Formular mit Validierung
 */

import { z } from 'zod';

// Branchen-Optionen (alphabetisch sortiert)
export const INDUSTRIES = [
  'Bauwesen',
  'Beratungs-, Wissenschafts- und technische Dienstleistungen',
  'Bergbau, Steinbruch und Erdöl- und Erdgasförderung',
  'Bildungsdienste',
  'Einzelhandel',
  'Energie',
  'Finanzen und Versicherungen',
  'Gesundheits- und Sozialwesen',
  'Grosshandel',
  'Herstellung',
  'Immobilien und Vermietung und Leasing',
  'Information',
  'Kunst, Unterhaltung und Erholung',
  'Landwirtschaft, Forstwirtschaft, Fischerei und Jagd',
  'Öffentliche Verwaltung',
  'Sonstige',
  'Transport und Lagerung',
  'Unterkunft und Verpflegungsdienste',
  'Versorgungsunternehmen',
  'Verwaltung von Unternehmen und Betrieben',
  'Verwaltungs-, Unterstützungs-, Abfallwirtschafts- und Sanierungsdienste',
] as const;

// Sektion: Unternehmensdaten
export const companyDataSchema = z.object({
  companyName: z.string().min(1, 'Pflichtfeld'),
  address: z.string().min(1, 'Pflichtfeld'),
  zip: z.string().min(1, 'Pflichtfeld').regex(/^\d{4}$/, 'PLZ muss 4-stellig sein'),
  city: z.string().min(1, 'Pflichtfeld'),
  country: z.string().default('Schweiz'),
  url: z.string().optional().or(z.literal('')),
});

// Sektion: Cyber Risikoprofil
export const cyberRiskProfileSchema = z.object({
  industry: z.enum(INDUSTRIES),
  noForeignSubsidiaries: z.enum(['Trifft zu', 'Trifft nicht zu']),
  noRejectedInsurance: z.enum(['Trifft zu', 'Trifft nicht zu']),
  employees: z.number().int().min(1, 'Pflichtfeld'),
  revenue: z.number().min(0, 'Pflichtfeld'),
  eCommercePercentage: z.enum(['0%', '1 - 25%', '26 - 50%', 'Mehr als 50%']),
  foreignRevenuePercentage: z.enum(['0%', '1 - 25%', '26 - 50%', 'Mehr als 50%']),
});

// Sektion: Cyber-Sicherheit
export const cyberSecuritySchema = z.object({
  hadCyberIncidents: z.enum(['Ja', 'Nein']),
  multipleIncidents: z.enum(['Ja', 'Nein']).optional(),
  incidentDowntime72h: z.enum(['Ja', 'Nein']).optional(),
  incidentFinancialLoss: z.enum(['Ja', 'Nein']).optional(),
  incidentLiabilityClaims: z.enum(['Ja', 'Nein']).optional(),
  businessContinuityAfterITFailure: z.enum([
    'Alle Geschäftsprozesse können eine Woche fortgesetzt werden.',
    'Die meisten Geschäftsprozesse können eine Woche fortgesetzt werden.',
    'Die meisten Geschäftsprozesse können mindestens einen Tag, aber weniger als eine Woche, fortgesetzt werden.',
    'Die meisten Geschäftsprozesse können weniger als einen Tag fortgesetzt werden oder kommen sofort zum Erliegen.'
  ]).optional(),
  personalDataCount: z.enum(['Keine', 'Bis 1\'000', 'Bis 10\'000', 'Bis 100\'000', 'Bis 1\'000\'000', 'Mehr als 1\'000\'000']),
  medicalDataCount: z.enum(['Keine', 'Nur von Mitarbeitenden', 'Bis 10\'000', 'Bis 100\'000', 'Bis 1\'000\'000', 'Mehr als 1\'000\'000']),
  creditCardDataCount: z.enum(['Keine oder durch einen externen Dienstleister verarbeitet', 'Nur von Mitarbeitenden', 'Bis 10\'000', 'Bis 100\'000', 'Bis 1\'000\'000', 'Mehr als 1\'000\'000']),
  hasEndOfLifeSystems: z.enum(['Ja', 'Nein']),
});

// Sektion: Versicherte Leistungen
export const coverageSchema = z.object({
  package: z.enum(['BASIC', 'OPTIMUM', 'PREMIUM']),
  sumInsuredProperty: z.enum(['CHF 50\'000', 'CHF 100\'000', 'CHF 250\'000', 'CHF 500\'000', 'CHF 1\'000\'000', 'CHF 2\'000\'000']),
  sumInsuredLiability: z.enum(['CHF 500\'000', 'CHF 1\'000\'000', 'CHF 2\'000\'000']),
  sumInsuredLegalProtection: z.enum(['CHF 25\'000', 'CHF 50\'000', 'CHF 100\'000']),
  sumInsuredCyberCrime: z.enum(['CHF 50\'000', 'CHF 100\'000', 'CHF 250\'000']).optional(),
  deductible: z.enum(['CHF 0', 'CHF 500', 'CHF 1\'000', 'CHF 2\'500', 'CHF 5\'000']),
  waitingPeriod: z.enum(['12h', '24h', '48h']).optional(),
});


// Sektion: Zusammenfassung (keine Validierung nötig - nur Anzeige)
export const summarySchema = z.object({});

// Sektion: Bestätigung
export const confirmationSchema = z.object({
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Sie müssen die Bedingungen akzeptieren',
  }),
});

// Vollständiges Offert-Schema
export const fullQuoteSchema = z.object({
  companyData: companyDataSchema,
  cyberRiskProfile: cyberRiskProfileSchema,
  cyberSecurity: cyberSecuritySchema,
  coverage: coverageSchema,
  confirmation: confirmationSchema,
});

// TypeScript Types aus Schemas
export type CompanyData = z.infer<typeof companyDataSchema>;
export type CyberRiskProfile = z.infer<typeof cyberRiskProfileSchema>;
export type CyberSecurity = z.infer<typeof cyberSecuritySchema>;
export type Coverage = z.infer<typeof coverageSchema>;
export type FullQuote = z.infer<typeof fullQuoteSchema>;
