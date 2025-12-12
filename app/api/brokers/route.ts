/**
 * Brokers API Route
 * Liefert Liste aller verfügbaren Vermittler
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Nur Broker und Underwriter dürfen Vermittler auflisten
    if (user.role !== 'BROKER' && user.role !== 'UNDERWRITER' && user.role !== 'MFU_TEAMLEITER' && user.role !== 'HEAD_CYBER_UNDERWRITING') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Lade alle Vermittler
    const brokers = await prisma.broker.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(brokers);
  } catch (error) {
    console.error('Error fetching brokers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
