/**
 * Dashboard - Zurich One Design
 * Zentrale Übersichtsseite nach Login
 */

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ChevronRight, Info } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Extrahiere Vornamen
  const firstName = user.name.split(' ')[0];

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

      {/* Meine Policen Section */}
      {user.role === 'CUSTOMER' && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-light text-[#1A1A1A]">Meine Policen</h2>
            <Link href="/policen" className="text-[#0032A0] text-sm flex items-center gap-1 hover:underline">
              Alles ansehen (2)
              <ChevronRight size={16} />
            </Link>
          </div>

          {/* Policen Cards */}
          <div className="space-y-3">
            {/* Police 1 - Cyber Insurance */}
            <div className="bg-white rounded-lg shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-[#008C95] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-[#1A1A1A] mb-1">Cyber Insurance</h3>
                  <p className="text-sm text-gray-600">Policennummer 72584938</p>
                </div>
                <div className="text-right mr-4">
                  <p className="text-sm text-gray-600 mb-1">Jahresprämie</p>
                  <p className="font-medium text-[#1A1A1A]">CHF 2'500</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-[#CADB2D] text-[#0032A0] text-xs font-medium rounded-full">
                    Aktiv
                  </span>
                  <ChevronRight className="text-gray-400" size={20} />
                </div>
              </div>
            </div>

            {/* Police 2 - Relax Assistance */}
            <div className="bg-white rounded-lg shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-[#0032A0] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-[#1A1A1A] mb-1">Relax Assistance</h3>
                  <p className="text-sm text-gray-600">Policennummer 72584938</p>
                </div>
                <div className="text-right mr-4">
                  <p className="text-sm text-gray-600 mb-1">Jahresprämie</p>
                  <p className="font-medium text-[#1A1A1A]">CHF 450</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-[#CADB2D] text-[#0032A0] text-xs font-medium rounded-full">
                    Aktiv
                  </span>
                  <ChevronRight className="text-gray-400" size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meine Offerten Section */}
      {user.role === 'CUSTOMER' && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-light text-[#1A1A1A]">Meine Offerten</h2>
            <Link href="/quotes" className="text-[#0032A0] text-sm flex items-center gap-1 hover:underline">
              Alles ansehen (1)
              <ChevronRight size={16} />
            </Link>
          </div>

          {/* Offerten Cards */}
          <div className="space-y-3">
            {/* Offerte 1 - Draft */}
            <div className="bg-white rounded-lg shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-[#D9E8FC] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#0032A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-[#1A1A1A] mb-1">Cyber Insurance - Offerte</h3>
                  <p className="text-sm text-gray-600">Erstellt am 28.11.2024</p>
                </div>
                <div className="text-right mr-4">
                  <p className="text-sm text-gray-600 mb-1">Prämie (geschätzt)</p>
                  <p className="font-medium text-[#1A1A1A]">CHF 2'500</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                    Entwurf
                  </span>
                  <ChevronRight className="text-gray-400" size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Underwriter Bereich */}
      {user.role === 'UNDERWRITER' && (
        <div>
          <h2 className="text-xl font-light text-[#1A1A1A] mb-4">Underwriting</h2>
          <div className="grid gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="font-semibold text-[#0032A0] mb-2">Offene Fälle</h3>
              <p className="text-gray-600 text-sm">
                Prüfen und entscheiden Sie über Anträge mit Risiko-Score C-E.
              </p>
              <div className="mt-4 flex justify-end">
                <span className="text-[#0032A0] text-sm flex items-center gap-1">
                  Fälle ansehen
                  <ChevronRight size={16} />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broker Bereich */}
      {user.role === 'BROKER' && (
        <div>
          <h2 className="text-xl font-light text-[#1A1A1A] mb-4">Vermittler-Bereich</h2>
          <div className="grid gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="font-semibold text-[#0032A0] mb-2">Neue Offerte erstellen</h3>
              <p className="text-gray-600 text-sm">
                Erstellen Sie eine Cyberversicherungs-Offerte für Ihre Kunden.
              </p>
              <div className="mt-4 flex justify-end">
                <span className="text-[#0032A0] text-sm flex items-center gap-1">
                  Offerte starten
                  <ChevronRight size={16} />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
