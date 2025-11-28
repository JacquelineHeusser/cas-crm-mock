/**
 * Dashboard
 * Zentrale Übersichtsseite nach Login
 * Zeigt unterschiedliche Inhalte je nach Benutzerrolle
 */

import { getCurrentUser } from '@/lib/auth';
import { logout } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Falls nicht eingeloggt (sollte durch Middleware abgefangen werden)
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header mit Logout */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">ZurichOne Dashboard</h1>
            <p className="text-base-content/70 mt-1">
              Willkommen, {user.name}
            </p>
          </div>
          <form action={logout}>
            <button type="submit" className="btn btn-ghost">
              Abmelden
            </button>
          </form>
        </div>

        {/* User Info Card */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">Ihre Informationen</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-base-content/70">E-Mail</p>
                <p className="font-semibold">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/70">Rolle</p>
                <p className="font-semibold">
                  {user.role === 'CUSTOMER' && 'Firmenkunde'}
                  {user.role === 'BROKER' && 'Vermittler'}
                  {user.role === 'UNDERWRITER' && 'Underwriter'}
                </p>
              </div>
              {user.company && (
                <>
                  <div>
                    <p className="text-sm text-base-content/70">Firma</p>
                    <p className="font-semibold">{user.company.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-base-content/70">Branche</p>
                    <p className="font-semibold">{user.company.industry}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Rollenspezifischer Content */}
        {user.role === 'CUSTOMER' && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Ihre Cyberversicherung</h2>
              <p className="text-base-content/70">
                Erstellen Sie eine neue Offerte oder verwalten Sie bestehende
                Policen.
              </p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-primary">Neue Offerte</button>
                <button className="btn btn-outline">Meine Policen</button>
              </div>
            </div>
          </div>
        )}

        {user.role === 'BROKER' && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Vermittler-Bereich</h2>
              <p className="text-base-content/70">
                Verwalten Sie Offerten für Ihre Kunden.
              </p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-primary">
                  Offerte für Kunde erstellen
                </button>
                <button className="btn btn-outline">Alle Offerten</button>
              </div>
            </div>
          </div>
        )}

        {user.role === 'UNDERWRITER' && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Underwriting-Bereich</h2>
              <p className="text-base-content/70">
                Prüfen und entscheiden Sie über Anträge mit Risiko-Score C-E.
              </p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-primary">Offene Fälle</button>
                <button className="btn btn-outline">Alle Fälle</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
