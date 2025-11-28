/**
 * Schadenfall melden
 * Placeholder für zukünftige Schadensmeldung
 */

'use client';

import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewClaimPage() {
  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Link */}
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 text-[#0032A0] hover:gap-3 transition-all mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Zurück
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-[#0032A0] rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-light text-[#0032A0] mb-4">
            Schadenfall melden
          </h1>
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
