/**
 * BI-Dashboard für Head Cyber Underwriting & MFU Teamleiter
 * Nutzt bestehende Risiko- und Volumen-KPIs und zeigt diese in einer konzentrierten BI-Ansicht.
 */

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function BiDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'MFU_TEAMLEITER' && user.role !== 'HEAD_CYBER_UNDERWRITING') {
    redirect('/dashboard');
  }

  const validRiskScores = ['A', 'B', 'C', 'D', 'E'];

  // Offerten nach RiskScore zählen
  const quoteRiskCounts: Record<string, number> = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
  };

  for (const score of validRiskScores) {
    quoteRiskCounts[score] = await prisma.quote.count({
      where: { riskScore: score as any },
    });
  }

  // Volumen-KPIs
  const openQuotesAgg = await prisma.quote.aggregate({
    where: {
      status: {
        in: ['DRAFT', 'CALCULATED', 'PENDING_UNDERWRITING'],
      },
    },
    _count: { _all: true },
    _sum: { premium: true },
  });

  const openQuoteCount = openQuotesAgg._count._all ?? 0;
  const openQuotePremiumTotal = Number(openQuotesAgg._sum.premium ?? 0) / 100;

  const activePoliciesAgg = await prisma.policy.aggregate({
    where: { status: 'ACTIVE' },
    _sum: { premium: true },
  });

  const activePolicyPremiumTotal = Number(activePoliciesAgg._sum.premium ?? 0) / 100;

  const highRiskPolicyCount = await prisma.policy.count({
    where: {
      quote: {
        riskScore: {
          in: ['D', 'E'],
        },
      },
    },
  });

  // Top 10 Firmen nach RiskScore D/E (vereinfachte Sicht)
  const topHighRiskPolicies = await prisma.policy.findMany({
    where: {
      quote: {
        riskScore: {
          in: ['D', 'E'],
        },
      },
    },
    orderBy: {
      premium: 'desc',
    },
    take: 10,
    include: {
      company: true,
      quote: true,
    },
  });

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-light text-[#1A1A1A] mb-1">BI Cockpit Cyber</h1>
        <p className="text-gray-600 text-sm">
          Übersicht über Offerten, Bestand und Risikoprofil für Cyber – speziell für Head Cyber Underwriting
          und MFU Teamleiter.
        </p>
      </div>

      {/* KPI-Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-sm">
          <p className="text-xs text-gray-500 mb-1">Offerten nach Risk Score</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {validRiskScores.map((score) => (
              <span
                key={score}
                className="px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-700"
              >
                {score}: {quoteRiskCounts[score] ?? 0}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 text-sm">
          <p className="text-xs text-gray-500 mb-1">Offene Offerten (gesamt)</p>
          <p className="text-2xl font-semibold text-[#1A1A1A]">{openQuoteCount}</p>
          <p className="text-xs text-gray-500 mt-1">
            Offertwert ca. CHF {openQuotePremiumTotal.toLocaleString('de-CH')}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 text-sm">
          <p className="text-xs text-gray-500 mb-1">Aktiver Bestand (Jahresprämie)</p>
          <p className="text-2xl font-semibold text-[#1A1A1A]">
            CHF {activePolicyPremiumTotal.toLocaleString('de-CH')}
          </p>
          <p className="text-xs text-gray-500 mt-1">Policen mit hohem Risiko (D/E): {highRiskPolicyCount}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 text-sm">
          <p className="text-xs text-gray-500 mb-1">Risikosegmente Fokus</p>
          <ul className="text-xs text-gray-700 space-y-1">
            <li>D/E: Bestand mit erhöhter Exponierung</li>
            <li>C: Offerten mit erhöhtem Risiko</li>
            <li>A/B: Stabiler Bestand mit Cross-Selling-Potenzial</li>
          </ul>
        </div>
      </div>

      {/* Tabelle: Top 10 hoherisk Policen */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-light text-[#1A1A1A]">Top 10 Policen mit RiskScore D/E</h2>
          <p className="text-xs text-gray-500">Sortiert nach Jahresprämie (absteigend)</p>
        </div>

        {topHighRiskPolicies.length === 0 ? (
          <p className="text-gray-500 text-sm">Aktuell sind keine Policen mit RiskScore D/E vorhanden.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra table-sm">
              <thead>
                <tr className="text-xs text-gray-500">
                  <th>Firma</th>
                  <th>Risk Score</th>
                  <th>Policennummer</th>
                  <th>Jahresprämie</th>
                </tr>
              </thead>
              <tbody>
                {topHighRiskPolicies.map((policy) => (
                  <tr key={policy.id}>
                    <td>{policy.company?.name ?? 'Unbekannt'}</td>
                    <td>{policy.quote?.riskScore ?? 'N/A'}</td>
                    <td>{policy.policyNumber}</td>
                    <td>
                      CHF {(Number(policy.premium) / 100).toLocaleString('de-CH')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
