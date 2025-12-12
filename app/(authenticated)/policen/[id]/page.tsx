/**
 * Policendetails Seite
 * Zeigt Details einer spezifischen Police an
 */

import { ArrowLeft, Download, ChevronRight, Phone } from 'lucide-react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function PolicyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const { id } = await params;
  
  // Lade Policy aus Datenbank
  const policy = await prisma.policy.findUnique({
    where: { id },
    include: {
      company: true,
      quote: true,
    },
  });

  if (!policy || policy.userId !== user.id) {
    redirect('/policen');
  }
  
  // Formatiere Daten
  const coverageData = policy.coverage as any;
  const companyName = policy.company?.name || coverageData?.companyName || 'Unbekannt';
  const premiumAmount = Number(policy.premium) / 100;
  const startDate = new Date(policy.startDate).toLocaleDateString('de-CH');
  const endDate = new Date(policy.endDate).toLocaleDateString('de-CH');
  const createdDate = new Date(policy.createdAt).toLocaleDateString('de-CH');
  
  // Berechne nächste Zahlung (1 Monat vor Ablauf)
  const nextPaymentDate = new Date(policy.endDate);
  nextPaymentDate.setMonth(nextPaymentDate.getMonth() - 1);
  const nextPayment = nextPaymentDate.toLocaleDateString('de-CH');
  
  // Status Badge
  const getStatusBadge = (status: string) => {
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
  
  const statusBadge = getStatusBadge(policy.status);

  return (
    <div className="min-h-screen">
      {/* Header mit Blau-Gradient */}
      <div className="bg-gradient-to-r from-[#0032A0] to-[#005A9C] text-white p-8 pb-16">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6"
          >
            <ArrowLeft size={20} />
            Zurück
          </Link>
          <h1 className="text-3xl font-light">{companyName} - Cyberversicherung</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 -mt-8">
        {/* Police Info Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#008C95] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-medium text-[#1A1A1A] mb-1">{companyName} - Cyberversicherung</h2>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  Policennummer: {policy.policyNumber}
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-4 py-2 text-sm font-medium rounded-full ${statusBadge.class}`}>
                {statusBadge.label}
              </span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - 2/3 */}
          <div className="md:col-span-2 space-y-6">
            {/* Zahlungsinformationen */}
            <div>
              <h3 className="text-lg font-medium text-[#1A1A1A] mb-4">Zahlungsinformationen</h3>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Jahresprämie</p>
                    <p className="text-lg font-medium text-[#1A1A1A]">CHF {premiumAmount.toLocaleString('de-CH')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nächste Zahlung</p>
                    <p className="text-base text-[#1A1A1A]">{nextPayment}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Versicherungsbeginn</p>
                    <p className="text-base text-[#1A1A1A]">{startDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Versicherungsende</p>
                    <p className="text-base text-[#1A1A1A]">{endDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Policendokumente */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-[#1A1A1A]">Policendokumente</h3>
              </div>
              <div className="space-y-3">
                {/* Versicherungspolice als PDF */}
                <a 
                  href={`/api/policies/${policy.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#0032A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="font-medium text-[#1A1A1A]">Versicherungspolice</p>
                      <p className="text-sm text-gray-600">Datum: {createdDate}</p>
                    </div>
                  </div>
<<<<<<< Updated upstream
                  <Download className="text-[#0032A0] hover:text-[#005A9C]" size={20} />
                </a>

                {/* AVB als statische PDF */}
=======
                  <button className="text-[#0032A0] hover:text-[#005A9C]">
                    <Download size={20} />
                  </button>
                </div>
>>>>>>> Stashed changes
                <Link
                  href="/Cyberversicherung%20AVB.pdf"
                  target="_blank"
                  className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#0032A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="font-medium text-[#1A1A1A]">AVB - Allgemeine Versicherungsbedingungen</p>
                      <p className="text-sm text-gray-600">Cyberversicherung AVB (aktuelle Version)</p>
                    </div>
                  </div>
                  <span className="text-[#0032A0] hover:text-[#005A9C] flex items-center">
                    <Download size={20} />
                  </span>
                </Link>
              </div>
            </div>

            {/* Dienstleistungen */}
            <div>
              <h3 className="text-lg font-medium text-[#1A1A1A] mb-4">Dienstleistungen</h3>
              <Link href="/claims/new" className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <span className="text-[#1A1A1A]">Einen Schaden melden</span>
                </div>
                <ChevronRight className="text-gray-400" size={20} />
              </Link>
            </div>
          </div>

          {/* Right Column - 1/3 */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="w-16 h-16 bg-[#D9E8FC] rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-[#0032A0]" />
              </div>
              <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">
                Benötigen Sie Unterstützung bei Ihrer Police?
              </h3>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#0032A0] text-[#0032A0] rounded-full hover:bg-[#0032A0] hover:text-white transition-colors mt-4"
              >
                <Phone size={18} />
                Kontakt
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
