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
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-light text-[#1A1A1A]">Meine Policen</h2>
            <a href="/policen" className="text-[#0032A0] text-sm flex items-center gap-1 hover:underline">
              Alles ansehen (0)
              <ChevronRight size={16} />
            </a>
          </div>

          {/* Policen Cards - Placeholder */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-500 text-center">
              Derzeit gibt es keine aktiven Policen.
            </p>
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
