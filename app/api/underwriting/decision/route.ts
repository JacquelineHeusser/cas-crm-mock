/**
 * API Route für Underwriting Entscheidungen
 * Vermittler können hier Offerten genehmigen/ablehnen
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    // Nur Vermittler dürfen Entscheidungen treffen
    if (!user || user.role !== 'BROKER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { underwritingCaseId, quoteId, decision, notes, adjustedPremium } = body;

    // Validierung
    if (!underwritingCaseId || !quoteId || !decision || !notes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Aktualisiere Underwriting Case
    await prisma.underwritingCase.update({
      where: { id: underwritingCaseId },
      data: {
        status: decision,
        decision: decision === 'MORE_INFO_REQUIRED' ? null : decision,
        notes: notes,
      },
    });

    // Aktualisiere Quote Status basierend auf Entscheidung
    let quoteStatus: 'APPROVED' | 'REJECTED' | 'PENDING_UNDERWRITING' = 'PENDING_UNDERWRITING';
    
    if (decision === 'APPROVED') {
      quoteStatus = 'APPROVED';
      
      // Wenn angepasste Prämie angegeben, speichere diese
      if (adjustedPremium) {
        await prisma.quote.update({
          where: { id: quoteId },
          data: {
            status: quoteStatus,
            premium: BigInt(Math.round(adjustedPremium)), // Rappen
          },
        });
      } else {
        await prisma.quote.update({
          where: { id: quoteId },
          data: {
            status: quoteStatus,
          },
        });
      }
    } else if (decision === 'REJECTED') {
      quoteStatus = 'REJECTED';
      
      await prisma.quote.update({
        where: { id: quoteId },
        data: {
          status: quoteStatus,
        },
      });
    } else {
      // MORE_INFO_REQUIRED - Status bleibt PENDING_UNDERWRITING
      await prisma.quote.update({
        where: { id: quoteId },
        data: {
          status: 'PENDING_UNDERWRITING',
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing underwriting decision:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
