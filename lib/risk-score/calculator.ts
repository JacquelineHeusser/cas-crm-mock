/**
 * Risk Score Calculation Engine
 * Berechnet den Risiko-Score (A-E) basierend auf IT-Sicherheit, Vorfällen etc.
 */

import { RiskScore } from '@prisma/client';
import type {
  RiskAssessmentInput,
  RiskAssessmentResult,
} from './types';

/**
 * Hauptfunktion: Berechnet den Risk Score
 * Basiert auf prozentualer Bewertung positiver Antworten
 */
export function calculateRiskScore(
  input: RiskAssessmentInput
): RiskAssessmentResult {
  let positivePoints = 0;
  let maxPoints = 0;
  const reasons: string[] = [];
  const recommendations: string[] = [];

  // 1. IT-Struktur bewerten
  const { positive: itPositive, max: itMax } = evaluateITStructure(
    input.itStructure,
    reasons,
    recommendations
  );
  positivePoints += itPositive;
  maxPoints += itMax;

  // 2. Sicherheitsmassnahmen bewerten
  const { positive: securityPositive, max: securityMax } = evaluateSecurityMeasures(
    input.securityMeasures,
    reasons,
    recommendations
  );
  positivePoints += securityPositive;
  maxPoints += securityMax;

  // 3. Vorfälle bewerten
  const { positive: incidentPositive, max: incidentMax } = evaluateIncidents(
    input.incidents,
    reasons,
    recommendations
  );
  positivePoints += incidentPositive;
  maxPoints += incidentMax;

  // 4. Prozentsatz berechnen
  const percentage = maxPoints > 0 ? (positivePoints / maxPoints) * 100 : 0;

  // 5. Score zuweisen basierend auf Prozentsatz
  const score = assignScore(percentage);

  // 6. Underwriting-Bedarf prüfen
  const needsUnderwriting = score === RiskScore.C || score === RiskScore.D || score === RiskScore.E;

  return {
    score,
    points: Math.round(percentage),
    reasons,
    needsUnderwriting,
    recommendations,
  };
}

/**
 * Bewertet die IT-Struktur
 * Zählt positive Aspekte
 */
function evaluateITStructure(
  itStructure: RiskAssessmentInput['itStructure'],
  reasons: string[],
  recommendations: string[]
): { positive: number; max: number } {
  let positive = 0;
  const max = 3; // 3 mögliche positive Aspekte

  // 1. Keine End-of-Life Systeme (positiv)
  if (itStructure.endOfLifeSystems.length === 0) {
    positive++;
  } else {
    reasons.push(
      `${itStructure.endOfLifeSystems.length} veraltete(s) System(e) ohne Support (${itStructure.endOfLifeSystems.join(', ')})`
    );
    recommendations.push(
      'Aktualisieren Sie veraltete Systeme auf aktuelle Versionen'
    );
  }

  // 2. Cloud-Services vorhanden (positiv)
  if (itStructure.cloudServices.length > 0) {
    positive++;
  } else {
    reasons.push('Keine Cloud-Backup- oder Redundanz-Lösung');
    recommendations.push(
      'Erwägen Sie Cloud-Backups für bessere Datensicherheit'
    );
  }

  // 3. Mindestens 3 Systeme (ausreichende IT-Infrastruktur)
  if (itStructure.systems.length >= 3) {
    positive++;
  } else {
    reasons.push('Sehr einfache IT-Infrastruktur');
  }

  return { positive, max };
}

/**
 * Bewertet Sicherheitsmassnahmen
 * Zählt vorhandene positive Massnahmen
 */
