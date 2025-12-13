/**
 * Cyber Services - Nach Versicherungsabschluss
 * Subpage für Kunden, die bereits eine Police haben und ihre Resilienz weiter stärken wollen.
 */

import Link from 'next/link';

export default function CyberPostPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-base-content">
          Ihre Versicherung schützt – unsere Services stärken.
        </h1>
        <p className="text-sm text-base-content/70">
          Mit Ihrer Cyberversicherung sind Sie finanziell abgesichert. Echte Cyberresilienz entsteht aber erst durch
          Prävention und gezielte Services. Zurich Resilience Solutions hilft Ihnen, Sicherheitsmassnahmen
          kontinuierlich zu verbessern.
        </p>
      </header>

      <section className="card bg-base-100 shadow-sm border border-base-200/80">
        <div className="card-body space-y-3 text-sm">
          <h2 className="card-title text-base">Warum Prävention sich lohnt</h2>
          <ul className="list-disc list-inside space-y-1 text-base-content/80">
            <li>Reduktion von Schadenfällen und Betriebsunterbrüchen.</li>
            <li>Besseres Verständnis Ihrer Schwachstellen und Risiken.</li>
            <li>Stärkung von Prozessen, Technologie und Mitarbeitenden-Verhalten.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-base-content">Nächste Schritte</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/quotes/new" className="btn btn-primary">
            Zusätzliche Cyber-Offerte anfragen
          </Link>
          <Link href="/contact/form" className="btn btn-outline">
            Mit Beratung / Chat starten
          </Link>
        </div>
      </section>
    </div>
  );
}
