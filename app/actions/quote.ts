'use server';

/**
 * Server Actions für Quote-Verwaltung
 * Speichert und lädt Quote-Daten aus der Datenbank
 */

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Quote erstellen oder updaten
export async function saveQuoteStep(data: {
  quoteId?: string;
  userId: string;
  step: 'companyData' | 'cyberRiskProfile' | 'cyberSecurity' | 'coverage';
  stepData: any;
}) {
  try {
    const { quoteId, userId, step, stepData } = data;

    // Wenn Quote ID existiert: Update
    if (quoteId) {
      const updatedQuote = await prisma.quote.update({
        where: { id: quoteId },
        data: {
          [step]: stepData,
          updatedAt: new Date(),
        },
      });

      revalidatePath('/quotes/new');
      return { success: true, quoteId: updatedQuote.id };
    }

    // Sonst: Neues Quote erstellen
    const quoteNumber = `Q-${Date.now()}`; // Temporäre Quote-Nummer
    
    const newQuote = await prisma.quote.create({
      data: {
        quoteNumber,
        userId,
        status: 'DRAFT',
        [step]: stepData,
      },
    });

    revalidatePath('/quotes/new');
    return { success: true, quoteId: newQuote.id };
  } catch (error) {
    console.error('Error saving quote step:', error);
    return { success: false, error: 'Fehler beim Speichern' };
  }
}

// Quote laden
export async function loadQuote(quoteId: string) {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      select: {
        id: true,
        quoteNumber: true,
        status: true,
        companyData: true,
        cyberRiskProfile: true,
        cyberSecurity: true,
        coverage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, quote };
  } catch (error) {
    console.error('Error loading quote:', error);
    return { success: false, error: 'Fehler beim Laden' };
  }
}

// Letztes Draft Quote des Users laden
export async function loadUserDraftQuote(userId: string) {
  try {
    const quote = await prisma.quote.findFirst({
      where: {
        userId,
        status: 'DRAFT',
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        quoteNumber: true,
        status: true,
        companyData: true,
        cyberRiskProfile: true,
        cyberSecurity: true,
        coverage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, quote };
  } catch (error) {
    console.error('Error loading draft quote:', error);
    return { success: false, error: 'Fehler beim Laden' };
  }
}
