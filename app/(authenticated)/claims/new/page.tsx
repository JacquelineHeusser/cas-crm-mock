/**
 * Schadenfall melden
 * Placeholder für zukünftige Schadensmeldung
 */

import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function NewClaimPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Extrahiere Vornamen
  const firstName = user.name.split(' ')[0];

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-light text-[#1A1A1A] mb-2">
          Guten Tag {firstName}
        </h1>
        <p className="text-gray-600 text-sm mb-8">
          Wir sind immer für Sie da.
        </p>

        {/* Content */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-[#0032A0] rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-light text-[#0032A0] mb-4">
            Schadenfall melden
          </h2>
          <p className="text-gray-700">
            Diese Funktionalität wird in Kürze verfügbar sein.
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-[#E8F4F8] rounded-2xl p-8">
          <h2 className="text-xl font-medium text-[#0032A0] mb-4">
            Vorübergehend: Telefonische Schadenmeldung
          </h2>
          <p className="text-gray-700 mb-6">
            Bis zur Freischaltung der digitalen Schadenmeldung können Sie uns Ihren Schadenfall telefonisch melden:
          </p>
          <div className="space-y-4">
            <a
              href="tel:0800808080"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#0032A0] text-[#0032A0] rounded-full hover:bg-[#0032A0] hover:text-white transition-colors"
            >
              0800 80 80 80
            </a>
            <p className="text-sm text-gray-600">
              Montag - Freitag: 08:00 - 17:30 Uhr
            </p>
          </div>
        </div>

        {/* Alternative: Kontakt */}
        <div className="mt-8 text-center">
          <p className="text-gray-700 mb-4">
            Oder schreiben Sie uns:
          </p>
          <Link
            href="/contact/form"
            className="inline-flex items-center gap-2 text-[#0032A0] font-medium hover:gap-3 transition-all"
          >
            Zum Kontaktformular
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