function evaluateSecurityMeasures(
  measures: RiskAssessmentInput['securityMeasures'],
  reasons: string[],
  recommendations: string[]
): { positive: number; max: number } {
  let positive = 0;
  const max = 8; // 8 mögliche Sicherheitsmassnahmen

  // Alle Massnahmen prüfen
  const allMeasures = [
    { key: 'firewall', name: 'Firewall', rec: 'Implementieren Sie eine Firewall' },
    { key: 'antivirus', name: 'Antivirus', rec: 'Installieren Sie Antivirus-Software' },
    { key: 'backup', name: 'Backup', rec: 'Richten Sie regelmässige Backups ein' },
    { key: 'mfa', name: 'Multi-Faktor-Authentifizierung', rec: 'Aktivieren Sie MFA für alle kritischen Systeme' },
    { key: 'encryption', name: 'Verschlüsselung', rec: 'Verschlüsseln Sie sensible Daten' },
    { key: 'incidentResponse', name: 'Incident Response Plan', rec: 'Erstellen Sie einen Notfallplan für Cyberangriffe' },
    { key: 'securityTraining', name: 'Sicherheitsschulungen', rec: 'Schulen Sie Mitarbeiter regelmässig zu IT-Sicherheit' },
    { key: 'patchManagement', name: 'Patch Management', rec: 'Implementieren Sie regelmässige Update-Prozesse' },
  ];

  allMeasures.forEach(({ key, name, rec }) => {
    if (measures[key as keyof typeof measures]) {
      positive++;
    } else {
      reasons.push(`${name} fehlt`);
      recommendations.push(rec);
    }
  });

  return { positive, max };
}

/**
 * Bewertet bisherige Vorfälle
 * Keine Vorfälle = positiv
 */
function evaluateIncidents(
  incidents: RiskAssessmentInput['incidents'],
  reasons: string[],
  recommendations: string[]
): { positive: number; max: number } {
  let positive = 1; // Startet mit 1 (=100%), wird reduziert bei Vorfällen
  const max = 1;

  // Ransomware-Angriff ist sehr kritisch
  if (incidents.ransomwareAttack) {
    positive = 0; // Sofort auf 0%
    reasons.push('Ransomware-Angriff in der Vergangenheit');
    recommendations.push(
      'Verstärken Sie Ihre Backup-Strategie und Incident Response'
    );
  }
  // Datenleck ist kritisch
  else if (incidents.dataLeak) {
    positive = 0.3; // 30% bei Datenleck
    reasons.push('Datenleck in der Vergangenheit');
    recommendations.push('Überprüfen Sie Zugriffskontrollen und Verschlüsselung');
  }
  // Andere Vorfälle
  else if (incidents.incidentCount > 0) {
    positive = Math.max(0.6, 1 - (incidents.incidentCount * 0.2)); // Max 2 Vorfälle = 60%
    reasons.push(`${incidents.incidentCount} Cybervorfälle in der Vergangenheit`);
  }

  return { positive, max };
}

/**
 * Weist Score basierend auf Prozentsatz zu
 * A: 100-90%, B: 89-70%, C: 69-60%, D: 59-50%, E: < 50%
 */
function assignScore(percentage: number): RiskScore {
  if (percentage >= 90) return RiskScore.A; // 100-90%
  if (percentage >= 70) return RiskScore.B; // 89-70%
  if (percentage >= 60) return RiskScore.C; // 69-60%
  if (percentage >= 50) return RiskScore.D; // 59-50%
  return RiskScore.E; // < 50%
}

/**
 * Hilfsfunktion: Gibt menschenlesbare Beschreibung des Scores
 */
export function getScoreDescription(score: RiskScore): string {
  switch (score) {
    case RiskScore.A:
      return 'Sehr gutes Risikoprofil - Moderne Systeme, umfassende Sicherheit, keine Vorfälle';
    case RiskScore.B:
      return 'Gutes Risikoprofil - Solide Sicherheit mit kleineren Verbesserungsmöglichkeiten';
    case RiskScore.C:
      return 'Mittleres Risikoprofil - Einige Sicherheitslücken oder Vorfälle, Underwriting-Prüfung erforderlich';
    case RiskScore.D:
      return 'Erhöhtes Risikoprofil - Mehrere kritische Mängel, intensive Underwriting-Prüfung nötig';
    case RiskScore.E:
      return 'Hohes Risikoprofil - Gravierende Sicherheitsmängel oder schwere Vorfälle, Versicherbarkeit fraglich';
    default:
      return 'Unbekanntes Risikoprofil';
  }
}
