/**
 * BI-Dashboard für Head Cyber Underwriting & MFU Teamleiter
 * Nutzt bestehende Risiko- und Volumen-KPIs und zeigt diese in einer konzentrierten BI-Ansicht.
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface BiDashboardPageProps {
  searchParams?: {
    period?: string;
  };
}

export default async function BiDashboardPage({ searchParams }: BiDashboardPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'MFU_TEAMLEITER' && user.role !== 'HEAD_CYBER_UNDERWRITING') {
    redirect('/dashboard');
  }

  const validRiskScores = ['A', 'B', 'C', 'D', 'E'];

  // Zeitraumfilter bestimmen
  const period = searchParams?.period ?? '12m';
  const now = new Date();
  let dateFrom: Date | undefined;
  let dateTo: Date | undefined;

  if (period === '12m') {
    dateFrom = new Date(now);
    dateFrom.setFullYear(now.getFullYear() - 1);
  } else if (period === 'year') {
    dateFrom = new Date(now.getFullYear(), 0, 1);
  } else if (period === 'last-year') {
    dateFrom = new Date(now.getFullYear() - 1, 0, 1);
    dateTo = new Date(now.getFullYear(), 0, 1);
  } else {
    // 'all' -> keine Einschränkung
    dateFrom = undefined;
    dateTo = undefined;
  }

  const createdAtFilter =
    dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom ? { gte: dateFrom } : {}),
            ...(dateTo ? { lt: dateTo } : {}),
          },
        }
      : {};

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
      where: {
        riskScore: score as any,
        ...createdAtFilter,
      },
    });
  }

  // Volumen-KPIs
  const openQuotesAgg = await prisma.quote.aggregate({
    where: {
      status: {
        in: ['DRAFT', 'CALCULATED', 'PENDING_UNDERWRITING'],
      },
      ...createdAtFilter,
    },
    _count: { _all: true },
    _sum: { premium: true },
  });

  const openQuoteCount = openQuotesAgg._count._all ?? 0;
  const openQuotePremiumTotal = Number(openQuotesAgg._sum.premium ?? 0) / 100;

  const activePoliciesAgg = await prisma.policy.aggregate({
    where: {
      status: 'ACTIVE',
      ...createdAtFilter,
    },
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
      ...createdAtFilter,
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
      ...createdAtFilter,
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

  // Hilfswerte für Diagramm-Skalierung
  const maxRiskCount = Math.max(...validRiskScores.map((s) => quoteRiskCounts[s] ?? 0), 1);
  const maxVolume = Math.max(openQuotePremiumTotal, activePolicyPremiumTotal, 1);

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-light text-[#1A1A1A] mb-1">BI Cockpit Cyber</h1>
        <p className="text-gray-600 text-sm">
          Übersicht über Offerten, Bestand und Risikoprofil für Cyber – speziell für Head Cyber Underwriting
          und MFU Teamleiter.
        </p>
      </div>

      {/* Zeitraum-Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 text-xs flex flex-wrap items-center gap-2">
        <span className="text-gray-600 mr-1">Zeitraum:</span>
        {[
          { id: '12m', label: 'Letzte 12 Monate' },
          { id: 'year', label: 'Dieses Jahr' },
          { id: 'last-year', label: 'Letztes Jahr' },
          { id: 'all', label: 'Alle Zeiträume' },
        ].map((option) => (
          <Link
            key={option.id}
            href={`/bi?period=${option.id}`}
            className={`px-2 py-1 rounded-full border text-xs ${
              period === option.id
                ? 'bg-[#0032A0] text-white border-[#0032A0]'
                : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            {option.label}
          </Link>
        ))}
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

      {/* Grafische Verteilung nach RiskScore */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-sm">
        <h2 className="text-lg font-light text-[#1A1A1A] mb-1">Verteilung Offerten nach Risk Score</h2>
        <p className="text-xs text-gray-500 mb-4">
          Balkendiagramm basierend auf der Anzahl Offerten pro Risk Score.
        </p>
        <div className="space-y-2">
          {validRiskScores.map((score) => {
            const value = quoteRiskCounts[score] ?? 0;
            const widthPercent = (value / maxRiskCount) * 100;
            return (
              <div key={score} className="flex items-center gap-3 text-xs">
                <div className="w-6 font-semibold text-gray-700">{score}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-[#0032A0]"
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
                <div className="w-10 text-right text-gray-600">{value}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Volumen-Vergleich als Balken-Diagramm */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-sm">
        <h2 className="text-lg font-light text-[#1A1A1A] mb-1">Volumenvergleich</h2>
        <p className="text-xs text-gray-500 mb-4">
          Vergleich der geschätzten Jahresprämien: offene Offerten vs. aktiver Bestand.
        </p>
        <div className="space-y-3">
          {[{
            label: 'Offene Offerten (CHF)',
            value: openQuotePremiumTotal,
            color: 'bg-[#008C95]',
          }, {
            label: 'Aktiver Bestand (CHF)',
            value: activePolicyPremiumTotal,
            color: 'bg-[#0032A0]',
          }].map((item) => {
            const widthPercent = (item.value / maxVolume) * 100;
            return (
              <div key={item.label} className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-700">{item.label}</span>
                  <span className="text-gray-600">
                    CHF {item.value.toLocaleString('de-CH')}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full ${item.color}`}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
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
