/**
 * Risk-Score Berechnung basierend auf Cyber-Sicherheitsfragen
 * 
 * Scoring-System:
 * - A: 100-90% positive Antworten → Direkter Abschluss
 * - B: 89-70% positive Antworten → Direkter Abschluss
 * - C: 69-60% positive Antworten → Underwriting
 * - D: 59-50% positive Antworten → Underwriting
 * - E: < 50% positive Antworten → Underwriting
 */

export type RiskScore = 'A' | 'B' | 'C' | 'D' | 'E';

export interface RiskScoreResult {
  score: RiskScore;
  percentage: number;
  positiveAnswers: number;
  totalAnswers: number;
  canDirectContract: boolean;
  reason: string;
}

export interface CyberSecurityData {
  // Basis-Fragen (alle Unternehmen)
  hadCyberIncidents?: string;
  multipleIncidents?: string;
  incidentDowntime72h?: string;
  incidentFinancialLoss?: string;
  incidentLiabilityClaims?: string;
  businessContinuityAfterITFailure?: string;
  personalDataCount?: string;
  medicalDataCount?: string;
  creditCardDataCount?: string;
  hasEndOfLifeSystems?: string;
  
  // Umsatz > 5 Mio.
  hasMFARemoteAccess?: string;
  hasITEmergencyPlan?: string;
  hasWeeklyBackups?: string;
  hasEncryptedBackups?: string;
  hasOfflineBackups?: string;
  usesIndustrialControlSystems?: string;
  hasOTMFARemoteAccess?: string;
  hasOTFirewallSeparation?: string;
  hasEmailSecuritySolution?: string;
  hasAutomaticUpdates?: string;
  hasAntivirusSoftware?: string;
  hasStrongPasswordPolicies?: string;
  hasAnnualSecurityTraining?: string;
  businessContinuityExternalIT?: string;
  
  // Umsatz > 10 Mio.
  usesCloudServices?: string;
  cloudServiceProviders?: string;
  hasOutsourcedProcesses?: string;
  outsourcedProcessTypes?: string;
  usesRemovableMedia?: string;
  usesSeparateAdminAccounts?: string;
  hasIsolatedBackupAccess?: string;
  hasUniquePasswordPolicy?: string;
  hasFirewallIDSIPS?: string;
  hasRegularPatchManagement?: string;
  hasCriticalPatchManagement?: string;
  hasPhishingSimulations?: string;
  hasSecurityOperationCenter?: string;
  hasOTInventory?: string;
  hasOTSiteSeparation?: string;
  hasOTInternetSeparation?: string;
  hasOTVulnerabilityScans?: string;
  hasOTRegularBackups?: string;
  hasPCICertification?: string;
  protectsMedicalDataGDPR?: string;
  protectsBiometricData?: string;
}

/**
 * Bewertet eine einzelne Antwort und gibt Punkte zurück
 * @param answer Die Antwort (Ja/Nein/Teilweise)
 * @param isPositiveJa Ob "Ja" positiv ist (Standard: true, bei manchen Fragen ist "Nein" besser)
 * @returns Punkte (1 = positiv, 0 = negativ, 0.5 = teilweise)
 */
function scoreAnswer(answer: string | undefined, isPositiveJa: boolean = true): number {
  if (!answer) return 0;
  
  if (isPositiveJa) {
    if (answer === 'Ja') return 1;
    if (answer === 'Teilweise') return 0.5;
    return 0;
  } else {
    if (answer === 'Nein') return 1;
    if (answer === 'Teilweise') return 0.5;
    return 0;
  }
}

/**
 * Bewertet Business Continuity Antworten
 * Je länger der Betrieb aufrechterhalten werden kann, desto besser
 */
function scoreBusinessContinuity(answer: string | undefined): number {
  if (!answer) return 0;
  
  if (answer.includes('eine Woche fortgesetzt werden')) {
    return 1; // Beste Antwort
  } else if (answer.includes('mindestens einen Tag')) {
    return 0.5; // Mittlere Antwort
  } else {
    return 0; // Schlechteste Antwort
  }
}

