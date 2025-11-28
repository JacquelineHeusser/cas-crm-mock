/**
 * Meine Offerten Übersicht
 * Zeigt alle Offerten des Users und Link zum Offertrechner
 */

import Link from 'next/link';
import { ChevronRight, Plus } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function OffertenPage() {
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
            {/* Offerte 1 - Draft */}
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-14 h-14 bg-[#D9E8FC] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-[#0032A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-[#0032A0] mb-2">Zurich Cyberversicherung - Offerte</h3>
                  <div className="flex gap-8 text-sm text-gray-600">
                    <span>Erstellt am 28.11.2024</span>
                    <span>Gültig ab 01.01.2026</span>
                    <span>AVB Version 01/2024</span>
                  </div>
                </div>
                <div className="text-right mr-6">
                  <p className="text-sm text-gray-600 mb-1">Prämie (geschätzt)</p>
                  <p className="text-lg font-medium text-[#1A1A1A]">CHF 2'500</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-1.5 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                    Entwurf
                  </span>
                  <ChevronRight className="text-gray-400" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
