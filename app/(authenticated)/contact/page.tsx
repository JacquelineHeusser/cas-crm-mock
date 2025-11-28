/**
 * Kontakt Seite
 * Kontaktinformationen und Support-Optionen für Kunden
 */

import { Phone, Mail, MapPin, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ContactPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Extrahiere Vornamen
  const firstName = user.name.split(' ')[0];

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-light text-[#1A1A1A] mb-2">
          Guten Tag {firstName}
        </h1>
        <p className="text-gray-600 text-sm mb-8">
          Wir sind immer für Sie da.
        </p>

        {/* Logo und Intro */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <Image
              src="/zurich-logo.png"
              alt="Zurich"
              width={120}
              height={40}
              className="mx-auto"
            />
          </div>
          <p className="text-lg text-[#0032A0]">
            Ihr direkter Draht zu uns: Wir beraten und unterstützen Sie in allen Versicherungsfragen.
          </p>
        </div>

        {/* Telefonnummern */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Aus der Schweiz</p>
            <a
              href="tel:0800808080"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-[#008C95] border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Phone className="w-5 h-5" />
              0800 80 80 80
            </a>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Aus dem Ausland</p>
            <a
              href="tel:+41446288888"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-[#008C95] border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Phone className="w-5 h-5" />
              +41 44 628 88 88
            </a>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Schriftlich kontaktieren */}
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="w-16 h-16 bg-[#008C95] rounded-full flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <p className="text-[#0032A0] mb-4">
              Sie möchten uns Ihr Anliegen lieber schriftlich mitteilen?
            </p>
            <Link
              href="/contact/form"
              className="inline-flex items-center gap-2 text-[#008C95] font-medium hover:gap-3 transition-all"
            >
              Schreiben Sie uns
              <span>→</span>
            </Link>
          </div>

          {/* Standort suchen */}
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="w-16 h-16 bg-[#008C95] rounded-full flex items-center justify-center mb-6">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <p className="text-[#0032A0] mb-4">
              Sie wünschen eine persönliche Beratung? Hier finden Sie unsere nächste Generalagenten oder unseren nächsten Zurich Help Point.
            </p>
            <a
              href="https://www.zurich.ch/de/kontakt-standorte"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#008C95] font-medium hover:gap-3 transition-all"
            >
              Standort suchen
              <span>→</span>
            </a>
          </div>
        </div>

        {/* Schadenfall Banner */}
        <div className="bg-white rounded-xl p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#0032A0] rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-[#0032A0] font-medium text-lg">
              Melden Sie uns Ihren Schadenfall - wir helfen Ihnen.
            </p>
          </div>
          <Link
            href="/claims/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#008C95] text-white rounded-full hover:bg-[#008C95]/90 transition-colors whitespace-nowrap"
          >
            Einen Schaden melden
            <span>→</span>
          </Link>
        </div>

        {/* Zusätzliche Kontaktinformationen */}
        <div className="mt-12 pt-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-medium text-[#0032A0] mb-3">
                Öffnungszeiten
              </h3>
              <div className="space-y-2 text-gray-700">
                <p>Montag - Freitag: 08:00 - 17:30 Uhr</p>
                <p>Samstag: Geschlossen</p>
                <p>Sonntag: Geschlossen</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-medium text-[#0032A0] mb-3">
                E-Mail Support
              </h3>
              <div className="space-y-2">
                <a
                  href="mailto:cyber@zurich.ch"
                  className="text-[#008C95] hover:underline block"
                >
                  cyber@zurich.ch
                </a>
                <p className="text-sm text-gray-600">
                  Wir antworten innerhalb von 24 Stunden
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
