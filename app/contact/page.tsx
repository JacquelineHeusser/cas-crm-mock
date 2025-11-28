/**
 * Kontakt Seite
 * Kontaktinformationen und Support-Optionen für Kunden
 */

'use client';

import { Phone, Mail, MapPin, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <h1 className="text-4xl font-light text-[#0032A0] mb-8">
          Kontakt
        </h1>

        {/* Logo und Intro */}
        <div className="text-center mb-12">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white border-4 border-gray-100 flex items-center justify-center overflow-hidden p-4">
            <Image
              src="/zurich-logo.png"
              alt="Zurich"
              width={120}
              height={40}
              className="object-contain"
            />
          </div>
          <p className="text-lg text-gray-700">
            Ihr direkter Draht zu uns: Wir beraten und unterstützen Sie in allen Versicherungsfragen.
          </p>
        </div>

        {/* Telefonnummern */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Aus der Schweiz</p>
            <a
              href="tel:0800808080"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-[#0032A0] text-[#0032A0] rounded-full hover:bg-[#0032A0] hover:text-white transition-colors"
            >
              <Phone className="w-5 h-5" />
              0800 80 80 80
            </a>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Aus dem Ausland</p>
            <a
              href="tel:+41446288888"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-[#0032A0] text-[#0032A0] rounded-full hover:bg-[#0032A0] hover:text-white transition-colors"
            >
              <Phone className="w-5 h-5" />
              +41 44 628 88 88
            </a>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Schriftlich kontaktieren */}
          <div className="bg-[#E8F4F8] rounded-2xl p-8">
            <div className="w-16 h-16 bg-[#0032A0] rounded-full flex items-center justify-center mb-6 relative">
              <Mail className="w-8 h-8 text-white" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#CADB2D] rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-[#0032A0] rounded-full" />
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              Sie möchten uns Ihr Anliegen lieber schriftlich mitteilen?
            </p>
            <Link
              href="/contact/form"
              className="inline-flex items-center gap-2 text-[#0032A0] font-medium hover:gap-3 transition-all"
            >
              Schreiben Sie uns
              <span>→</span>
            </Link>
          </div>

          {/* Standort suchen */}
          <div className="bg-[#E8F4F8] rounded-2xl p-8">
            <div className="w-16 h-16 bg-[#008C95] rounded-full flex items-center justify-center mb-6">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-700 mb-4">
              Sie wünschen eine persönliche Beratung? Hier finden Sie unsere nächste Generalagenten oder unseren nächsten Zurich Help Point.
            </p>
            <a
              href="https://www.zurich.ch/de/kontakt-standorte"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#0032A0] font-medium hover:gap-3 transition-all"
            >
              Standort suchen
              <span>→</span>
            </a>
          </div>
        </div>

        {/* Schadenfall Banner */}
        <div className="bg-gradient-to-r from-[#CADB2D] to-[#CADB2D]/80 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0032A0] text-white rounded-full hover:bg-[#0032A0]/90 transition-colors whitespace-nowrap"
          >
            Einen Schaden melden
            <span>→</span>
          </Link>
        </div>

        {/* Zusätzliche Kontaktinformationen */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-[#0032A0] mb-3">
                Öffnungszeiten
              </h3>
              <div className="space-y-2 text-gray-700">
                <p>Montag - Freitag: 08:00 - 17:30 Uhr</p>
                <p>Samstag: Geschlossen</p>
                <p>Sonntag: Geschlossen</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-[#0032A0] mb-3">
                E-Mail Support
              </h3>
              <div className="space-y-2">
                <a
                  href="mailto:cyber@zurich.ch"
                  className="text-[#0032A0] hover:underline block"
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
