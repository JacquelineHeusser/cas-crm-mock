/**
 * SharePoint Webhook für Quote-Erstellung
 * Empfängt Daten aus SharePoint Liste und erstellt Quote in Supabase
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { QuoteStatus, RiskScore } from '@prisma/client';
import { calculateRiskScore } from '@/lib/risk-score/calculate';

// Webhook Secret für Sicherheit (in .env.local setzen)
const WEBHOOK_SECRET = process.env.SHAREPOINT_WEBHOOK_SECRET || 'change-me-in-production';

interface SharePointQuoteData {
  // Authentifizierung
  webhookSecret: string;
  
  // Unternehmensdaten
  companyName: string;
  address: string;
  zip: string;
  city: string;
  country: string;
  url?: string;
  industry: string;
  employees: number;
  revenue: number;
  
  // Cyber Risikoprofil
  eCommercePercentage: string;
  foreignRevenuePercentage: string;
  noForeignSubsidiaries: string;
  noRejectedInsurance: string;
  
  // Cyber-Sicherheit
  hadCyberIncidents: string;
  personalDataCount: string;
  medicalDataCount: string;
  creditCardDataCount: string;
  hasEndOfLifeSystems: string;
  
  // Optional: Zusätzliche Sicherheitsdaten
  hasFirewall?: string;
  hasAntivirus?: string;
  hasBackup?: string;
  hasMFA?: string;
  hasEncryption?: string;
  hasIncidentResponsePlan?: string;
  hasSecurityTraining?: string;
  hasPatchManagement?: string;
  
  // Zuordnung
  customerEmail: string;  // E-Mail des Kunden (muss existieren)
  brokerEmail?: string;   // Optional: E-Mail des Brokers
  createdByEmail: string; // Wer hat den Eintrag erstellt
}

export async function POST(request: NextRequest) {
  try {
    const body: SharePointQuoteData = await request.json();
    
    // 1. Webhook Secret validieren
    if (body.webhookSecret !== WEBHOOK_SECRET) {
      console.error('Invalid webhook secret');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // 2. User finden (Ersteller)
    const creator = await prisma.user.findUnique({
      where: { email: body.createdByEmail },
    });
    
    if (!creator) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Creator user not found: ${body.createdByEmail}` 
        },
        { status: 404 }
      );
    }
    
    // 3. Customer finden (Versicherungsnehmer)
    const customer = await prisma.user.findUnique({
      where: { email: body.customerEmail },
    });
    
    if (!customer) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Customer not found: ${body.customerEmail}` 
        },
        { status: 404 }
      );
    }
    
    // 4. Optional: Broker finden
    let brokerId: string | undefined;
    if (body.brokerEmail) {
      const broker = await prisma.broker.findFirst({
        where: { email: body.brokerEmail },
      });
      brokerId = broker?.id;
    }
    
    // 5. Company suchen oder erstellen
    let company = await prisma.company.findFirst({
      where: { 
        name: body.companyName,
        zip: body.zip,
      },
    });
    
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: body.companyName,
          address: body.address,
          zip: body.zip,
          city: body.city,
          country: body.country,
          url: body.url,
          industry: body.industry,
          employees: body.employees,
        },
      });
    }
    
    // 6. Cyber Security Daten für Risk Score Berechnung
    const cyberSecurityData = {
      hadCyberIncidents: body.hadCyberIncidents,
      personalDataCount: body.personalDataCount,
      medicalDataCount: body.medicalDataCount,
      creditCardDataCount: body.creditCardDataCount,
      hasEndOfLifeSystems: body.hasEndOfLifeSystems,
      // Zusätzliche Felder falls vorhanden
      hasFirewall: body.hasFirewall || 'Nein',
      hasAntivirus: body.hasAntivirus || 'Nein',
      hasBackup: body.hasBackup || 'Nein',
      hasMFA: body.hasMFA || 'Nein',
      hasEncryption: body.hasEncryption || 'Nein',
      hasIncidentResponsePlan: body.hasIncidentResponsePlan || 'Nein',
      hasSecurityTraining: body.hasSecurityTraining || 'Nein',
      hasPatchManagement: body.hasPatchManagement || 'Nein',
    };
    
    // 7. Risk Score berechnen
    const riskScoreResult = calculateRiskScore(cyberSecurityData, body.revenue);
    
    // 8. Quote Number generieren
    const quoteNumber = `SP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    // 9. Quote erstellen
    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        companyId: company.id,
        userId: creator.id,
        customerId: customer.id,
        brokerId,
        status: QuoteStatus.CALCULATED,
        
        // Unternehmensdaten
        companyData: {
          companyName: body.companyName,
          address: body.address,
          zip: body.zip,
          city: body.city,
          country: body.country,
          url: body.url,
          industry: body.industry,
          employees: body.employees,
        },
        
        // Cyber Risikoprofil
        cyberRiskProfile: {
          industry: body.industry,
          employees: body.employees,
          revenue: body.revenue,
          eCommercePercentage: body.eCommercePercentage,
          foreignRevenuePercentage: body.foreignRevenuePercentage,
          noForeignSubsidiaries: body.noForeignSubsidiaries,
          noRejectedInsurance: body.noRejectedInsurance,
        },
        
        // Cyber-Sicherheit
        cyberSecurity: cyberSecurityData,
        
        // Risk Score
        riskScore: riskScoreResult.score as RiskScore,
        riskScoreReason: riskScoreResult.reason,
        
        // Premium wird später manuell gesetzt oder über Paket berechnet
        premium: null,
      },
    });
    
    console.log(`✅ Quote created from SharePoint: ${quote.quoteNumber}`);
    
    return NextResponse.json({
      success: true,
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber,
      riskScore: quote.riskScore,
      message: 'Quote successfully created from SharePoint data',
    });
    
  } catch (error) {
    console.error('SharePoint webhook error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Optional: GET für Health Check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'SharePoint Quote Webhook',
    timestamp: new Date().toISOString(),
  });
}
