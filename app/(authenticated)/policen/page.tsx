/**
 * Meine Policen Übersicht
 * Zeigt alle Policen des Users
 */

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function PolicenPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Extrahiere Vornamen
  const firstName = user.name.split(' ')[0];

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

        {/* Meine Policen Section */}
        <div>
          <h2 className="text-2xl font-light text-[#0032A0] mb-6">Meine Policen</h2>

          {/* Policen Cards */}
          <div className="space-y-4">
            {/* Police 1 - Zurich Cyberversicherung */}
            <Link href="/policen/72584938" className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer block">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-14 h-14 bg-[#008C95] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-[#0032A0] mb-2">Zurich Cyberversicherung</h3>
                  <div className="flex gap-8 text-sm text-gray-600">
                    <span>Policennummer 72584938</span>
                    <span>Gültig ab 01.01.2026</span>
                    <span>AVB Version 01/2024</span>
                  </div>
                </div>
                <div className="text-right mr-6">
                  <p className="text-sm text-gray-600 mb-1">Jahresprämie</p>
                  <p className="text-lg font-medium text-[#1A1A1A]">CHF 2'500</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-1.5 bg-[#CADB2D] text-[#0032A0] text-sm font-medium rounded-full">
                    Aktiv
                  </span>
                  <ChevronRight className="text-gray-400" size={24} />
                </div>
              </div>
            </Link>

            {/* Police 2 - Zurich Sachversicherung */}
            <Link href="/policen/72584941" className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer block">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-14 h-14 bg-[#0032A0] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-[#0032A0] mb-2">Zurich Sachversicherung</h3>
                  <div className="flex gap-8 text-sm text-gray-600">
                    <span>Policennummer 72584941</span>
                    <span>Gültig ab 01.01.2026</span>
                    <span>AVB Version 01/2024</span>
                  </div>
                </div>
                <div className="text-right mr-6">
                  <p className="text-sm text-gray-600 mb-1">Jahresprämie</p>
                  <p className="text-lg font-medium text-[#1A1A1A]">CHF 3'200</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-1.5 bg-[#CADB2D] text-[#0032A0] text-sm font-medium rounded-full">
                    Aktiv
                  </span>
                  <ChevronRight className="text-gray-400" size={24} />
                </div>
              </div>
            </Link>

            {/* Police 3 - Zurich Betriebshaftpflichtversicherung */}
            <Link href="/policen/72584945" className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer block">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-14 h-14 bg-[#008C95] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-[#0032A0] mb-2">Zurich Betriebshaftpflichtversicherung</h3>
                  <div className="flex gap-8 text-sm text-gray-600">
                    <span>Policennummer 72584945</span>
                    <span>Gültig ab 01.01.2026</span>
                    <span>AVB Version 01/2024</span>
                  </div>
                </div>
                <div className="text-right mr-6">
                  <p className="text-sm text-gray-600 mb-1">Jahresprämie</p>
                  <p className="text-lg font-medium text-[#1A1A1A]">CHF 1'800</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-1.5 bg-[#CADB2D] text-[#0032A0] text-sm font-medium rounded-full">
                    Aktiv
                  </span>
                  <ChevronRight className="text-gray-400" size={24} />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
