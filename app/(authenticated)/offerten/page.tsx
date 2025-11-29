/**
 * Meine Offerten Übersicht
 * Zeigt alle Offerten des Users und Link zum Offertrechner
 */

import Link from 'next/link';
import { ChevronRight, Plus } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PACKAGES } from '@/lib/validation/premium-schema';

export default async function OffertenPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Lade alle Quotes des Users aus der Datenbank
  const quotes = await prisma.quote.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      company: true,
    },
  });

  // Extrahiere Vornamen
  const firstName = user.name.split(' ')[0];
  
  // Formatiere Prämie
  const formatPremium = (premium: bigint | null, coverage: any) => {
    // Wenn Prämie in DB gespeichert, verwende diese
    if (premium) {
      const amount = Number(premium) / 100; // Rappen zu CHF
      return `CHF ${amount.toLocaleString('de-CH')}`;
    }
    
    // Sonst: Versuche Prämie aus gewähltem Paket zu ermitteln
    if (coverage?.package) {
      const packageData = PACKAGES[coverage.package as keyof typeof PACKAGES];
      if (packageData) {
        return `CHF ${packageData.price.toLocaleString('de-CH')}`;
      }
    }
    
    return 'Noch nicht berechnet';
  };
  
  // Status Badge Farben
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return { label: 'Entwurf', class: 'bg-orange-100 text-orange-700' };
      case 'CALCULATED':
        return { label: 'Berechnet', class: 'bg-blue-100 text-blue-700' };
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

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-light text-[#1A1A1A] mb-2">
          Guten Tag {firstName}
        </h1>
        <p className="text-gray-600 text-sm mb-8">
          Wir sind immer für Sie da.
        </p>

        {/* Meine Offerten Section */}
        <div>
          <h2 className="text-2xl font-light text-[#0032A0] mb-6">Meine Offerten</h2>

          {/* Neue Offerte Card */}
          <Link href="/quotes/new" className="bg-gradient-to-r from-[#008C95] to-[#006B73] rounded-lg shadow-lg p-8 flex items-center justify-between hover:shadow-xl transition-shadow cursor-pointer block mb-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-white mb-2">Neue Cyber Offerte rechnen</h3>
                <p className="text-white/90 text-sm">Starten Sie jetzt eine neue Cyberversicherungs-Offerte</p>
              </div>
            </div>
            <ChevronRight className="text-white" size={32} />
          </Link>

          {/* Offerten Cards */}
          <div className="space-y-4">
            {quotes.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-500">Noch keine Offerten erstellt</p>
                <p className="text-sm text-gray-400 mt-2">Klicken Sie oben auf "Neue Cyber Offerte rechnen" um zu starten</p>
              </div>
            ) : (
              quotes.map((quote: any) => {
                const statusBadge = getStatusBadge(quote.status);
                const companyData = quote.companyData as any;
                const companyName = companyData?.companyName || quote.company?.name || 'Unbekannt';
                const createdDate = new Date(quote.createdAt).toLocaleDateString('de-CH');
                const isPolicied = quote.status === 'POLICIED';
                
                // Policierte Offerten sind nicht klickbar
                if (isPolicied) {
                  return (
                    <div 
                      key={quote.id}
                      className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between opacity-90"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-14 h-14 bg-[#CADB2D] rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-7 h-7 text-[#0032A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-[#0032A0] mb-2">
                            {companyName} - Cyberversicherung
                          </h3>
                          <div className="flex gap-8 text-sm text-gray-600">
                            <span>Erstellt am {createdDate}</span>
                            <span>Offerte #{quote.quoteNumber}</span>
                          </div>
                        </div>
                        <div className="text-right mr-6">
                          <p className="text-sm text-gray-600 mb-1">Jahresprämie</p>
                          <p className="text-lg font-medium text-[#1A1A1A]">{formatPremium(quote.premium, quote.coverage)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-4 py-1.5 text-sm font-medium rounded-full ${statusBadge.class}`}>
                            {statusBadge.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                // Normale Offerten sind klickbar
                return (
                  <Link 
                    key={quote.id} 
                    href={`/quotes/${quote.id}`}
                    className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer block"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 bg-[#D9E8FC] rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-7 h-7 text-[#0032A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-[#0032A0] mb-2">
                          {companyName} - Cyberversicherung
                        </h3>
                        <div className="flex gap-8 text-sm text-gray-600">
                          <span>Erstellt am {createdDate}</span>
                          <span>Offerte #{quote.quoteNumber}</span>
                        </div>
                      </div>
                      <div className="text-right mr-6">
                        <p className="text-sm text-gray-600 mb-1">
                          {quote.premium ? 'Prämie' : 'Prämie (geschätzt)'}
                        </p>
                        <p className="text-lg font-medium text-[#1A1A1A]">{formatPremium(quote.premium, quote.coverage)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 text-sm font-medium rounded-full ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                        <ChevronRight className="text-gray-400" size={24} />
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
