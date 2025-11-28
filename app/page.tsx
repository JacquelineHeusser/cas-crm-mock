/**
 * ZurichOne Landing Page
 * Einstiegsseite für Firmenkunden-Portal
 */

import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0032A0] via-[#008C95] to-[#0032A0]">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <Image
                src="/zurich-logo.png"
                alt="Zurich"
                width={200}
                height={60}
                priority
              />
            </div>
          </div>
          <h1 className="text-5xl font-light text-white mb-4">
            Willkommen bei ZurichOne
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Ihr digitales Portal für Cyber-Versicherungen
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="w-16 h-16 bg-[#CADB2D] rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-[#0032A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#0032A0] mb-3">
              Schnelle Offerten
            </h3>
            <p className="text-gray-600">
              Erhalten Sie innert Minuten eine massgeschneiderte Cyber-Versicherungsofferte
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="w-16 h-16 bg-[#008C95] rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#0032A0] mb-3">
              Digitaler Abschluss
            </h3>
            <p className="text-gray-600">
              Schliessen Sie Ihre Versicherung komplett digital ab – papierlos und sicher
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="w-16 h-16 bg-[#D9E8FC] rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-[#0032A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#0032A0] mb-3">
              24/7 Verfügbar
            </h3>
            <p className="text-gray-600">
              Verwalten Sie Ihre Versicherungen jederzeit und von überall aus
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link 
            href="/quotes/new"
            className="btn bg-[#CADB2D] text-[#0032A0] hover:bg-[#CADB2D]/90 border-none px-12 py-4 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all"
          >
            Offerte berechnen
          </Link>
          <Link 
            href="/login"
            className="btn bg-white text-[#0032A0] hover:bg-white/90 border-none px-12 py-4 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all"
          >
            Anmelden
          </Link>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-16 text-white/80">
          <p className="text-sm">
            Cyber-Versicherung für Schweizer KMU | Powered by Zurich Insurance
          </p>
        </div>
      </div>
    </div>
  );
}
