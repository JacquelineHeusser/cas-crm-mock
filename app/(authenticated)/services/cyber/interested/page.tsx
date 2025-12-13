/**
 * Cyber Services - Bereits Interesse gezeigt
 * Subpage für Kunden, die sich schon mit Cyberrisiken beschäftigt haben.
 */

import Link from 'next/link';

export default function CyberInterestedPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-base-content">
          Bereit für den nächsten Schritt in der Cybersicherheit?
        </h1>
        <p className="text-sm text-base-content/70">
          Sie haben sich bereits mit Cyberrisiken auseinandergesetzt. Jetzt ist der beste Moment, Ihr Unternehmen noch
          gezielter zu schützen. Die Cyber Services von Zurich Resilience Solutions geben Ihnen Zugang zu
          Expertenwissen und passenden Massnahmen.
        </p>
      </header>

      <section className="card bg-base-100 shadow-sm border border-base-200/80">
        <div className="card-body space-y-3 text-sm">
          <h2 className="card-title text-base">Was der nächste Schritt sein kann</h2>
          <ul className="list-disc list-inside space-y-1 text-base-content/80">
            <li>Vertiefte Risikoanalyse auf Basis Ihres bestehenden Schutzes.</li>
            <li>Gemeinsame Priorisierung der sinnvollsten Massnahmen.</li>
            <li>Begleitung bei der Umsetzung – von Quick Wins bis zu Strategieprojekten.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-base-content">Nächste Schritte</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/quotes/new" className="btn btn-primary">
            Cyber-Offerte anfragen
          </Link>
          <Link href="/contact/form" className="btn btn-outline">
            Mit Beratung / Chat starten
          </Link>
        </div>
      </section>
    </div>
  );
}
