'use server';

/**
 * Server Actions für Quote-Verwaltung
 * Speichert und lädt Quote-Daten aus der Datenbank
 */

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getCurrentUserId } from '@/lib/auth/get-user';
import { calculateRiskScore, CyberSecurityData } from '@/lib/risk-score/calculate';

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

// Hole User-Daten (ID und Rolle) aus Session
export async function getUserData() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, userId: null, role: null };
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    
    if (!user) {
      return { success: false, userId: null, role: null };
    }
    
    return { success: true, userId: user.id, role: user.role };
  } catch (error) {
    console.error('Error getting user data:', error);
    return { success: false, userId: null, role: null };
  }
}

// Quote erstellen oder updaten
export async function saveQuoteStep(data: {
  quoteId?: string;
  userId: string;
  brokerId?: string;
  step: 'companyData' | 'cyberRiskProfile' | 'cyberSecurity' | 'coverage';
  stepData: any;
}) {
  try {
    const { quoteId, userId, brokerId, step, stepData } = data;

    // Wenn Quote ID existiert: Update
    if (quoteId) {
      // Lade bestehende Quote-Daten für Risk Score Berechnung
      const existingQuote = await prisma.quote.findUnique({
        where: { id: quoteId },
        select: {
          cyberRiskProfile: true,
          cyberSecurity: true,
        },
      });

      // Berechne Risk Score wenn Cyber-Sicherheit gespeichert wird
      let riskScoreData: any = {};
      if (step === 'cyberSecurity') {
        const cyberRiskProfile = existingQuote?.cyberRiskProfile as any;
        const revenue = cyberRiskProfile?.revenue || 0;
        
        const riskScoreResult = calculateRiskScore(stepData as CyberSecurityData, revenue);
        
        riskScoreData = {
          riskScore: riskScoreResult.score,
          riskScoreReason: riskScoreResult.reason,
        };
      }

      const updatedQuote = await prisma.quote.update({
        where: { id: quoteId },
        data: {
          [step]: stepData,
          ...riskScoreData,
          ...(brokerId ? { brokerId } : {}),
          updatedAt: new Date(),
        },
      });

      revalidatePath('/quotes/new');
      return { 
        success: true, 
        quoteId: updatedQuote.id,
        riskScore: updatedQuote.riskScore,
      };
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
        ...(brokerId ? { brokerId } : {}),
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
        brokerId: true,
        companyData: true,
        cyberRiskProfile: true,
        cyberSecurity: true,
        coverage: true,
        riskScore: true,
        riskScoreReason: true,
        createdAt: true,
        updatedAt: true,
        underwritingCase: {
          select: {
            id: true,
            status: true,
            notes: true,
            decision: true,
            createdAt: true,
            updatedAt: true,
          },
        },
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

    // Hole Daten aus Quote
    const companyData = quote.companyData as any;
    const coverageData = quote.coverage as any;
    
    // Berechne Prämie basierend auf gewähltem Paket
    let premiumAmount = BigInt(0);
    if (coverageData?.package) {
      const PACKAGES: any = {
        BASIC: { price: 2500 },
        OPTIMUM: { price: 4200 },
        PREMIUM: { price: 6800 },
      };
      const packagePrice = PACKAGES[coverageData.package]?.price || 0;
      premiumAmount = BigInt(packagePrice * 100); // CHF zu Rappen
    }
    
    // Erstelle oder finde Company
    let companyId = quote.companyId;
    if (!companyId && companyData?.companyName) {
      // Erstelle Company aus companyData
      const company = await prisma.company.create({
        data: {
          name: companyData.companyName,
          address: companyData.address || '',
          zip: companyData.zip || '',
          city: companyData.city || '',
          country: companyData.country || 'CH',
          url: companyData.url || null,
          industry: companyData.industry || 'Unbekannt',
          revenue: BigInt((companyData.revenue || 0) * 100), // CHF zu Rappen
          employees: companyData.employees || 0,
        },
      });
      companyId = company.id;
      
      // Update Quote mit Company ID
      await prisma.quote.update({
        where: { id: quoteId },
        data: { companyId: company.id },
      });
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
        companyId,
        status: 'ACTIVE',
        startDate: start,
        endDate: end,
        premium: premiumAmount,
        coverage: {
          ...coverageData,
          companyName: companyData?.companyName,
        },
      },
    });

    // Update Quote Status und Premium
    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: 'POLICIED',
        premium: premiumAmount,
      },
    });

    revalidatePath('/policies');
    revalidatePath('/policen');
    revalidatePath('/dashboard');
    revalidatePath('/offerten');
    revalidatePath('/quotes');
    
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

