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
        <p className="text-xs text-base-content/60">
          Ein Risk Score im Bereich D/E weist auf eine erhöhte Angriffsfläche oder kritische Abhängigkeiten hin.
          Hier geht es darum, zuerst die grössten Risiken zu entschärfen und gleichzeitig die Vorbereitung auf den
          Ernstfall zu verbessern.
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

      <section className="grid gap-4 md:grid-cols-2">
        <article className="card bg-base-100 shadow-sm border border-base-200/80">
          <div className="card-body space-y-2 text-sm">
            <h2 className="card-title text-base">Typische Branchen mit hoher Exponierung</h2>
            <ul className="list-disc list-inside space-y-1 text-base-content/80">
              <li>Unternehmen mit stark vernetzter Produktion (z. B. Industrie 4.0).</li>
              <li>Organisationen mit sensiblen Kundendaten (Gesundheitswesen, Finanzdienstleister).</li>
              <li>Dienstleister mit hoher Abhängigkeit von IT-Verfügbarkeit (z. B. E‑Commerce, SaaS).</li>
            </ul>
          </div>
        </article>

        <article className="card bg-base-100 shadow-sm border border-base-200/80">
          <div className="card-body space-y-2 text-sm">
            <h2 className="card-title text-base">Beispielprojekt (vereinfachter Ablauf)</h2>
            <ol className="list-decimal list-inside space-y-1 text-base-content/80">
              <li>Kick-off mit Review des aktuellen Risk Scores und der wichtigsten Geschäftsprozesse.</li>
              <li>Technische und organisatorische Kurz-Analyse („High Level Assessment“).</li>
              <li>Definition von 3–5 Sofortmassnahmen und eines mittelfristigen Verbesserungsplans.</li>
            </ol>
          </div>
        </article>
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
