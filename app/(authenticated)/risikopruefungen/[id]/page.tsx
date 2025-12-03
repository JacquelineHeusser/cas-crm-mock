/**
 * Risikoprüfung Detail - Einzelne Underwriting Case
 * Vermittler können hier die Offerte prüfen und entscheiden
 */

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import UnderwritingDecisionForm from '@/components/underwriting/DecisionForm';

export default async function RisikopruefungDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  // Nur Vermittler haben Zugriff
  if (!user || user.role !== 'BROKER') {
    redirect('/dashboard');
  }

  // Await params in Next.js 15+
  const { id } = await params;

  // Lade Underwriting Case mit allen Details
  const underwritingCase = await prisma.underwritingCase.findUnique({
    where: { id },
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
  });

  if (!underwritingCase) {
    redirect('/risikopruefungen');
  }

  const quote = underwritingCase.quote;
  const customer = quote.user;
  const companyData = quote.companyData as any;
  const cyberRiskProfile = quote.cyberRiskProfile as any;
  const cyberSecurity = quote.cyberSecurity as any;
  const coverage = quote.coverage as any;

  // Risk Score Badge
  const getRiskScoreBadge = (score: string | null) => {
    if (!score) return null;
    
    const config: Record<string, { bg: string; text: string; label: string; description: string }> = {
      A: { bg: 'bg-green-100', text: 'text-green-800', label: 'Sehr Gut (A)', description: 'Hervorragende Cyber-Sicherheit' },
      B: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Gut (B)', description: 'Gute Cyber-Sicherheit' },
      C: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Mittel (C)', description: 'Ausreichende Cyber-Sicherheit' },
      D: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Erhöht (D)', description: 'Verbesserungswürdige Cyber-Sicherheit' },
      E: { bg: 'bg-red-100', text: 'text-red-800', label: 'Hoch (E)', description: 'Unzureichende Cyber-Sicherheit' },
    };
    
    return config[score] || null;
  };

  const riskScoreBadge = getRiskScoreBadge(quote.riskScore);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Zurück Button */}
        <Link 
          href="/risikopruefungen"
          className="inline-flex items-center gap-2 text-[#0032A0] hover:underline mb-6"
        >
          <ChevronLeft size={20} />
          Zurück zur Übersicht
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-light text-[#1A1A1A] mb-2">
                Risikoprüfung: {companyData?.companyName || 'Unbekannt'}
              </h1>
              <p className="text-gray-600">Offerte #{quote.quoteNumber}</p>
            </div>
            {riskScoreBadge && (
              <div className={`px-6 py-3 rounded-lg ${riskScoreBadge.bg}`}>
                <p className={`text-lg font-bold ${riskScoreBadge.text}`}>{riskScoreBadge.label}</p>
                <p className={`text-sm ${riskScoreBadge.text}`}>{riskScoreBadge.description}</p>
              </div>
            )}
          </div>

          {/* Begründung */}
          {quote.riskScoreReason && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Begründung:</strong> {quote.riskScoreReason}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Kundendaten */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-[#0032A0] mb-4 border-b border-gray-200 pb-2">
              Kundendaten
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="font-medium text-[#1A1A1A]">{customer.name}</p>
              </div>
              <div>
                <p className="text-gray-600">E-Mail</p>
                <p className="font-medium text-[#1A1A1A]">{customer.email}</p>
              </div>
            </div>
          </div>

          {/* Unternehmensdaten */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-[#0032A0] mb-4 border-b border-gray-200 pb-2">
              Unternehmen
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Firma</p>
                <p className="font-medium text-[#1A1A1A]">{companyData?.companyName}</p>
              </div>
              <div>
                <p className="text-gray-600">Branche</p>
                <p className="font-medium text-[#1A1A1A]">{companyData?.industry}</p>
              </div>
              <div>
                <p className="text-gray-600">Mitarbeiter</p>
                <p className="font-medium text-[#1A1A1A]">{companyData?.employees}</p>
              </div>
            </div>
          </div>

          {/* Cyber Risk Profile */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-[#0032A0] mb-4 border-b border-gray-200 pb-2">
              Risikoprofil
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Jahresumsatz</p>
                <p className="font-medium text-[#1A1A1A]">
                  CHF {(cyberRiskProfile?.revenue || 0).toLocaleString('de-CH')}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Cyber-Vorfälle</p>
                <p className="font-medium text-[#1A1A1A]">
                  {cyberRiskProfile?.hadCyberIncidents === 'yes' ? 'Ja' : 'Nein'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">IT-Sicherheitsstandard</p>
                <p className="font-medium text-[#1A1A1A]">
                  {cyberSecurity?.hasITSecurityStandard === 'yes' ? 'Ja' : 'Nein'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cyber-Sicherheit Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-medium text-[#0032A0] mb-4 border-b border-gray-200 pb-2">
            Cyber-Sicherheit Massnahmen
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Basis-Fragen */}
            <div className="space-y-2 text-sm">
              <h3 className="font-medium text-[#1A1A1A] mb-2">Grundlegende Sicherheit</h3>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">IT-Sicherheitsstandard</span>
                <span className={`font-medium ${cyberSecurity?.hasITSecurityStandard === 'yes' ? 'text-green-600' : 'text-red-600'}`}>
                  {cyberSecurity?.hasITSecurityStandard === 'yes' ? '✓ Ja' : '✗ Nein'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Datensicherung</span>
                <span className={`font-medium ${cyberSecurity?.hasDataBackup === 'yes' ? 'text-green-600' : 'text-red-600'}`}>
                  {cyberSecurity?.hasDataBackup === 'yes' ? '✓ Ja' : '✗ Nein'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Antivirus-Software</span>
                <span className={`font-medium ${cyberSecurity?.hasAntivirusSoftware === 'yes' ? 'text-green-600' : 'text-red-600'}`}>
                  {cyberSecurity?.hasAntivirusSoftware === 'yes' ? '✓ Ja' : '✗ Nein'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Firewall</span>
                <span className={`font-medium ${cyberSecurity?.hasFirewall === 'yes' ? 'text-green-600' : 'text-red-600'}`}>
                  {cyberSecurity?.hasFirewall === 'yes' ? '✓ Ja' : '✗ Nein'}
                </span>
              </div>
            </div>

            {/* Erweiterte Fragen */}
            <div className="space-y-2 text-sm">
              <h3 className="font-medium text-[#1A1A1A] mb-2">Erweiterte Massnahmen</h3>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Mitarbeiter-Schulungen</span>
                <span className={`font-medium ${cyberSecurity?.hasEmployeeTraining === 'yes' ? 'text-green-600' : 'text-red-600'}`}>
                  {cyberSecurity?.hasEmployeeTraining === 'yes' ? '✓ Ja' : '✗ Nein'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Incident Response Plan</span>
                <span className={`font-medium ${cyberSecurity?.hasIncidentResponsePlan === 'yes' ? 'text-green-600' : 'text-red-600'}`}>
                  {cyberSecurity?.hasIncidentResponsePlan === 'yes' ? '✓ Ja' : '✗ Nein'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Verschlüsselung</span>
                <span className={`font-medium ${cyberSecurity?.hasEncryption === 'yes' ? 'text-green-600' : 'text-red-600'}`}>
                  {cyberSecurity?.hasEncryption === 'yes' ? '✓ Ja' : '✗ Nein'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Penetration Tests</span>
                <span className={`font-medium ${cyberSecurity?.hasPenetrationTests === 'yes' ? 'text-green-600' : 'text-red-600'}`}>
                  {cyberSecurity?.hasPenetrationTests === 'yes' ? '✓ Ja' : '✗ Nein'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Gewünschte Versicherungsleistungen */}
        {coverage && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-medium text-[#0032A0] mb-4 border-b border-gray-200 pb-2">
              Gewünschte Versicherungsleistungen
            </h2>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Gewähltes Paket</p>
                <p className="font-medium text-[#1A1A1A]">{coverage.package}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Versicherungssumme Eigenschaden</p>
                <p className="font-medium text-[#1A1A1A]">
                  CHF {(coverage.sumInsuredProperty || 0).toLocaleString('de-CH')}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Versicherungssumme Haftpflicht</p>
                <p className="font-medium text-[#1A1A1A]">
                  CHF {(coverage.sumInsuredLiability || 0).toLocaleString('de-CH')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Entscheidungsformular */}
        <UnderwritingDecisionForm 
          underwritingCaseId={underwritingCase.id}
          quoteId={quote.id}
          currentStatus={underwritingCase.status}
        />
      </div>
    </div>
  );
}
