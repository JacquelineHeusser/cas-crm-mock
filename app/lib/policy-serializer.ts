/**
 * Policy Serializer für Chatbot Embeddings
 * Wandelt Policy-Daten in natürlichen deutschen Text um
 */

import { prisma } from '@/app/lib/prisma';

export interface SerializedPolicy {
  policyId: string;
  content: string;
  metadata: {
    policyNumber: string;
    userName: string;
    companyName: string | null;
    status: string;
    premium: number;
    startDate: string;
    endDate: string;
  };
}

export async function serializePolicy(policyId: string): Promise<SerializedPolicy> {
  const policy = await prisma.policy.findUnique({
    where: { id: policyId },
    include: {
      user: true,
      company: true,
      quote: true,
    },
  });

  if (!policy) {
    throw new Error(`Policy ${policyId} not found`);
  }

  // Prämie von Rappen zu CHF konvertieren
  const premiumCHF = Number(policy.premium) / 100;

  // Coverage-Daten extrahieren (JSON)
  const coverage = policy.coverage as any;
  const coverageText = coverage 
    ? `Deckungspaket: ${coverage.package || 'Standard'}. Deckungssumme: CHF ${coverage.amount || 'N/A'}.`
    : '';

  // Natürlicher deutscher Text für Embeddings
  const content = `
Police Nummer: ${policy.policyNumber}
Versicherungsnehmer: ${policy.user.name}
${policy.company ? `Unternehmen: ${policy.company.name}` : ''}
Status: ${policy.status}
Jahresprämie: CHF ${premiumCHF.toFixed(2)}
${coverageText}
Versicherungsbeginn: ${new Date(policy.startDate).toLocaleDateString('de-CH')}
Versicherungsende: ${new Date(policy.endDate).toLocaleDateString('de-CH')}
Laufzeit: ${Math.round((policy.endDate.getTime() - policy.startDate.getTime()) / (1000 * 60 * 60 * 24 * 365))} Jahr(e)
  `.trim();

  return {
    policyId: policy.id,
    content,
    metadata: {
      policyNumber: policy.policyNumber,
      userName: policy.user.name,
      companyName: policy.company?.name || null,
      status: policy.status,
      premium: premiumCHF,
      startDate: policy.startDate.toISOString(),
      endDate: policy.endDate.toISOString(),
    },
  };
}

export async function getAllPoliciesForEmbedding(): Promise<SerializedPolicy[]> {
  const policies = await prisma.policy.findMany({
    where: {
      status: { not: 'CANCELLED' },
    },
    include: {
      user: true,
      company: true,
    },
  });

  return Promise.all(
    policies.map(p => serializePolicy(p.id))
  );
}
