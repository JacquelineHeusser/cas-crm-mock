/**
 * Test-Script für Risk Score Engine
 * Testet verschiedene Szenarien
 */

import { calculateRiskScore, getScoreDescription } from '../lib/risk-score';
import type { RiskAssessmentInput } from '../lib/risk-score';

console.log('🧪 Risk Score Engine Tests\n');
console.log('='.repeat(60));

// Test 1: Perfektes Szenario (sollte Score A geben)
console.log('\n📊 Test 1: Perfektes Unternehmen');
const perfectCompany: RiskAssessmentInput = {
  company: {
    employees: 25,
    industry: 'IT-Dienstleistungen',
    revenue: 5000000n,
  },
  itStructure: {
    systems: ['Windows Server 2022', 'Office 365', 'Backup-System', 'CRM'],
    endOfLifeSystems: [],
    cloudServices: ['Microsoft Azure', 'Office 365', 'AWS S3 Backup'],
  },
  securityMeasures: {
    firewall: true,
    antivirus: true,
    backup: true,
    mfa: true,
    encryption: true,
    incidentResponse: true,
    securityTraining: true,
    patchManagement: true,
  },
  incidents: {
    lastIncidents: [],
    incidentCount: 0,
    ransomwareAttack: false,
    dataLeak: false,
  },
};

const result1 = calculateRiskScore(perfectCompany);
console.log(`Score: ${result1.score} (${result1.points} Punkte)`);
console.log(`Beschreibung: ${getScoreDescription(result1.score)}`);
console.log(`Underwriting nötig: ${result1.needsUnderwriting ? 'Ja' : 'Nein'}`);
if (result1.reasons.length > 0) {
  console.log('Gründe:', result1.reasons);
}

// Test 2: Mittleres Risiko (sollte Score C geben)
console.log('\n\n📊 Test 2: Mittleres Risiko');
const mediumRisk: RiskAssessmentInput = {
  company: {
    employees: 50,
    industry: 'Baugewerbe',
    revenue: 10000000n,
  },
  itStructure: {
    systems: ['Windows Server 2012', 'Alte ERP-Software'],
    endOfLifeSystems: ['Windows Server 2012'],
    cloudServices: [],
  },
  securityMeasures: {
    firewall: true,
    antivirus: true,
    backup: false,
    mfa: false,
    encryption: false,
    incidentResponse: false,
    securityTraining: false,
    patchManagement: false,
  },
  incidents: {
    lastIncidents: ['Phishing-Angriff 2023'],
    incidentCount: 1,
    ransomwareAttack: false,
    dataLeak: false,
  },
};

const result2 = calculateRiskScore(mediumRisk);
console.log(`Score: ${result2.score} (${result2.points} Punkte)`);
console.log(`Beschreibung: ${getScoreDescription(result2.score)}`);
console.log(`Underwriting nötig: ${result2.needsUnderwriting ? 'Ja' : 'Nein'}`);
console.log('Gründe:', result2.reasons);
console.log('Empfehlungen:', result2.recommendations.slice(0, 3));

// Test 3: Hohes Risiko (sollte Score E geben)
console.log('\n\n📊 Test 3: Hohes Risiko');
const highRisk: RiskAssessmentInput = {
  company: {
    employees: 15,
    industry: 'Rechtsberatung',
    revenue: 3000000n,
  },
  itStructure: {
    systems: ['Windows XP', 'Server 2008'],
    endOfLifeSystems: ['Windows XP', 'Server 2008'],
    cloudServices: [],
  },
  securityMeasures: {
    firewall: false,
    antivirus: false,
    backup: false,
    mfa: false,
    encryption: false,
    incidentResponse: false,
    securityTraining: false,
    patchManagement: false,
  },
  incidents: {
    lastIncidents: ['Ransomware 2023', 'Data Leak 2022'],
    incidentCount: 2,
    ransomwareAttack: true,
    dataLeak: true,
  },
};

const result3 = calculateRiskScore(highRisk);
console.log(`Score: ${result3.score} (${result3.points} Punkte)`);
console.log(`Beschreibung: ${getScoreDescription(result3.score)}`);
console.log(`Underwriting nötig: ${result3.needsUnderwriting ? 'Ja' : 'Nein'}`);
console.log('Gründe:', result3.reasons);
console.log('Empfehlungen:', result3.recommendations.slice(0, 3));

console.log('\n' + '='.repeat(60));
console.log('✅ Tests abgeschlossen');
