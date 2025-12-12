/**
 * Risikopruefungen - Für Vermittler (BROKER) und Underwriter (UNDERWRITER)
 * Übersicht aller offenen und abgeschlossenen Underwriting Cases mit Suchfunktion
 */

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import RisikopruefungenClient from '@/components/broker/RisikopruefungenClient';

export default async function RisikopruefungenPage() {
  const user = await getCurrentUser();

  // Nur Vermittler und Underwriter haben Zugriff
  if (!user || (user.role !== 'BROKER' && user.role !== 'UNDERWRITER')) {
    redirect('/dashboard');
  }

  // Lade ALLE Underwriting Cases (offene und abgeschlossene)
  const underwritingCases = await prisma.underwritingCase.findMany({
    include: {
      quote: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Serialisiere Cases für Client-Komponente
  const serializedCases = underwritingCases.map(uwCase => ({
    ...uwCase,
    createdAt: uwCase.createdAt.toISOString(),
    updatedAt: uwCase.updatedAt.toISOString(),
    quote: {
      ...uwCase.quote,
      createdAt: uwCase.quote.createdAt.toISOString(),
      updatedAt: uwCase.quote.updatedAt.toISOString(),
    },
  }));

  return (
    <RisikopruefungenClient 
      userName={user.name}
      underwritingCases={serializedCases}
    />
  );
}
