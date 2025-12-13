/**
 * API Route für Broker Standorte
 * GET /api/brokers/[id]/locations - Lade alle Standorte eines Brokers
 * POST /api/brokers/[id]/locations - Erstelle neuen Standort für Broker
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: brokerId } = await params;

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

// POST: Neuen Standort für Broker erstellen
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: brokerId } = await params;
    const body = await request.json();

    // Validierung
    const { name, address, zip, city, isDefault } = body;
    if (!name || !address || !zip || !city) {
      return NextResponse.json(
        { error: 'Name, Adresse, PLZ und Ort sind erforderlich' },
        { status: 400 }
      );
    }

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

    // Falls isDefault=true, alle anderen Standorte auf isDefault=false setzen
    if (isDefault) {
      await prisma.brokerLocation.updateMany({
        where: { brokerId },
        data: { isDefault: false },
      });
    }

    // Neuen Standort erstellen
    const newLocation = await prisma.brokerLocation.create({
      data: {
        brokerId,
        name,
        address,
        zip,
        city,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json(newLocation, { status: 201 });
  } catch (error) {
    console.error('Error creating broker location:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
