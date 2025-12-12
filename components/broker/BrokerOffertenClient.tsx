/**
 * Client-Komponente für Broker Offerten-Übersicht mit Suchfunktion
 */

'use client';

import { useState } from 'react';
import { ChevronRight, Search, FileText } from 'lucide-react';
import Link from 'next/link';
import { PACKAGES } from '@/lib/validation/premium-schema';

interface Quote {
  id: string;
  quoteNumber: string;
  status: string;
  riskScore: string | null;
  premium: string | null;
  companyData: any;
  coverage: any;
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface BrokerOffertenClientProps {
  userName: string;
  quotes: Quote[];
}

export default function BrokerOffertenClient({ userName, quotes }: BrokerOffertenClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const firstName = userName.split(' ')[0];

  // Filter nach Suchbegriff
  const filteredQuotes = searchQuery
    ? quotes.filter(quote => {
        const query = searchQuery.toLowerCase();
        const companyData = quote.companyData as any;
        const companyName = (companyData?.companyName || '').toLowerCase();
        const customerName = quote.user.name.toLowerCase();
        const quoteNumber = quote.quoteNumber.toLowerCase();
        
        return companyName.includes(query) || 
               customerName.includes(query) || 
               quoteNumber.includes(query);
      })
    : quotes;

  // Status Badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return { label: 'Entwurf', class: 'bg-orange-100 text-orange-700' };
      case 'CALCULATED':
        return { label: 'Berechnet', class: 'bg-blue-100 text-blue-700' };
      case 'PENDING_UNDERWRITING':
        return { label: 'Risikoprüfung ausstehend', class: 'bg-yellow-100 text-yellow-700' };
      case 'APPROVED':
        return { label: 'Genehmigt', class: 'bg-green-100 text-green-700' };
      case 'REJECTED':
        return { label: 'Abgelehnt', class: 'bg-red-100 text-red-700' };
      case 'EXPIRED':
        return { label: 'Abgelaufen', class: 'bg-gray-100 text-gray-700' };
      case 'POLICIED':
        return { label: 'Police erstellt', class: 'bg-purple-100 text-purple-700' };
      default:
        return { label: status, class: 'bg-gray-100 text-gray-700' };
    }
  };

  // Risk Score Badge
  const getRiskScoreBadge = (score: string | null) => {
    if (!score) return null;
    
    const config: Record<string, { bg: string; text: string; label: string }> = {
      A: { bg: 'bg-green-100', text: 'text-green-800', label: 'A' },
      B: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'B' },
      C: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'C' },
      D: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'D' },
      E: { bg: 'bg-red-100', text: 'text-red-800', label: 'E' },
    };
    
    return config[score] || null;
  };

  // Formatiere Prämie
  const formatPremium = (premium: string | null, coverage: any) => {
    if (premium) {
      const amount = Number(premium) / 100; // Rappen zu CHF
      return `CHF ${amount.toLocaleString('de-CH')}`;
    }
    
    if (coverage?.package) {
      const packageData = PACKAGES[coverage.package as keyof typeof PACKAGES];
      if (packageData) {
        return `CHF ${packageData.price.toLocaleString('de-CH')}`;
      }
    }
    
    return 'Noch nicht berechnet';
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-[#1A1A1A] mb-2">
            Guten Tag {firstName}
          </h1>
          <p className="text-gray-600 text-sm">
            Alle Cyber-Versicherungs-Offerten
          </p>
        </div>

        {/* Statistiken */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[#1A1A1A]">{quotes.length}</p>
                <p className="text-sm text-gray-600">Total Offerten</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <FileText className="text-yellow-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[#1A1A1A]">
                  {quotes.filter(q => q.status === 'PENDING_UNDERWRITING').length}
                </p>
                <p className="text-sm text-gray-600">In Prüfung</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[#1A1A1A]">
                  {quotes.filter(q => q.status === 'APPROVED').length}
                </p>
                <p className="text-sm text-gray-600">Genehmigt</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <FileText className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[#1A1A1A]">
                  {quotes.filter(q => q.status === 'POLICIED').length}
                </p>
                <p className="text-sm text-gray-600">Policen</p>
              </div>
            </div>
          </div>
        </div>

        {/* Suchfeld */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Suche nach Firma, Kunde oder Offertennummer..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
            />
          </div>
        </div>

        {/* Liste */}
        <div>
          <h2 className="text-2xl font-light text-[#0032A0] mb-6">
            Offerten ({filteredQuotes.length})
          </h2>

          {filteredQuotes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-500">
                {searchQuery ? 'Keine Ergebnisse gefunden' : 'Noch keine Offerten erstellt'}
              </p>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-sm text-[#0032A0] hover:underline mt-2"
                >
                  Suche zurücksetzen
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuotes.map((quote) => {
                const statusBadge = getStatusBadge(quote.status);
                const riskScoreBadge = getRiskScoreBadge(quote.riskScore);
                const companyData = quote.companyData as any;
                const companyName = companyData?.companyName || 'Unbekannt';
                const createdDate = new Date(quote.createdAt).toLocaleDateString('de-CH');
                
                return (
                  <Link
                    key={quote.id}
                    href={`/quotes/${quote.id}`}
                    className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer block"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 bg-[#D9E8FC] rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-7 h-7 text-[#0032A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-[#0032A0]">
                            {companyName} - Cyberversicherung
                          </h3>
                          {riskScoreBadge && (
                            <span className={`px-3 py-1 text-sm font-bold rounded ${riskScoreBadge.bg} ${riskScoreBadge.text}`}>
                              Score {riskScoreBadge.label}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-8 text-sm text-gray-600">
                          <span>Kunde: {quote.user.name}</span>
                          <span>Erstellt am {createdDate}</span>
                          <span>Offerte #{quote.quoteNumber}</span>
                        </div>
                      </div>
                      <div className="text-right mr-6">
                        <p className="text-sm text-gray-600 mb-1">
                          {quote.premium ? 'Prämie' : 'Prämie (geschätzt)'}
                        </p>
                        <p className="text-lg font-medium text-[#1A1A1A]">
                          {formatPremium(quote.premium, quote.coverage)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 text-sm font-medium rounded-full text-center min-w-[200px] ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                        <ChevronRight className="text-gray-400" size={32} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
