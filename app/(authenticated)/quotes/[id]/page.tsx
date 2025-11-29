/**
 * Quote Detail / Bearbeiten
 * Lädt eine existierende Quote und öffnet den Offertrechner mit vorausgefüllten Daten
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  const { id } = await params;

  if (!user) {
    redirect('/login');
  }

  // Lade Quote aus DB
  const quote = await prisma.quote.findUnique({
    where: {
      id,
    },
    include: {
      company: true,
    },
  });

  // Prüfe ob Quote existiert und dem User gehört
  if (!quote || quote.userId !== user.id) {
    redirect('/offerten');
  }

  // Redirect zum Offertrechner mit Quote-ID als Query-Parameter
  redirect(`/quotes/new?edit=${id}`);
}