/**
 * Berechnet den Risk Score basierend auf Cyber-Sicherheitsfragen
 */
export function calculateRiskScore(
  cyberSecurity: CyberSecurityData,
  revenue: number
): RiskScoreResult {
  let totalPoints = 0;
  let maxPoints = 0;
  
  // Basis-Fragen (für alle Unternehmen)
  
  // 1. Cybervorfälle (Nein ist besser)
  if (cyberSecurity.hadCyberIncidents) {
    totalPoints += scoreAnswer(cyberSecurity.hadCyberIncidents, false);
    maxPoints += 1;
  }
  
  // Bedingte Fragen bei Cybervorfällen
  if (cyberSecurity.hadCyberIncidents === 'Ja') {
    // Mehrere Vorfälle (Nein ist besser)
    if (cyberSecurity.multipleIncidents) {
      totalPoints += scoreAnswer(cyberSecurity.multipleIncidents, false);
      maxPoints += 1;
    }
    
    // Ausfall > 72h (Nein ist besser)
    if (cyberSecurity.incidentDowntime72h) {
      totalPoints += scoreAnswer(cyberSecurity.incidentDowntime72h, false);
      maxPoints += 1;
    }
    
    // Finanzieller Schaden (Nein ist besser)
    if (cyberSecurity.incidentFinancialLoss) {
      totalPoints += scoreAnswer(cyberSecurity.incidentFinancialLoss, false);
      maxPoints += 1;
    }
    
    // Haftpflichtansprüche (Nein ist besser)
    if (cyberSecurity.incidentLiabilityClaims) {
      totalPoints += scoreAnswer(cyberSecurity.incidentLiabilityClaims, false);
      maxPoints += 1;
    }
    
    // Business Continuity interne IT
    if (cyberSecurity.businessContinuityAfterITFailure) {
      totalPoints += scoreBusinessContinuity(cyberSecurity.businessContinuityAfterITFailure);
      maxPoints += 1;
    }
  }
  
  // 2. End-of-Life Systeme (Nein ist besser)
  if (cyberSecurity.hasEndOfLifeSystems) {
    totalPoints += scoreAnswer(cyberSecurity.hasEndOfLifeSystems, false);
    maxPoints += 1;
  }
  
  // Umsatz > 5 Mio. Fragen
  if (revenue > 5_000_000) {
    // Alle "Ja"-Antworten sind positiv
    const revenue5Questions = [
      cyberSecurity.hasMFARemoteAccess,
      cyberSecurity.hasITEmergencyPlan,
      cyberSecurity.hasWeeklyBackups,
      cyberSecurity.hasEncryptedBackups,
      cyberSecurity.hasOfflineBackups,
      cyberSecurity.hasEmailSecuritySolution,
      cyberSecurity.hasAutomaticUpdates,
      cyberSecurity.hasAntivirusSoftware,
      cyberSecurity.hasStrongPasswordPolicies,
      cyberSecurity.hasAnnualSecurityTraining,
    ];
    
    for (const answer of revenue5Questions) {
      if (answer) {
        totalPoints += scoreAnswer(answer, true);
        maxPoints += 1;
      }
    }
    
    // OT-spezifische Fragen (nur wenn OT genutzt wird)
    if (cyberSecurity.usesIndustrialControlSystems === 'Ja') {
      if (cyberSecurity.hasOTMFARemoteAccess) {
        totalPoints += scoreAnswer(cyberSecurity.hasOTMFARemoteAccess, true);
        maxPoints += 1;
      }
      if (cyberSecurity.hasOTFirewallSeparation) {
        totalPoints += scoreAnswer(cyberSecurity.hasOTFirewallSeparation, true);
        maxPoints += 1;
      }
    }
  }
  
  // Umsatz > 10 Mio. Fragen
  if (revenue > 10_000_000) {
    // Business Continuity externe IT
    if (cyberSecurity.businessContinuityExternalIT) {
      totalPoints += scoreBusinessContinuity(cyberSecurity.businessContinuityExternalIT);
      maxPoints += 1;
    }
    
    // Wechseldatenträger (Nein ist besser)
    if (cyberSecurity.usesRemovableMedia) {
      totalPoints += scoreAnswer(cyberSecurity.usesRemovableMedia, false);
      maxPoints += 1;
    }
    
    // Alle "Ja" oder "Teilweise" Antworten sind positiv
    const revenue10Questions = [
      cyberSecurity.usesSeparateAdminAccounts,
      cyberSecurity.hasIsolatedBackupAccess,
      cyberSecurity.hasUniquePasswordPolicy,
      cyberSecurity.hasFirewallIDSIPS,
      cyberSecurity.hasRegularPatchManagement,
      cyberSecurity.hasCriticalPatchManagement,
      cyberSecurity.hasPhishingSimulations,
      cyberSecurity.hasSecurityOperationCenter,
    ];
    
    for (const answer of revenue10Questions) {
      if (answer) {
        totalPoints += scoreAnswer(answer, true);
        maxPoints += 1;
      }
    }
    
    // Erweiterte OT-Fragen (nur wenn OT genutzt wird)
    if (cyberSecurity.usesIndustrialControlSystems === 'Ja') {
      const otQuestions = [
        cyberSecurity.hasOTInventory,
        cyberSecurity.hasOTSiteSeparation,
        cyberSecurity.hasOTInternetSeparation,
        cyberSecurity.hasOTVulnerabilityScans,
        cyberSecurity.hasOTRegularBackups,
      ];
      
      for (const answer of otQuestions) {
        if (answer) {
          totalPoints += scoreAnswer(answer, true);
          maxPoints += 1;
        }
      }
    }
    
    // Compliance-Fragen (alle "Ja" sind positiv)
    if (cyberSecurity.hasPCICertification) {
      totalPoints += scoreAnswer(cyberSecurity.hasPCICertification, true);
      maxPoints += 1;
    }
    if (cyberSecurity.protectsMedicalDataGDPR) {
      totalPoints += scoreAnswer(cyberSecurity.protectsMedicalDataGDPR, true);
      maxPoints += 1;
    }
    if (cyberSecurity.protectsBiometricData) {
      totalPoints += scoreAnswer(cyberSecurity.protectsBiometricData, true);
      maxPoints += 1;
    }
  }
  
  // Berechne Prozentsatz
  const percentage = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;
  
  // Bestimme Risk Score
  let score: RiskScore;
  let canDirectContract: boolean;
  let reason: string;
  
  if (percentage >= 90) {
    score = 'A';
    canDirectContract = true;
    reason = 'Hervorragende Cyber-Sicherheit (≥ 90%)';
  } else if (percentage >= 70) {
    score = 'B';
    canDirectContract = true;
    reason = 'Gute Cyber-Sicherheit (70-89%)';
  } else if (percentage >= 60) {
    score = 'C';
    canDirectContract = false;
    reason = 'Ausreichende Cyber-Sicherheit (60-69%) - Underwriting erforderlich';
  } else if (percentage >= 50) {
    score = 'D';
    canDirectContract = false;
    reason = 'Verbesserungswürdige Cyber-Sicherheit (50-59%) - Underwriting erforderlich';
  } else {
    score = 'E';
    canDirectContract = false;
    reason = 'Unzureichende Cyber-Sicherheit (< 50%) - Underwriting erforderlich';
  }
  
  return {
    score,
    percentage: Math.round(percentage * 10) / 10, // Runde auf 1 Dezimalstelle
    positiveAnswers: Math.round(totalPoints * 10) / 10,
    totalAnswers: maxPoints,
    canDirectContract,
    reason,
  };
}
