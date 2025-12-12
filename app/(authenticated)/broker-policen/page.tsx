/**
 * Alle Policen - Für Vermittler (BROKER) und Underwriter (UNDERWRITER)
 * Übersicht aller Policen mit Suchfunktion
 */

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import BrokerPolicenClient from '@/components/broker/BrokerPolicenClient';

export default async function BrokerPolicenPage() {
  const user = await getCurrentUser();

  // Nur Vermittler und Underwriter haben Zugriff
  if (!user || (user.role !== 'BROKER' && user.role !== 'UNDERWRITER')) {
    redirect('/dashboard');
  }

  // Lade ALLE Policen (nicht nur eigene)
  const policies = await prisma.policy.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      company: true,
      quote: {
        select: {
          quoteNumber: true,
          riskScore: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Serialisiere Policies für Client-Komponente
  const serializedPolicies = policies.map(policy => ({
    ...policy,
    premium: policy.premium.toString(),
    startDate: policy.startDate.toISOString(),
    endDate: policy.endDate.toISOString(),
    createdAt: policy.createdAt.toISOString(),
    updatedAt: policy.updatedAt.toISOString(),
  }));

  return (
    <BrokerPolicenClient 
      userName={user.name}
      policies={serializedPolicies}
    />
  );
}
