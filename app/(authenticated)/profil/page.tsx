/**
 * Profilseite - zeigt die persönlichen Daten des aktuell eingeloggten Users an.
 */

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ProfilPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-[#1A1A1A]">Mein Profil</h1>
          <p className="text-gray-600 text-sm mt-1">
            Hier sehen Sie Ihre bei Zurich One hinterlegten persönlichen Daten.
          </p>
        </div>
        <Link
          href="/profil/einstellungen"
          className="btn btn-outline btn-sm rounded-full"
        >
          Einstellungen
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Name</p>
          <p className="font-medium text-[#1A1A1A]">{user.name}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">E-Mail</p>
          <p className="font-medium text-[#1A1A1A]">{user.email}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Rolle</p>
          <p className="font-medium text-[#1A1A1A]">{user.role}</p>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg border border-blue-100 p-4 text-xs text-blue-900">
        Weitere Profilangaben (z. B. Adresse oder Telefonnummer) können bei Bedarf ergänzt werden.
      </div>
    </div>
  );
}
