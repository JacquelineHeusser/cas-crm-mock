/**
 * Broker Dashboard Page
 * Einstieg für Versicherungsvermittler mit Übersicht über eigene Firmenkunden
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function BrokerDashboardPage() {
  const user = await getCurrentUser();

  // Nur für eingeloggte Vermittler sichtbar
  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'BROKER') {
    redirect('/dashboard');
  }

  // Firmenkunden, zu denen dieser Vermittler Offerten erfasst hat
  const companies = await prisma.company.findMany({
    where: {
      quotes: {
        some: {
          userId: user.id,
        },
      },
    },
    include: {
      quotes: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="min-h-screen">
      {/* Header-Bereich im ZurichOne-Stil */}
      <div className="bg-gradient-to-r from-[#0032A0] to-[#005A9C] text-white p-8 pb-16">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-light mb-2">ZurichOne – Vermittlerübersicht</h1>
          <p className="text-white/80 max-w-2xl">
            Erfassen und verwalten Sie Ihre Firmenkunden und Cyber-Versicherungsofferten zentral an einem Ort.
          </p>
        </div>
      </div>

      {/* Content-Bereich */}
      <div className="max-w-5xl mx-auto px-8 -mt-10 pb-12 space-y-8">
        {/* Broker-Info Hinweis */}
        <div className="text-xs text-gray-500 flex flex-wrap items-center gap-2">
          <span className="px-2 py-1 bg-white/70 rounded-full shadow-sm">
            Angemeldet als Vermittler: <span className="font-medium">{user.email}</span>
          </span>
          <span className="px-2 py-1 bg-white/70 rounded-full shadow-sm">
            Firmenkunden im System: <span className="font-medium">{companies.length}</span>
          </span>
        </div>

        {/* Aktionen für Vermittler */}
        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-medium text-[#1A1A1A] mb-1">Schneller Einstieg für Vermittler</h2>
            <p className="text-sm text-gray-600">
              Legen Sie neue Firmenkunden an und erstellen Sie direkt passende Cyber-Versicherungsofferten.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/quotes/new"
              className="btn bg-[#0032A0] text-white hover:bg-[#005A9C] border-none rounded-full"
            >
              Neuen Firmenkunden / Offerte erfassen
            </Link>
            <Link
              href="/broker-offerten"
              className="btn btn-outline border-[#0032A0] text-[#0032A0] hover:bg-[#0032A0] hover:text-white rounded-full"
            >
              Meine Offerten ansehen
            </Link>
          </div>
        </div>

        {/* Firmenkunden-Übersicht */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-[#1A1A1A]">Meine Firmenkunden</h2>
            <span className="text-sm text-gray-600">
              {companies.length} Firmenkunde{companies.length === 1 ? '' : 'n'} gefunden
            </span>
          </div>

          {companies.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-gray-600">
              <p className="mb-2">Sie haben noch keine Firmenkunden mit Offerten erfasst.</p>
              <p className="text-sm">
                Starten Sie mit einem neuen Firmenkunden und einer Cyber-Versicherungsofferte über den Button oben.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm divide-y">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-[#1A1A1A]">{company.name}</p>
                    <p className="text-sm text-gray-600">
                      {company.address}, {company.zip} {company.city}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Branche: {company.industry} · {company.employees} Mitarbeitende ·{' '}
                      Umsatz: CHF {(Number(company.revenue) / 100).toLocaleString('de-CH')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-gray-500">
                      {company.quotes.length} Offerte{company.quotes.length === 1 ? '' : 'n'}
                    </span>
                    <Link
                      href="/broker-offerten"
                      className="btn btn-sm btn-outline border-[#0032A0] text-[#0032A0] hover:bg-[#0032A0] hover:text-white rounded-full"
                    >
                      Offerten zu diesem Kunden ansehen
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
