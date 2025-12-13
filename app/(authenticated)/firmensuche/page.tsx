/**
 * Firmensuche (Dun & Bradstreet Stil)
 * Seite zur Suche in den Company-Daten (companies-Tabelle) anhand von Firmenname, Ort oder PLZ.
 */

import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();

interface FirmensuchePageProps {
  searchParams: {
    q?: string;
  };
}

export default async function FirmensuchePage({ searchParams }: FirmensuchePageProps) {
  const query = (searchParams.q ?? '').trim();

  const results = await prisma.company.findMany({
    where:
      query.length > 1
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { city: { contains: query, mode: 'insensitive' } },
              { zip: { contains: query, mode: 'insensitive' } },
              { industry: { contains: query, mode: 'insensitive' } },
            ],
          }
        : undefined,
    orderBy: {
      name: 'asc',
    },
    take: 50,
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
          <div className="badge badge-outline badge-primary text-xs uppercase tracking-wide">
            Dun &amp; Bradstreet Mockdaten
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
          {query && (
            <p className="text-sm text-base-content/70">
              Suchbegriff: <span className="font-semibold">{query}</span> – {results.length} Treffer (max. 50 angezeigt)
            </p>
          )}

          {!query && (
            <p className="text-sm text-base-content/70">
              Gib einen Firmennamen, eine DUNS-ähnliche Nummer oder einen Ort ein, um die Suche zu starten.
            </p>
          )}

          {query && results.length === 0 && (
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
        </div>

        <div className="mt-6 text-xs text-base-content/60 max-w-3xl">
          <p>
            Hinweis: Alle angezeigten Firmen sind Mockdaten und dienen ausschließlich zur Demonstration einer
            Dun-&amp;-Bradstreet-ähnlichen Firmensuche in diesem CRM-Prototyp.
          </p>
        </div>
      </div>
    </div>
  );
}
