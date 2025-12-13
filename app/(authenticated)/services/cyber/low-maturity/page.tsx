/**
 * Cyber Services - Geringe IT-Maturität
 * Subpage für Kunden, die Unterstützung und einfache Erklärungen brauchen.
 */

import Link from 'next/link';

export default function CyberLowMaturityPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-base-content">
          Cybersicherheit muss nicht kompliziert sein.
        </h1>
        <p className="text-sm text-base-content/70">
          Viele Unternehmen wissen, dass sie mehr für Cybersicherheit tun müssten – aber nicht, wo sie anfangen sollen.
          Mit Zurich Resilience Solutions gehen Sie Schritt für Schritt vor und behalten stets den Überblick.
        </p>
        <p className="text-xs text-base-content/60">
          Ein tiefer Cyberreifegrad kann sich im Risk Score widerspiegeln. Diese Seite zeigt, wie Sie Ihren Score mit
          pragmatischen Massnahmen nach und nach verbessern können.
        </p>
      </header>

      <section className="card bg-base-100 shadow-sm border border-base-200/80">
        <div className="card-body space-y-3 text-sm">
          <h2 className="card-title text-base">Wie wir Sie unterstützen</h2>
          <ul className="list-disc list-inside space-y-1 text-base-content/80">
            <li>Einfache Einstiegs-Checks, um Ihren aktuellen Cyberreifegrad zu verstehen.</li>
            <li>Priorisierte Massnahmenliste ohne technische Fachsprache.</li>
            <li>Begleitung bei der Umsetzung – von ersten Quick Wins bis zu langfristigen Projekten.</li>
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
