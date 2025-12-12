'use server';

/**
 * DnB-Firmen-Actions
 * Server Actions zum Laden von Mock-DnB-Unternehmen für die Firmensuche / Prefill im Offert-Prozess.
 */

import { prisma } from '@/lib/prisma';

export async function getDnbCompany(id: string) {
  try {
    const company = await prisma.dnbCompany.findUnique({
      where: { id },
      select: {
        id: true,
        dunsNumber: true,
        name: true,
        address: true,
        zip: true,
        city: true,
        country: true,
        industryCode: true,
        employeeCount: true,
        annualRevenue: true,
      },
    });

    if (!company) {
      return { success: false, company: null };
    }

    return { success: true, company };
  } catch (error) {
    console.error('Fehler beim Laden einer DnB-Firma:', error);
    return { success: false, company: null };
  }
}
