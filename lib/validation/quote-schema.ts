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

// Schritt 1: Unternehmensdaten
export const companyDataSchema = z.object({
  companyName: z.string().min(1, 'Pflichtfeld'),
  address: z.string().min(1, 'Pflichtfeld'),
  zip: z.string().min(1, 'Pflichtfeld').regex(/^\d{4}$/, 'PLZ muss 4-stellig sein'),
  city: z.string().min(1, 'Pflichtfeld'),
  country: z.string().default('CH'),
  url: z.string().url('Ungültige URL').optional().or(z.literal('')),
  industry: z.enum(INDUSTRIES),
  revenue: z.number().min(0, 'Umsatz muss positiv sein'),
  employees: z.number().int().min(1, 'Mindestens 1 Mitarbeiter').max(250, 'Maximal 250 Mitarbeiter'),
});

// Schritt 2: IT-Struktur
export const itStructureSchema = z.object({
  itSystemsCount: z.number().int().min(1, 'Pflichtfeld'),
  hasEndOfLifeSystems: z.enum(['yes', 'no']),
  hasCloudServices: z.enum(['yes', 'no']),
  hasBackupSystem: z.enum(['yes', 'no']),
});

// Schritt 3: Sicherheitsmassnahmen
export const securityMeasuresSchema = z.object({
  firewall: z.boolean(),
  antivirus: z.boolean(),
  backup: z.boolean(),
  mfa: z.boolean(),
  encryption: z.boolean(),
  incidentResponse: z.boolean(),
  securityTraining: z.boolean(),
  patchManagement: z.boolean(),
});

// Schritt 4: Cybervorfälle
export const incidentsSchema = z.object({
  hasIncidents: z.enum(['yes', 'no']),
  incidentCount: z.number().int().min(0).optional(),
  ransomwareAttack: z.boolean().default(false),
  dataLeak: z.boolean().default(false),
});

// Schritt 5: Deckungswünsche
export const coverageSchema = z.object({
  coverageVariant: z.enum(['basic', 'standard', 'optimum']),
  sumInsured: z.number().min(100000, 'Mindestens CHF 100\'000').max(5000000, 'Maximal CHF 5\'000\'000'),
  deductible: z.number().min(5000, 'Mindestens CHF 5\'000').max(50000, 'Maximal CHF 50\'000'),
});

// Vollständiges Offert-Schema
export const fullQuoteSchema = z.object({
  company: companyDataSchema,
  itStructure: itStructureSchema,
  securityMeasures: securityMeasuresSchema,
  incidents: incidentsSchema,
  coverage: coverageSchema,
});

// TypeScript Types aus Schemas
export type CompanyData = z.infer<typeof companyDataSchema>;
export type ITStructure = z.infer<typeof itStructureSchema>;
export type SecurityMeasures = z.infer<typeof securityMeasuresSchema>;
export type Incidents = z.infer<typeof incidentsSchema>;
export type Coverage = z.infer<typeof coverageSchema>;
export type FullQuote = z.infer<typeof fullQuoteSchema>;
