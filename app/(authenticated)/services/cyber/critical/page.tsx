/**
 * Cyber Services - Besonders gefährdete Kunden
 * Subpage für Kunden mit hoher Cyberexponierung (z. B. RiskScore D/E).
 */

import Link from 'next/link';

export default function CyberCriticalPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-base-content">
          Hohe Cyberexponierung? Handeln Sie jetzt.
        </h1>
        <p className="text-sm text-base-content/70">
          Aktuelle Daten zeigen, dass Ihr Risikoprofil erhöht ist. Die Cyber Services von Zurich Resilience Solutions
          unterstützen Sie dabei, Schwachstellen zu minimieren und Angriffe wirksam abzuwehren – bevor sie Schaden
          anrichten.
        </p>
      </header>

      <section className="card bg-base-100 shadow-sm border border-base-200/80">
        <div className="card-body space-y-3 text-sm">
          <h2 className="card-title text-base">Fokus auf dringende Massnahmen</h2>
          <ul className="list-disc list-inside space-y-1 text-base-content/80">
            <li>Schnelle Identifikation der kritischsten Schwachstellen.</li>
            <li>Notfallpläne und Reaktionsprozesse für den Ernstfall.</li>
            <li>Priorisierte Umsetzung von technischen und organisatorischen Schutzmassnahmen.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-base-content">Nächste Schritte</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/quotes/new" className="btn btn-primary">
            Cyber-Offerte mit Fokus auf hohes Risiko
          </Link>
          <Link href="/contact/form" className="btn btn-outline">
            Mit Beratung / Chat starten
          </Link>
        </div>
      </section>
    </div>
  );
}
