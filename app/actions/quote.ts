'use server';

/**
 * Server Actions für Quote-Verwaltung
 * Speichert und lädt Quote-Daten aus der Datenbank
 */

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getCurrentUserId } from '@/lib/auth/get-user';

// Hole User ID aus Session (als Server Action)
export async function getUserId() {
  try {
    const userId = await getCurrentUserId();
    return { success: true, userId };
  } catch (error) {
    console.error('Error getting user ID:', error);
    return { success: false, userId: null };
  }
}

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
    
    // Erstelle temporären User falls nicht vorhanden
    let user = await prisma.user.findFirst({ where: { id: userId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: 'temp@example.com',
          name: 'Temporärer User',
          role: 'CUSTOMER',
        },
      });
    }
    
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

// Policy aus Quote erstellen (Direktabschluss)
export async function createPolicyFromQuote(data: {
  quoteId: string;
  userId: string;
  startDate: string;
}) {
  try {
    const { quoteId, userId, startDate } = data;

    // Quote laden
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        company: true,
      },
    });

    if (!quote) {
      return { success: false, error: 'Quote nicht gefunden' };
    }

    // Berechne Versicherungsende (+1 Jahr)
    const start = new Date(startDate);
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);

    // Generiere Policy-Nummer
    const policyNumber = `POL-${Date.now()}`;

    // Erstelle Policy
    const policy = await prisma.policy.create({
      data: {
        policyNumber,
        quoteId,
        userId,
        companyId: quote.companyId,
        status: 'ACTIVE',
        startDate: start,
        endDate: end,
        premium: quote.premium || BigInt(0),
        coverage: quote.coverage || {},
      },
    });

    // Update Quote Status
    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: 'APPROVED',
      },
    });

    revalidatePath('/policies');
    revalidatePath('/dashboard');
    
    return { 
      success: true, 
      policy: {
        id: policy.id,
        policyNumber: policy.policyNumber,
      }
    };
  } catch (error) {
    console.error('Error creating policy:', error);
    return { success: false, error: 'Fehler beim Erstellen der Police' };
  }
}
