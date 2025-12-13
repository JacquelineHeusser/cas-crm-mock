/**
 * Cyber Services - Allgemeine Übersicht
 * Subpage mit einem breiten, neutralen Überblick über Cyber Services.
 */

import Link from 'next/link';

export default function CyberOverviewPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-base-content">
          Zukunftssichere Cyberresilienz für jedes Unternehmen.
        </h1>
        <p className="text-sm text-base-content/70">
          Unsere Cyber Services helfen Ihnen, Risiken zu erkennen, Schutz zu verbessern und Angriffsversuche frühzeitig
          abzuwehren. Prävention, Expertise und massgeschneiderte Lösungen – alles aus einer Hand.
        </p>
         <p className="text-xs text-base-content/60">
           Der Risk Score A–E zeigt Ihnen, wo Sie im Vergleich zu ähnlichen Unternehmen stehen. Auf dieser Seite finden
           Sie Bausteine, mit denen Sie Ihr Niveau unabhängig vom Ausgangsscore weiterentwickeln können.
         </p>
      </header>

      <section className="card bg-base-100 shadow-sm border border-base-200/80">
        <div className="card-body space-y-3 text-sm">
          <h2 className="card-title text-base">Typische Bausteine unserer Cyber Services</h2>
          <ul className="list-disc list-inside space-y-1 text-base-content/80">
            <li>Risikobewertungen und Cyber-Workshops.</li>
            <li>Technische und organisatorische Sicherheitsreviews.</li>
            <li>Awareness-Trainings für Mitarbeitende.</li>
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