// Underwriting Case erstellen (für Score C, D, E)
export async function createUnderwritingCase(data: {
  quoteId: string;
  userId: string;
}) {
  try {
    const { quoteId, userId } = data;

    // Prüfe ob Quote existiert
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      select: {
        id: true,
        riskScore: true,
        underwritingCase: true,
      },
    });

    if (!quote) {
      return { success: false, error: 'Quote nicht gefunden' };
    }

    // Prüfe ob bereits ein Underwriting Case existiert
    if (quote.underwritingCase) {
      return { 
        success: true, 
        underwritingCase: quote.underwritingCase,
        message: 'Risikoprüfungsauftrag bereits erstellt'
      };
    }

    // Erstelle Underwriting Case
    const underwritingCase = await prisma.underwritingCase.create({
      data: {
        quoteId,
        status: 'PENDING',
        notes: `Automatisch erstellt aufgrund von Risk Score ${quote.riskScore}`,
      },
    });

    // Update Quote Status auf PENDING_UNDERWRITING
    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: 'PENDING_UNDERWRITING',
      },
    });

    revalidatePath('/quotes');
    revalidatePath('/offerten');
    
    return { 
      success: true, 
      underwritingCase: {
        id: underwritingCase.id,
        status: underwritingCase.status,
      }
    };
  } catch (error) {
    console.error('Error creating underwriting case:', error);
    return { success: false, error: 'Fehler beim Erstellen des Risikoprüfungsauftrags' };
  }
}

// Kunden-Antwort auf Vermittler-Rückfrage hinzufügen
export async function submitCustomerResponse(data: {
  quoteId: string;
  userId: string;
  response: string;
}) {
  try {
    const { quoteId, userId, response } = data;

    // Finde den Underwriting Case
    const underwritingCase = await prisma.underwritingCase.findUnique({
      where: { quoteId },
    });

    if (!underwritingCase) {
      return { success: false, error: 'Risikoprüfung nicht gefunden' };
    }

    // Prüfe ob Status NEEDS_INFO ist
    if (underwritingCase.status !== 'NEEDS_INFO') {
      return { success: false, error: 'Keine ausstehende Rückfrage vorhanden' };
    }

    // Update Underwriting Case mit Kunden-Antwort
    // Füge Antwort zu den bestehenden Notes hinzu
    const updatedNotes = `${underwritingCase.notes || ''}\n\n--- Antwort vom Kunden ---\n${response}\n(${new Date().toLocaleString('de-CH')})`;
    
    await prisma.underwritingCase.update({
      where: { id: underwritingCase.id },
      data: {
        notes: updatedNotes,
        status: 'IN_REVIEW', // Setze Status zurück auf IN_REVIEW damit Vermittler benachrichtigt wird
      },
    });

    revalidatePath('/quotes');
    revalidatePath('/offerten');
    revalidatePath('/risikopruefungen');
    
    return { 
      success: true,
      message: 'Ihre Antwort wurde erfolgreich übermittelt'
    };
  } catch (error) {
    console.error('Error submitting customer response:', error);
    return { success: false, error: 'Fehler beim Senden der Antwort' };
  }
}

// Company nach ID laden (für Vorbefüllung der Offerte aus Firmensuche)
export async function getCompanyById(companyId: string) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        address: true,
        zip: true,
        city: true,
        country: true,
        url: true,
        industry: true,
        revenue: true,
        employees: true,
      },
    });

    if (!company) {
      return { success: false, error: 'Company nicht gefunden', company: null };
    }

    return { success: true, company };
  } catch (error) {
    console.error('Error loading company:', error);
    return { success: false, error: 'Fehler beim Laden der Firma', company: null };
  }
}
