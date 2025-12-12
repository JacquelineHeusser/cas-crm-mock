/**
 * Dashboard - Zurich One Design
 * Zentrale Übersichtsseite nach Login
 */

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ChevronRight, Info } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { PACKAGES } from '@/lib/validation/premium-schema';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Broker, Underwriter und Führungskräfte sehen ALLE Offerten, Kunden nur ihre eigenen
  const isBrokerOrUnderwriter = user.role === 'BROKER' || user.role === 'UNDERWRITER' || user.role === 'MFU_TEAMLEITER' || user.role === 'HEAD_CYBER_UNDERWRITING';
  
  // Lade die letzten 3 Quotes (alle für Broker/Underwriter, nur eigene für Kunden)
  const recentQuotes = await prisma.quote.findMany({
    where: isBrokerOrUnderwriter ? {} : {
      userId: user.id,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: 3, // Nur die letzten 3
    include: {
      company: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  // Lade die letzten 3 Policen (alle für Broker/Underwriter, nur eigene für Kunden)
  const recentPolicies = await prisma.policy.findMany({
    where: isBrokerOrUnderwriter ? {} : {
      userId: user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 3, // Nur die letzten 3
    include: {
      company: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  // Lade die letzten 3 Underwriting Cases für Broker/Underwriter
  const recentUnderwritingCases = isBrokerOrUnderwriter ? await prisma.underwritingCase.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: 3,
    include: {
      quote: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          company: true,
        },
      },
    },
  }) : [];

  // Extrahiere Vornamen
  const firstName = user.name.split(' ')[0];
  
  // Formatiere Prämie
  const formatPremium = (premium: bigint | null, coverage: any) => {
    if (premium) {
      const amount = Number(premium) / 100;
      return `CHF ${amount.toLocaleString('de-CH')}`;
    }
    
    if (coverage?.package) {
      const packageData = PACKAGES[coverage.package as keyof typeof PACKAGES];
      if (packageData) {
        return `CHF ${packageData.price.toLocaleString('de-CH')}`;
      }
    }
    
    return 'Noch nicht berechnet';
  };
  
  // Status Badge Farben für Quotes
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return { label: 'Entwurf', class: 'bg-orange-100 text-orange-700' };
      case 'CALCULATED':
        return { label: 'Berechnet', class: 'bg-blue-100 text-blue-700' };
      case 'PENDING_UNDERWRITING':
        return { label: 'Risikoprüfung ausstehend', class: 'bg-yellow-100 text-yellow-700' };
      case 'APPROVED':
        return { label: 'Genehmigt', class: 'bg-green-100 text-green-700' };
      case 'REJECTED':
        return { label: 'Abgelehnt', class: 'bg-red-100 text-red-700' };
      case 'POLICIED':
        return { label: 'Policiert', class: 'bg-[#CADB2D] text-[#0032A0]' };
      default:
        return { label: status, class: 'bg-gray-100 text-gray-700' };
    }
  };
  
  // Status Badge Farben für Policies
  const getPolicyStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { label: 'Aktiv', class: 'bg-[#CADB2D] text-[#0032A0]' };
      case 'CANCELLED':
        return { label: 'Gekündigt', class: 'bg-red-100 text-red-700' };
      case 'EXPIRED':
        return { label: 'Abgelaufen', class: 'bg-gray-100 text-gray-700' };
      default:
        return { label: status, class: 'bg-gray-100 text-gray-700' };
    }
  };

  // Status Badge Farben für Underwriting Cases
  const getUnderwritingStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Ausstehend', class: 'bg-yellow-100 text-yellow-700' };
      case 'IN_REVIEW':
        return { label: 'In Prüfung', class: 'bg-blue-100 text-blue-700' };
      case 'APPROVED':
        return { label: 'Genehmigt', class: 'bg-green-100 text-green-700' };
      case 'REJECTED':
        return { label: 'Abgelehnt', class: 'bg-red-100 text-red-700' };
      case 'INFO_REQUESTED':
        return { label: 'Info benötigt', class: 'bg-orange-100 text-orange-700' };
      default:
        return { label: status, class: 'bg-gray-100 text-gray-700' };
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Header mit Begrüssung und Button */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-light text-[#1A1A1A]">
            Guten Tag {firstName}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Wir sind immer für Sie da.
          </p>
        </div>
        {user.role === 'CUSTOMER' && (
          <Link href="/quotes/new">
            <button className="btn bg-[#008C95] text-white hover:bg-[#006B73] rounded-full px-6">
              Neue Offerte
            </button>
          </Link>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-[#D9E8FC] rounded-lg p-4 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Info className="text-[#0032A0]" size={20} />
          <p className="text-[#0032A0] text-sm">
            Bitte überprüfen Sie Ihre persönlichen Daten, um keine wichtigen Mitteilungen zu verpassen.
          </p>
        </div>
        <ChevronRight className="text-[#0032A0]" size={20} />
      </div>

      {/* Risikoprüfungen Section - Höchste Priorität für Broker/Underwriter */}
      {isBrokerOrUnderwriter && (
        <div className="mb-8">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-light text-[#1A1A1A]">
              Risikoprüfungen
            </h2>
            {recentUnderwritingCases.length > 0 && (
              <Link 
                href="/risikopruefungen" 
                className="text-[#0032A0] text-sm flex items-center gap-1 hover:underline"
              >
                Alle anzeigen
                <ChevronRight size={16} />
              </Link>
            )}
          </div>

          {/* Underwriting Cases Cards */}
          <div className="space-y-3">
            {recentUnderwritingCases.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500 mb-2">Keine offenen Risikoprüfungen</p>
                <p className="text-[#0032A0] text-sm">
                  Alle Fälle sind bearbeitet
                </p>
              </div>
            ) : (
              recentUnderwritingCases.map((uwCase: any) => {
                const statusBadge = getUnderwritingStatusBadge(uwCase.status);
                const companyData = uwCase.quote?.companyData as any;
                const companyName = companyData?.companyName || uwCase.quote?.company?.name || 'Unbekannt';
                const customerName = uwCase.quote?.user?.name || 'Unbekannt';
                const createdDate = new Date(uwCase.createdAt).toLocaleDateString('de-CH');
                const riskScore = uwCase.quote?.riskScore || 'N/A';
                
                return (
                  <Link 
                    key={uwCase.id}
                    href={`/risikopruefungen/${uwCase.id}`}
                    className="bg-white rounded-lg shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer block"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-[#1A1A1A] mb-1">
                          {companyName} - Cyberversicherung
                        </h3>
                        <div className="flex gap-6 text-sm text-gray-600">
                          <span>Kunde: {customerName}</span>
                          <span>Risk Score: {riskScore}</span>
                          <span>Erstellt am {createdDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full text-center min-w-[140px] ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                        <ChevronRight className="text-gray-400" size={20} />
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Policen Section */}
      {(user.role === 'CUSTOMER' || isBrokerOrUnderwriter) && (
        <div className="mb-8">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-light text-[#1A1A1A]">
              {isBrokerOrUnderwriter ? 'Aktuelle Policen' : 'Meine Policen'}
            </h2>
            {recentPolicies.length > 0 && (
              <Link 
                href={isBrokerOrUnderwriter ? "/broker-policen" : "/policen"} 
                className="text-[#0032A0] text-sm flex items-center gap-1 hover:underline"
              >
                Alle anzeigen
                <ChevronRight size={16} />
              </Link>
            )}
          </div>

          {/* Policen Cards */}
          <div className="space-y-3">
            {recentPolicies.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500 mb-2">Noch keine Policen vorhanden</p>
                <p className="text-[#0032A0] text-sm">
                  Schliessen Sie eine Versicherung über "Meine Offerten" ab
                </p>
              </div>
            ) : (
              recentPolicies.map((policy: any) => {
                const statusBadge = getPolicyStatusBadge(policy.status);
                const coverageData = policy.coverage as any;
                const companyName = policy.company?.name || coverageData?.companyName || 'Unbekannt';
                const startDate = new Date(policy.startDate).toLocaleDateString('de-CH');
                const premiumAmount = Number(policy.premium) / 100;
                
                return (
                  <Link 
                    key={policy.id}
                    href={`/policen/${policy.id}`}
                    className="bg-white rounded-lg shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-[#008C95] rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-[#1A1A1A] mb-1">
                          {companyName} - Cyberversicherung
                        </h3>
                        <div className="flex gap-6 text-sm text-gray-600">
                          {isBrokerOrUnderwriter && policy.user && (
                            <span>Kunde: {policy.user.name}</span>
                          )}
                          <span>Policennummer {policy.policyNumber}</span>
                          <span>Gültig ab {startDate}</span>
                        </div>
                      </div>
                      <div className="text-right mr-4">
                        <p className="text-sm text-gray-600 mb-1">Jahresprämie</p>
                        <p className="font-medium text-[#1A1A1A]">
                          CHF {premiumAmount.toLocaleString('de-CH')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full text-center min-w-[140px] ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                        <ChevronRight className="text-gray-400" size={20} />
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Offerten Section */}
      {(user.role === 'CUSTOMER' || isBrokerOrUnderwriter) && (
        <div className="mb-8">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-light text-[#1A1A1A]">
              {isBrokerOrUnderwriter ? 'Aktuelle Offerten' : 'Meine Offerten'}
            </h2>
            {recentQuotes.length > 0 && (
              <Link 
                href={isBrokerOrUnderwriter ? "/broker-offerten" : "/offerten"} 
                className="text-[#0032A0] text-sm flex items-center gap-1 hover:underline"
              >
                Alle anzeigen
                <ChevronRight size={16} />
              </Link>
            )}
          </div>

          {/* Offerten Cards */}
          <div className="space-y-3">
            {recentQuotes.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500 mb-2">Noch keine Offerten erstellt</p>
                <Link href="/quotes/new" className="text-[#0032A0] text-sm hover:underline">
                  Neue Offerte erstellen
                </Link>
              </div>
            ) : (
              recentQuotes.map((quote) => {
                const statusBadge = getStatusBadge(quote.status);
                const companyData = quote.companyData as any;
                const companyName = companyData?.companyName || quote.company?.name || 'Unbekannt';
                const createdDate = new Date(quote.createdAt).toLocaleDateString('de-CH');
                
                return (
                  <Link 
                    key={quote.id}
                    href={`/quotes/${quote.id}`}
                    className="bg-white rounded-lg shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer block"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-[#D9E8FC] rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-[#0032A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-[#1A1A1A] mb-1">
                          {companyName} - Cyberversicherung
                        </h3>
                        <div className="flex gap-6 text-sm text-gray-600">
                          {isBrokerOrUnderwriter && quote.user && (
                            <span>Kunde: {quote.user.name}</span>
                          )}
                          <span>Erstellt am {createdDate}</span>
                          <span>Offerte #{quote.quoteNumber}</span>
                        </div>
                      </div>
                      <div className="text-right mr-4">
                        <p className="text-sm text-gray-600 mb-1">
                          {quote.premium ? 'Prämie' : 'Prämie (geschätzt)'}
                        </p>
                        <p className="font-medium text-[#1A1A1A]">
                          {formatPremium(quote.premium, quote.coverage)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full text-center min-w-[140px] ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                        <ChevronRight className="text-gray-400" size={20} />
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Vermittler Bereich */}
      {user.role === 'BROKER' && (
        <div>
          <h2 className="text-xl font-light text-[#1A1A1A] mb-4">Vermittler-Bereich</h2>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Risikoprüfungen */}
            <Link href="/risikopruefungen">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-yellow-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#0032A0] mb-2">Risikoprüfungen</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Prüfen und entscheiden Sie über Offerten mit Risiko-Score C, D oder E.
                    </p>
                    <div className="flex gap-4 text-sm">
                      <div className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                        Offene & Abgeschlossene
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="text-yellow-600" size={24} />
                </div>
              </div>
            </Link>

            {/* Alle Offerten */}
            <Link href="/broker-offerten">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-blue-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#0032A0] mb-2">Alle Offerten</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Durchsuchen Sie alle Cyber-Versicherungs-Offerten nach Firma oder Kunde.
                    </p>
                    <div className="flex gap-4 text-sm">
                      <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                        Mit Suchfunktion
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="text-blue-600" size={24} />
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
