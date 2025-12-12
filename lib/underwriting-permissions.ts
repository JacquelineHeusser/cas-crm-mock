/**
 * Hilfsfunktionen für Underwriting-Berechtigungen basierend auf Risk Score
 */

import { UserRole } from '@prisma/client';

/**
 * Prüft ob ein User eine Offerte mit einem bestimmten Risk Score genehmigen darf
 */
export function canApproveRiskScore(userRole: UserRole, riskScore: string | null): boolean {
  if (!riskScore) return false;

  switch (riskScore) {
    case 'A':
    case 'B':
      // A & B können von UNDERWRITER, MFU_TEAMLEITER und HEAD_CYBER_UNDERWRITING genehmigt werden
      return userRole === 'UNDERWRITER' || 
             userRole === 'MFU_TEAMLEITER' || 
             userRole === 'HEAD_CYBER_UNDERWRITING';
    
    case 'C':
      // C kann nur von MFU_TEAMLEITER oder HEAD_CYBER_UNDERWRITING genehmigt werden
      return userRole === 'MFU_TEAMLEITER' || 
             userRole === 'HEAD_CYBER_UNDERWRITING';
    
    case 'D':
      // D kann nur von HEAD_CYBER_UNDERWRITING genehmigt werden
      return userRole === 'HEAD_CYBER_UNDERWRITING';
    
    case 'E':
      // E kann nicht genehmigt werden (nicht versicherbar)
      return false;
    
    default:
      return false;
  }
}

/**
 * Gibt eine Nachricht zurück, warum ein User nicht genehmigen darf
 */
export function getApprovalRequirementMessage(riskScore: string | null): string {
  if (!riskScore) return '';

  switch (riskScore) {
    case 'A':
    case 'B':
      return '';
    
    case 'C':
      return 'Für Risk Score C ist eine Freigabe durch den MFU Teamleiter erforderlich.';
    
    case 'D':
      return 'Für Risk Score D ist eine Freigabe durch den Head Cyber Underwriting erforderlich.';
    
    case 'E':
      return 'Risk Score E ist nicht versicherbar. Diese Offerte kann nur abgelehnt werden.';
    
    default:
      return '';
  }
}

/**
 * Prüft ob ein User überhaupt Zugriff auf Underwriting-Funktionen hat
 */
export function hasUnderwritingAccess(userRole: UserRole): boolean {
  return userRole === 'UNDERWRITER' || 
         userRole === 'BROKER' || 
         userRole === 'MFU_TEAMLEITER' || 
         userRole === 'HEAD_CYBER_UNDERWRITING';
}

/**
 * Gibt die minimale Rolle zurück, die für einen Risk Score benötigt wird
 */
export function getRequiredRoleForRiskScore(riskScore: string | null): string {
  if (!riskScore) return '';

  switch (riskScore) {
    case 'A':
    case 'B':
      return 'UNDERWRITER';
    
    case 'C':
      return 'MFU_TEAMLEITER';
    
    case 'D':
      return 'HEAD_CYBER_UNDERWRITING';
    
    case 'E':
      return 'NICHT_VERSICHERBAR';
    
    default:
      return '';
  }
}
