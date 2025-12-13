/**
 * Firmensuche
 * Seite zur Suche in den Company-Daten (companies-Tabelle) anhand von Firmenname, Ort oder PLZ.
 */

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// Diese Seite soll immer dynamisch gerendert werden (Suchparameter, Live-Daten)
export const dynamic = 'force-dynamic';

interface FirmensuchePageProps {
  searchParams: {
    q?: string;
    page?: string;
  };
}

export default async function FirmensuchePage({ searchParams }: FirmensuchePageProps) {
  // Nur Fachrollen sollen die Firmensuche nutzen (Broker / Underwriter / MFU / Head)
  const user = await getCurrentUser();
  if (
    !user ||
    ![
      'BROKER',
      'UNDERWRITER',
      'MFU_TEAMLEITER',
      'HEAD_CYBER_UNDERWRITING',
    ].includes(user.role)
  ) {
    redirect('/dashboard');
  }

  const query = (searchParams.q ?? '').trim();
  const pageSize = 10;
  const currentPage = Math.max(1, Number(searchParams.page ?? '1') || 1);

  // Gemeinsame WHERE-Bedingung für Suche (optional)
  const whereClause: Prisma.CompanyWhereInput = query.length > 1
    ? {
        OR: [
          { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { city: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { zip: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { industry: { contains: query, mode: Prisma.QueryMode.insensitive } },
        ],
      }
    : {};

  const totalCount = await prisma.company.count({ where: whereClause });
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const results = await prisma.company.findMany({
    where: whereClause,
    orderBy: {
      name: 'asc',
    },
    take: pageSize,
    skip: (safePage - 1) * pageSize,
  });

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-base-200/60 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Firmensuche
            </h1>
            <p className="mt-1 text-sm text-base-content/70 max-w-2xl">
              Suche in deinen Firmenkunden (companies) nach Namen, Orten, PLZ oder Branchen,
              um passende Unternehmen für Offerten zu finden.
            </p>
          </div>
        </div>

        <form className="card bg-base-100 shadow-md border border-base-200/70" method="get">
          <div className="card-body gap-4">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text font-medium">Firmenname, Ort, PLZ oder Branche</span>
                <span className="label-text-alt text-xs">Mindestens 2 Zeichen für Ergebnisse</span>
              </div>
              <div className="flex flex-col gap-2 md:flex-row">
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="z. B. Muster AG, Zürich, 8001, IT"
                  className="input input-bordered w-full"
                />
                <button type="submit" className="btn btn-primary md:w-auto w-full">
                  Suche starten
                </button>
              </div>
              <div className="mt-1 text-xs text-base-content/60">
                Tipp: Nutze möglichst sprechende Begriffe (z. B. nur den Hauptteil des Firmennamens oder den Ortsnamen).
              </div>
            </label>
          </div>
        </form>

        <div className="space-y-2">
          {(query || totalCount > 0) && (
            <p className="text-sm text-base-content/70">
              {query ? (
                <>
                  Suchbegriff: <span className="font-semibold">{query}</span>
                  {' '}
                  – {totalCount} Treffer
                </>
              ) : (
                <>
                  {totalCount} Firmen im Bestand
                </>
              )}
              {totalCount > 0 && (
                <>
                  {' '}– Seite {safePage} von {totalPages}
                </>
              )}
            </p>
          )}

          {!query && totalCount === 0 && (
            <p className="text-sm text-base-content/70">
              Gib einen Firmennamen, eine PLZ, einen Ort oder eine Branche ein, um die Suche zu starten.
            </p>
          )}

          {totalCount === 0 && query && (
            <div className="alert alert-info">
              <span>
                Keine Firmen gefunden. Versuche es mit einem allgemeineren Suchbegriff oder nur einem Teil des Namens.
              </span>
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-2 grid gap-3 md:grid-cols-2">
              {results.map((company) => (
                <div
                  key={company.id}
                  className="card bg-base-100 shadow-sm border border-base-200/80 hover:border-primary/60 transition-colors"
                >
                  <div className="card-body py-3 px-4 flex flex-row justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="card-title text-base leading-snug line-clamp-2">
                          {company.name}
                        </h2>
                      </div>
                      <p className="text-sm text-base-content/70">
                        {company.address}, {company.zip} {company.city}, {company.country}
                      </p>
                      <p className="text-xs text-base-content/60 flex flex-wrap gap-x-2 gap-y-1">
                        <span>Branche: {company.industry}</span>
                        <span className="hidden text-base-content/40 md:inline">•</span>
                        <span>Mitarbeitende: {company.employees}</span>
                        <span className="hidden text-base-content/40 md:inline">•</span>
                        <span>
                          Umsatz ca. {Number(company.revenue) / 100} CHF
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Link
                        href={`/quotes/new?companyId=${company.id}`}
                        className="btn btn-sm btn-outline whitespace-nowrap"
                      >
                        Firma in Offerte übernehmen
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <div>
                Zeige {(safePage - 1) * pageSize + 1}–
                {Math.min(safePage * pageSize, totalCount)} von {totalCount} Firmen
              </div>
              <div className="join">
                <Link
                  href={`/firmensuche?${new URLSearchParams({
                    ...(query ? { q: query } : {}),
                    page: String(Math.max(1, safePage - 1)),
                  }).toString()}`}
                  className={`btn btn-sm join-item ${safePage === 1 ? 'btn-disabled' : ''}`}
                >
                  « Zurück
                </Link>
                <Link
                  href={`/firmensuche?${new URLSearchParams({
                    ...(query ? { q: query } : {}),
                    page: String(Math.min(totalPages, safePage + 1)),
                  }).toString()}`}
                  className={`btn btn-sm join-item ${safePage === totalPages ? 'btn-disabled' : ''}`}
                >
                  Weiter »
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Kein zusätzlicher Mock-Hinweis mehr – es werden nur echte Firmenkunden aus der companies-Tabelle verwendet. */}
      </div>
    </div>
  );
}
