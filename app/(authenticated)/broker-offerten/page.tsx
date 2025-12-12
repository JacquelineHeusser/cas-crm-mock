/**
 * Alle Offerten - Für Vermittler (BROKER) und Underwriter (UNDERWRITER)
 * Übersicht aller Offerten mit Suchfunktion
 */

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import BrokerOffertenClient from '@/components/broker/BrokerOffertenClient';

export default async function BrokerOffertenPage() {
  const user = await getCurrentUser();

  // Nur Vermittler, Underwriter und Führungskräfte haben Zugriff
  if (!user || (user.role !== 'BROKER' && user.role !== 'UNDERWRITER' && user.role !== 'MFU_TEAMLEITER' && user.role !== 'HEAD_CYBER_UNDERWRITING')) {
    redirect('/dashboard');
  }

  // Lade ALLE Quotes (nicht nur eigene)
  const quotes = await prisma.quote.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  // Serialisiere Quotes für Client-Komponente
  const serializedQuotes = quotes.map(quote => ({
    ...quote,
    premium: quote.premium ? quote.premium.toString() : null,
    createdAt: quote.createdAt.toISOString(),
    updatedAt: quote.updatedAt.toISOString(),
  }));

  return (
    <BrokerOffertenClient 
      userName={user.name}
      quotes={serializedQuotes}
    />
  );
}
