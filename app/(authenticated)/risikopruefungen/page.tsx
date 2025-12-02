/**
 * Risikoprüfungen - Nur für Vermittler (BROKER)
 * Übersicht aller offenen Underwriting Cases
 */

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ChevronRight, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function RisikopruefungenPage() {
  const user = await getCurrentUser();

  // Nur Vermittler haben Zugriff
  if (!user || user.role !== 'BROKER') {
    redirect('/dashboard');
  }

  // Lade alle offenen Underwriting Cases
  const underwritingCases = await prisma.underwritingCase.findMany({
    where: {
      status: 'PENDING',
    },
    include: {
      quote: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Extrahiere Vornamen
  const firstName = user.name.split(' ')[0];

  // Status Badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Offen', class: 'bg-yellow-100 text-yellow-700' };
      case 'APPROVED':
        return { label: 'Genehmigt', class: 'bg-green-100 text-green-700' };
      case 'REJECTED':
        return { label: 'Abgelehnt', class: 'bg-red-100 text-red-700' };
      case 'MORE_INFO_REQUIRED':
        return { label: 'Info benötigt', class: 'bg-blue-100 text-blue-700' };
      default:
        return { label: status, class: 'bg-gray-100 text-gray-700' };
    }
  };

  // Risk Score Badge
  const getRiskScoreBadge = (score: string | null) => {
    if (!score) return null;
    
    const config: Record<string, { bg: string; text: string; label: string }> = {
      A: { bg: 'bg-green-100', text: 'text-green-800', label: 'A' },
      B: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'B' },
      C: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'C' },
      D: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'D' },
      E: { bg: 'bg-red-100', text: 'text-red-800', label: 'E' },
    };
    
    return config[score] || null;
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-[#1A1A1A] mb-2">
            Guten Tag {firstName}
          </h1>
          <p className="text-gray-600 text-sm">
            Risikoprüfungen für Cyber-Versicherungen
          </p>
        </div>

        {/* Statistiken */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="text-yellow-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[#1A1A1A]">{underwritingCases.length}</p>
                <p className="text-sm text-gray-600">Offene Fälle</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[#1A1A1A]">
                  {underwritingCases.filter(c => c.quote.riskScore === 'E' || c.quote.riskScore === 'D').length}
                </p>
                <p className="text-sm text-gray-600">Hohe Risiken (D/E)</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-semibold text-[#1A1A1A]">
                  {underwritingCases.filter(c => c.quote.riskScore === 'C').length}
                </p>
                <p className="text-sm text-gray-600">Mittlere Risiken (C)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Offene Risikoprüfungen */}
        <div>
          <h2 className="text-2xl font-light text-[#0032A0] mb-6">Offene Risikoprüfungen</h2>

          {underwritingCases.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-500">Keine offenen Risikoprüfungen</p>
              <p className="text-sm text-gray-400 mt-2">Alle Fälle wurden bearbeitet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {underwritingCases.map((uwCase) => {
                const statusBadge = getStatusBadge(uwCase.status);
                const riskScoreBadge = getRiskScoreBadge(uwCase.quote.riskScore);
                const companyData = uwCase.quote.companyData as any;
                const companyName = companyData?.companyName || 'Unbekannt';
                const createdDate = new Date(uwCase.createdAt).toLocaleDateString('de-CH');
                const customerName = uwCase.quote.user.name;
                
                return (
                  <Link
                    key={uwCase.id}
                    href={`/risikopruefungen/${uwCase.id}`}
                    className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer block"
                  >
                    <div className="flex items-center gap-6 flex-1">
                      {/* Icon */}
                      <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="text-yellow-600" size={28} />
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-[#0032A0]">
                            {companyName}
                          </h3>
                          {riskScoreBadge && (
                            <span className={`px-3 py-1 text-sm font-bold rounded ${riskScoreBadge.bg} ${riskScoreBadge.text}`}>
                              Score {riskScoreBadge.label}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-8 text-sm text-gray-600">
                          <span>Kunde: {customerName}</span>
                          <span>Offerte #{uwCase.quote.quoteNumber}</span>
                          <span>Erstellt am {createdDate}</span>
                        </div>
                        {uwCase.notes && (
                          <p className="text-sm text-gray-500 mt-2 italic">{uwCase.notes}</p>
                        )}
                      </div>

                      {/* Status & Action */}
                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-1.5 text-sm font-medium rounded-full ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                        <ChevronRight className="text-gray-400" size={32} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
