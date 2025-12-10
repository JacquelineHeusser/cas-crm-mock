/**
 * API Route: PDF-Generierung für Police
 * Generiert ein PDF-Dokument mit allen Policendaten
 */

import { NextRequest, NextResponse } from 'next/server';
import ReactPDF from '@react-pdf/renderer';
import { PolicyPDF } from '@/components/pdf/PolicyPDF';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // Lade Policy aus DB
    const policy = await prisma.policy.findUnique({
      where: { id },
      include: { 
        company: true,
        quote: true,
      },
    });

    if (!policy || policy.userId !== user.id) {
      return NextResponse.json({ error: 'Police nicht gefunden' }, { status: 404 });
    }

    // Merge alle Daten aus JSON-Feldern der Quote
    const formData = {
      ...(policy.quote.companyData as any || {}),
      ...(policy.quote.cyberRiskProfile as any || {}),
      ...(policy.quote.cyberSecurity as any || {}),
      ...(policy.quote.coverage as any || {}),
    };

    // Formatiere Daten
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('de-CH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    };

    const startDate = new Date(policy.startDate);
    const endDate = new Date(policy.endDate);

    // Generiere PDF mit JSX
    const stream = await ReactPDF.renderToStream(
      <PolicyPDF
        formData={formData as any}
        policyNumber={policy.policyNumber}
        startDate={formatDate(startDate)}
        endDate={formatDate(endDate)}
      />
    );
    
    const chunks: Buffer[] = [];
    
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    
    const pdfBuffer = Buffer.concat(chunks);

    // Sende PDF als Response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Police_${policy.policyNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Fehler bei PDF-Generierung:', error);
    return NextResponse.json(
      { error: 'Fehler bei der PDF-Generierung' },
      { status: 500 }
    );
  }
}
