/**
 * TypeScript Types für Risk Score Calculation
 */

import { RiskScore } from '@prisma/client';

// IT-Struktur Daten
export interface ITStructureData {
  systems: string[]; // Liste aller genutzten Systeme
  endOfLifeSystems: string[]; // Veraltete/nicht mehr unterstützte Systeme
  cloudServices: string[]; // Genutzte Cloud-Dienste
}

// Sicherheitsmassnahmen
export interface SecurityMeasures {
  firewall: boolean; // Firewall aktiv
  antivirus: boolean; // Antivirus-Software
  backup: boolean; // Regelmässige Backups
  mfa: boolean; // Multi-Faktor-Authentifizierung
  encryption: boolean; // Datenverschlüsselung
  incidentResponse: boolean; // Incident Response Plan
  securityTraining: boolean; // Mitarbeiter-Schulungen
  patchManagement: boolean; // Regelmässige Updates
}

// Bisherige Cybervorfälle
export interface IncidentsData {
  lastIncidents: string[]; // Beschreibungen der letzten Vorfälle
  incidentCount: number; // Anzahl Vorfälle in letzten 3 Jahren
  ransomwareAttack: boolean; // Ransomware-Angriff erlebt
  dataLeak: boolean; // Datenleck erlebt
}

// Unternehmensdaten (relevant für Risiko)
export interface CompanyRiskData {
  employees: number; // Anzahl Mitarbeitende
  industry: string; // Branche
  revenue: bigint; // Jahresumsatz in Rappen
}

// Vollständige Risikodaten für Score-Berechnung
export interface RiskAssessmentInput {
  company: CompanyRiskData;
  itStructure: ITStructureData;
  securityMeasures: SecurityMeasures;
  incidents: IncidentsData;
}

// Ergebnis der Risk Score Berechnung
export interface RiskAssessmentResult {
  score: RiskScore; // A, B, C, D, E
  points: number; // Gesamtpunkte (0-100, je höher desto schlechter)
  reasons: string[]; // Liste der Gründe für den Score
  needsUnderwriting: boolean; // true wenn C-E
  recommendations: string[]; // Empfehlungen zur Verbesserung
}
