/**
 * Cyber Services - Storytelling
 * Subpage mit emotionalem Storytelling-Fokus rund um Cybervorfälle und Vorbereitung.
 */

import Link from 'next/link';

export default function CyberStoryPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-base-content">
          Ein Angriff kann jeden treffen – Vorbereitung macht den Unterschied.
        </h1>
        <p className="text-sm text-base-content/70">
          Cybervorfälle passieren täglich. Entscheidend ist, wie gut ein Unternehmen vorbereitet ist. Unsere Cyber
          Services geben Ihnen eine klare Orientierung, wie Sie Ihre Organisation Schritt für Schritt widerstandsfähiger
          machen – mit messbarem Effekt.
        </p>
        <p className="text-xs text-base-content/60">
          Der Risk Score A–E macht dieses Risiko sichtbar – aber er erzählt noch nicht die ganze Geschichte. Diese Seite
          zeigt, wie Sie Abläufe und Zuständigkeiten so vorbereiten, dass Ihr Unternehmen im Ernstfall handlungsfähig
          bleibt.
        </p>
      </header>

      <section className="card bg-base-100 shadow-sm border border-base-200/80">
        <div className="card-body space-y-3 text-sm">
          <h2 className="card-title text-base">Ein möglicher Verlauf – und wie Sie ihn beeinflussen</h2>
          <ul className="list-disc list-inside space-y-1 text-base-content/80">
            <li>Vor dem Angriff: Risiken erkennen, Schutz aufbauen, Notfallpläne testen.</li>
            <li>Während des Angriffs: schnell reagieren, Schäden begrenzen, Kommunikation steuern.</li>
            <li>Nach dem Angriff: aus Vorfällen lernen und Resilienz weiter erhöhen.</li>
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
