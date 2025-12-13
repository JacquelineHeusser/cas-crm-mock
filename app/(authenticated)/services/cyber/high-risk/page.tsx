/**
 * Cyber Services - Erhöhtes Cyberrisiko
 * Subpage für Kunden mit erhöhtem Risiko (z. B. RiskScore C), inkl. Offerten-CTA und Kontakt/Chat-CTA.
 */

import Link from 'next/link';

export default function CyberHighRiskPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-base-content">
          Erkennen Sie Ihr Risiko – stärken Sie Ihre Resilienz.
        </h1>
        <p className="text-sm text-base-content/70">
          Cyberangriffe treffen Unternehmen jeder Grösse. Ihre aktuelle Risikoeinschätzung zeigt, dass zusätzliche
          Schutzmassnahmen sinnvoll sind. Mit den Cyber Services von Zurich Resilience Solutions reduzieren Sie Ihre
          Angriffsfläche gezielt.
        </p>
      </header>

      <section className="card bg-base-100 shadow-sm border border-base-200/80">
        <div className="card-body space-y-3 text-sm">
          <h2 className="card-title text-base">Was wir für Sie tun können</h2>
          <ul className="list-disc list-inside space-y-1 text-base-content/80">
            <li>Risiko-Workshops, um Ihre wichtigsten Cyberrisiken zu identifizieren.</li>
            <li>Analyse von Prozessen, Systemen und Organisation aus Sicht der Angreifer.</li>
            <li>Konkrete Handlungsempfehlungen, priorisiert nach Wirkung und Aufwand.</li>
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
