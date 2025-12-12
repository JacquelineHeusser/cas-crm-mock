/**
 * Customers API Route
 * Liefert Liste aller Kunden (CUSTOMER-Rolle) für Broker/Underwriter
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

    // Nur Broker und Underwriter dürfen Kunden auflisten
    if (user.role !== 'BROKER' && user.role !== 'UNDERWRITER' && user.role !== 'MFU_TEAMLEITER' && user.role !== 'HEAD_CYBER_UNDERWRITING') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Lade alle Kunden (User mit Role CUSTOMER)
    const customers = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
