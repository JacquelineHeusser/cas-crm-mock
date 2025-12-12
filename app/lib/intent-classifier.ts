/**
 * Query Intent Classification
 * Bestimmt, ob User nach Policen oder allgemeinen Infos fragt
 */

export type QueryIntent = 'policy' | 'general' | 'mixed';

export interface ClassificationResult {
  intent: QueryIntent;
  confidence: number;
  reasoning: string;
}

// Keywords für Policy-Fragen
const POLICY_KEYWORDS = [
  'police',
  'policen',
  'versicherung',
  'prämie',
  'deckung',
  'selbstbehalt',
  'kunde',
  'vertrag',
  'laufzeit',
  'kündigung',
  'versicherungsnehmer',
  'versichert',
  'schadenfall',
  'leistung',
];

// Keywords für allgemeine Fragen
const GENERAL_KEYWORDS = [
  'was ist',
  'wie funktioniert',
  'erklären',
  'unterschied',
  'arten von',
  'welche',
  'warum',
  'gesetz',
  'rechtlich',
  'vvg',
  'vag',
  'definition',
  'bedeutet',
  'allgemein',
];

/**
 * Klassifiziert die User-Query nach Intent
 */
export function classifyIntent(query: string): ClassificationResult {
  const lowerQuery = query.toLowerCase();
  
  // Zähle Keyword-Matches
  const policyMatches = POLICY_KEYWORDS.filter(kw => lowerQuery.includes(kw)).length;
  const generalMatches = GENERAL_KEYWORDS.filter(kw => lowerQuery.includes(kw)).length;
  
  // Spezifische Muster erkennen
  const hasPolicyNumber = /\d{4,}/.test(query); // Policen-Nummer (4+ Ziffern)
  const hasCustomerName = /kunde|herr|frau|firma/i.test(query);
  const isQuestion = /\?|was|wie|warum|wann|wo|welche/i.test(query);
  const hasLawReference = /vvg|vag|art\.|artikel|gesetz/i.test(query);
  
  // Scoring
  let policyScore = policyMatches * 2;
  let generalScore = generalMatches * 2;
  
  // Bonus-Punkte für spezifische Muster
  if (hasPolicyNumber) policyScore += 5;
  if (hasCustomerName) policyScore += 3;
  if (isQuestion) generalScore += 1;
  if (hasLawReference) generalScore += 3;
  
  // Entscheidung
  const total = policyScore + generalScore;
  
  if (total === 0) {
    return {
      intent: 'general',
      confidence: 0.5,
      reasoning: 'Keine klaren Indikatoren gefunden, default zu allgemeiner Frage',
    };
  }
  
  const policyConfidence = policyScore / total;
  const generalConfidence = generalScore / total;
  
  if (policyConfidence > 0.7) {
    return {
      intent: 'policy',
      confidence: policyConfidence,
      reasoning: 'Query enthält Policy-spezifische Begriffe oder Policen-Nummer',
    };
  }
  
  if (generalConfidence > 0.7) {
    return {
      intent: 'general',
      confidence: generalConfidence,
      reasoning: 'Query ist eine allgemeine Frage zu Versicherungen oder Gesetzen',
    };
  }
  
  return {
    intent: 'mixed',
    confidence: Math.max(policyConfidence, generalConfidence),
    reasoning: 'Query enthält sowohl Policy- als auch allgemeine Elemente',
  };
}
