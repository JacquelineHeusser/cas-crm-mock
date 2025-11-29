/**
 * API Route: PDF-Generierung für Quote
 * Generiert ein PDF-Dokument mit allen Offertdaten
 */

import { NextRequest, NextResponse } from 'next/server';
import ReactPDF from '@react-pdf/renderer';
import { QuotePDF } from '@/components/pdf/QuotePDF';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import React from 'react';

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

    // Lade Quote aus DB
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!quote || quote.userId !== user.id) {
      return NextResponse.json({ error: 'Offerte nicht gefunden' }, { status: 404 });
    }

    // Merge alle Daten aus JSON-Feldern
    const formData = {
      ...(quote.companyData as any || {}),
      ...(quote.cyberRiskProfile as any || {}),
      ...(quote.cyberSecurity as any || {}),
      ...(quote.coverage as any || {}),
    };

    // Berechne Gültigkeitsdatum (3 Monate ab heute)
    const createdDate = new Date(quote.createdAt);
    const validUntil = new Date(createdDate);
    validUntil.setMonth(validUntil.getMonth() + 3);

    // Formatiere Daten
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('de-CH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    };

    // Generiere PDF
    const pdfDoc = React.createElement(QuotePDF, {
      formData: formData as any,
      quoteNumber: quote.quoteNumber,
      createdDate: formatDate(createdDate),
      validUntil: formatDate(validUntil),
    });

    const stream = await ReactPDF.renderToStream(pdfDoc);
    const chunks: Buffer[] = [];
    
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    
    const pdfBuffer = Buffer.concat(chunks);

    // Sende PDF als Response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Offerte_${quote.quoteNumber}.pdf"`,
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
