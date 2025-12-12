/**
 * Firmensuche (Dun & Bradstreet Stil)
 * Seite zur Suche in den DnbCompany-Mockdaten anhand von Firmenname oder DUNS-ähnlicher Nummer.
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

  let results = [] as Awaited<ReturnType<typeof prisma.dnbCompany.findMany>>;

  if (query.length > 1) {
    results = await prisma.dnbCompany.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { dunsNumber: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: {
        name: 'asc',
      },
      take: 50,
    });
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Firmensuche</h1>
          <p className="text-sm text-base-content/70">
            Suche nach Firmen (Mockdaten im Stil von Dun &amp; Bradstreet) anhand Name oder DUNS-Nummer.
          </p>
        </div>
      </div>

      <form className="card bg-base-100 shadow-md p-4" method="get">
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Firmenname oder DUNS-Nummer</span>
            <span className="label-text-alt">Mindestens 2 Zeichen</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="z. B. Demo Firma oder 76-00..."
              className="input input-bordered w-full"
            />
            <button type="submit" className="btn btn-primary whitespace-nowrap">
              Suchen
            </button>
          </div>
        </label>
      </form>

      <div className="space-y-2">
        {query && (
          <p className="text-sm text-base-content/70">
            Suchbegriff: <span className="font-semibold">{query}</span> – {results.length} Treffer (max. 50 angezeigt)
          </p>
        )}

        {!query && (
          <p className="text-sm text-base-content/70">
            Gib einen Firmennamen oder eine DUNS-ähnliche Nummer ein, um die Suche zu starten.
          </p>
        )}

        {query && results.length === 0 && (
          <div className="alert alert-info">
            <span>Keine Firmen gefunden. Versuche einen allgemeineren Suchbegriff.</span>
          </div>
        )}

        {results.length > 0 && (
          <div className="grid gap-3">
            {results.map((company) => (
              <div key={company.id} className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body py-3 px-4 flex flex-row justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="card-title text-base leading-snug">{company.name}</h2>
                      <span className="badge badge-outline text-xs">DUNS {company.dunsNumber}</span>
                    </div>
                    <p className="text-sm text-base-content/70">
                      {company.address}, {company.zip} {company.city}, {company.country}
                    </p>
                    <p className="text-xs text-base-content/60">
                      Branche: {company.industryCode} • Mitarbeitende: {company.employeeCount} • Umsatz ca.{' '}
                      {Number(company.annualRevenue) / 100_00} CHF
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-base-content/60">Risiko-Rating</span>
                      <span
                        className={
                          'badge text-xs ' +
                          (company.riskRating <= 2
                            ? 'badge-success'
                            : company.riskRating === 3
                            ? 'badge-warning'
                            : 'badge-error')
                        }
                      >
                        {company.riskRating} / 5
                      </span>
                    </div>
                    <Link
                      href={`/quotes/new?dnbId=${company.id}`}
                      className="btn btn-sm btn-outline"
                    >
                      Firma übernehmen
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-xs text-base-content/60">
        <p>
          Hinweis: Dies sind reine Mockdaten und dienen nur zur Demonstration einer Dun-&amp;-Bradstreet-ähnlichen Firmensuche.
        </p>
      </div>
    </div>
  );
}
