/**
 * API Route für Broker Standorte
 * GET /api/brokers/[id]/locations - Lade alle Standorte eines Brokers
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const brokerId = params.id;

    // Prüfen ob der Broker existiert
    const broker = await prisma.broker.findUnique({
      where: { id: brokerId },
    });

    if (!broker) {
      return NextResponse.json(
        { error: 'Broker nicht gefunden' },
        { status: 404 }
      );
    }

    // Alle Standorte des Brokers laden
    const locations = await prisma.brokerLocation.findMany({
      where: { brokerId },
      orderBy: [
        { isDefault: 'desc' }, // Default-Standort zuerst
        { name: 'asc' },
      ],
    });

    return NextResponse.json(locations);
  } catch (error) {
    console.error('Error fetching broker locations:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
