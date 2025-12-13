/**
 * Client-Komponente für Broker/Underwriter Policen-Übersicht mit Suchfunktion
 */

'use client';

import { useState } from 'react';
import { ChevronRight, Search, Shield } from 'lucide-react';
import Link from 'next/link';

interface Policy {
  id: string;
  policyNumber: string;
  status: string;
  premium: string;
  startDate: string;
  endDate: string;
  coverage: any;
  user: {
    id: string;
    name: string;
    email: string;
  };
  company: {
    name: string;
  } | null;
  quote: {
    quoteNumber: string;
    riskScore: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

interface BrokerPolicenClientProps {
  userName: string;
  policies: Policy[];
}

export default function BrokerPolicenClient({ userName, policies }: BrokerPolicenClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string | null>(null);

  const firstName = userName.split(' ')[0];

  // Filter nach Suchbegriff
  const searchFilteredPolicies = searchQuery
    ? policies.filter(policy => {
        const query = searchQuery.toLowerCase();
        const companyName = (policy.company?.name || '').toLowerCase();
        const customerName = policy.user.name.toLowerCase();
        const policyNumber = policy.policyNumber.toLowerCase();
        
        return companyName.includes(query) || 
               customerName.includes(query) || 
               policyNumber.includes(query);
      })
    : policies;

  // Optionaler RiskScore-Filter (A-E) basierend auf RiskScore der zugehörigen Quote
  const filteredPolicies = riskFilter
    ? searchFilteredPolicies.filter((policy) => (policy.quote.riskScore || '').toUpperCase() === riskFilter)
    : searchFilteredPolicies;

  // Status Badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { label: 'Aktiv', class: 'bg-green-100 text-green-700' };
      case 'CANCELLED':
        return { label: 'Gekündigt', class: 'bg-red-100 text-red-700' };
      case 'EXPIRED':
        return { label: 'Abgelaufen', class: 'bg-gray-100 text-gray-700' };
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
  const formatPremium = (premium: string) => {
    const amount = Number(premium) / 100; // Rappen zu CHF
    return `CHF ${amount.toLocaleString('de-CH')}`;
  };

  // Formatiere Datum
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-CH');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0032A0] to-[#005A9C] text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-light mb-2">
            Hallo {firstName}
          </h1>
          <p className="text-white/80 text-lg">
            Alle Policen im Überblick
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Suchleiste + RiskScore-Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 space-y-3">
          {/* RiskScore Filter */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-500 mr-1">Risk Score:</span>
            <button
              type="button"
              onClick={() => setRiskFilter(null)}
              className={`px-2 py-1 rounded-full border text-xs ${
                !riskFilter
                  ? 'bg-[#0032A0] text-white border-[#0032A0]'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              Alle
            </button>
            {['A', 'B', 'C', 'D', 'E'].map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => setRiskFilter(score)}
                className={`px-2 py-1 rounded-full border text-xs ${
                  riskFilter === score
                    ? 'bg-[#0032A0] text-white border-[#0032A0]'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {score}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Policen durchsuchen (Firma, Kunde, Policennummer)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0032A0] focus:border-transparent"
            />
          </div>
        </div>

        {/* Statistiken */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1A1A1A]">
                  {policies.filter(p => p.status === 'ACTIVE').length}
                </p>
                <p className="text-sm text-gray-600">Aktive Policen</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1A1A1A]">
                  {filteredPolicies.length}
                </p>
                <p className="text-sm text-gray-600">Gesamt Policen</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1A1A1A]">
                  {policies.filter(p => p.status === 'CANCELLED').length}
                </p>
                <p className="text-sm text-gray-600">Gekündigt</p>
              </div>
            </div>
          </div>
        </div>

        {/* Policen Liste */}
        <div className="space-y-4">
          {filteredPolicies.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Shield className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                {searchQuery ? 'Keine Policen gefunden' : 'Noch keine Policen'}
              </h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? 'Versuche einen anderen Suchbegriff' 
                  : 'Es wurden noch keine Policen erstellt'}
              </p>
            </div>
          ) : (
            filteredPolicies.map((policy) => {
              const statusBadge = getStatusBadge(policy.status);
              const riskScoreBadge = getRiskScoreBadge(policy.quote.riskScore);
              const companyName = policy.company?.name || policy.coverage?.companyName || 'Unbekannt';

              return (
                <Link
                  key={policy.id}
                  href={`/policen/${policy.id}`}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow block"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-[#1A1A1A]">
                          {companyName}
                        </h3>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                        {riskScoreBadge && (
                          <span className={`px-2 py-1 text-xs font-bold rounded ${riskScoreBadge.bg} ${riskScoreBadge.text}`}>
                            Risk Score: {riskScoreBadge.label}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Policennummer</p>
                          <p className="font-medium text-[#1A1A1A]">{policy.policyNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Kunde</p>
                          <p className="font-medium text-[#1A1A1A]">{policy.user.name}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Jahresprämie</p>
                          <p className="font-medium text-[#1A1A1A]">{formatPremium(policy.premium)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Versicherungsbeginn</p>
                          <p className="font-medium text-[#1A1A1A]">{formatDate(policy.startDate)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <ChevronRight className="text-gray-400 ml-4" size={20} />
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
