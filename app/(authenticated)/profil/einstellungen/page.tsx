/**
 * Einstellungsseite - Mock-Ansicht für persönliche Einstellungen des Users.
 * Die Schalter haben aktuell noch keine Backend-Funktion, dienen aber als UI-Prototyp.
 */

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ProfilEinstellungenPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-[#1A1A1A]">Einstellungen</h1>
          <p className="text-gray-600 text-sm mt-1">
            Verwalten Sie hier Ihre persönlichen Präferenzen für Benachrichtigungen und Kommunikation.
          </p>
        </div>
        <Link href="/profil" className="btn btn-ghost btn-sm rounded-full">
          Zurück zum Profil
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-[#1A1A1A]">E-Mail-Benachrichtigungen</p>
            <p className="text-xs text-gray-500">
              Updates zu Offerten, Policen und wichtigen Mitteilungen per E-Mail erhalten.
            </p>
          </div>
          <input type="checkbox" className="toggle toggle-primary" defaultChecked />
        </div>

        <div className="divider" />

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-[#1A1A1A]">Benachrichtigungen im Cockpit</p>
            <p className="text-xs text-gray-500">
              Hinweise im Dashboard anzeigen, wenn neue Aufgaben oder Risiken anstehen.
            </p>
          </div>
          <input type="checkbox" className="toggle toggle-primary" defaultChecked />
        </div>

        <div className="divider" />

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-[#1A1A1A]">Sprache</p>
            <p className="text-xs text-gray-500">
              Aktuell werden alle Inhalte auf Deutsch angezeigt.
            </p>
          </div>
          <select className="select select-sm select-bordered w-40" defaultValue="de">
            <option value="de">Deutsch</option>
            <option value="fr" disabled>Französisch (bald verfügbar)</option>
            <option value="en" disabled>Englisch (bald verfügbar)</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button className="btn btn-ghost btn-sm">Abbrechen</button>
        <button className="btn btn-primary btn-sm" type="button">
          Änderungen speichern (Mock)
        </button>
      </div>

      <div className="bg-blue-50 rounded-lg border border-blue-100 p-4 text-xs text-blue-900">
        Diese Seite ist aktuell ein Prototyp. Die Einstellungen werden noch nicht dauerhaft gespeichert,
        können aber später an eine Server Action oder API angebunden werden.
      </div>
    </div>
  );
}
