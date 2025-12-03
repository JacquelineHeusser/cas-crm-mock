/**
 * Client-Komponente für Risikoprüfungen mit Tabs und Suchfunktion
 */

'use client';

import { useState } from 'react';
import { ChevronRight, AlertCircle, Clock, Search, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface UnderwritingCase {
  id: string;
  status: string;
  decision: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  quote: {
    id: string;
    quoteNumber: string;
    riskScore: string | null;
    companyData: any;
    user: {
      id: string;
      name: string;
      email: string;
    };
    createdAt: string;
    updatedAt: string;
  };
}

interface RisikopruefungenClientProps {
  userName: string;
  underwritingCases: UnderwritingCase[];
}

export default function RisikopruefungenClient({ userName, underwritingCases }: RisikopruefungenClientProps) {
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');
  const [searchQuery, setSearchQuery] = useState('');

  const firstName = userName.split(' ')[0];

  // Filter Cases nach Tab
  const openCases = underwritingCases.filter(c => c.status === 'PENDING' || c.status === 'IN_REVIEW' || c.status === 'NEEDS_INFO');
  const closedCases = underwritingCases.filter(c => c.status === 'APPROVED' || c.status === 'REJECTED');

  // Filter nach Suchbegriff
  const filterCases = (cases: UnderwritingCase[]) => {
    if (!searchQuery) return cases;
    
    const query = searchQuery.toLowerCase();
    return cases.filter(c => {
      const companyData = c.quote.companyData as any;
      const companyName = (companyData?.companyName || '').toLowerCase();
      const customerName = c.quote.user.name.toLowerCase();
      const quoteNumber = c.quote.quoteNumber.toLowerCase();
      
      return companyName.includes(query) || 
             customerName.includes(query) || 
             quoteNumber.includes(query);
    });
  };

  const displayCases = activeTab === 'open' ? filterCases(openCases) : filterCases(closedCases);

  // Status Badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Offen', class: 'bg-yellow-100 text-yellow-700', icon: Clock };
      case 'IN_REVIEW':
        return { label: 'In Prüfung', class: 'bg-blue-100 text-blue-700', icon: Clock };
      case 'APPROVED':
        return { label: 'Genehmigt', class: 'bg-green-100 text-green-700', icon: CheckCircle };
      case 'REJECTED':
        return { label: 'Abgelehnt', class: 'bg-red-100 text-red-700', icon: XCircle };
      case 'NEEDS_INFO':
        return { label: 'Info benötigt', class: 'bg-blue-100 text-blue-700', icon: AlertCircle };
      default:
        return { label: status, class: 'bg-gray-100 text-gray-700', icon: AlertCircle };
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

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-[#1A1A1A] mb-2">
            Guten Tag {firstName}
          </h1>
          <p className="text-gray-600 text-sm">
            Risikoprüfungen für Cyber-Versicherungen
          </p>
        </div>

        {/* Statistiken */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="text-yellow-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[#1A1A1A]">{openCases.length}</p>
                <p className="text-sm text-gray-600">Offene Fälle</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[#1A1A1A]">
                  {closedCases.filter(c => c.status === 'APPROVED').length}
                </p>
                <p className="text-sm text-gray-600">Genehmigt</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[#1A1A1A]">
                  {closedCases.filter(c => c.status === 'REJECTED').length}
                </p>
                <p className="text-sm text-gray-600">Abgelehnt</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="text-orange-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[#1A1A1A]">
                  {openCases.filter(c => c.quote.riskScore === 'E' || c.quote.riskScore === 'D').length}
                </p>
                <p className="text-sm text-gray-600">Hohe Risiken</p>
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('open')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'open'
                ? 'text-[#0032A0] border-b-2 border-[#0032A0]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Offene Fälle ({openCases.length})
          </button>
          <button
            onClick={() => setActiveTab('closed')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'closed'
                ? 'text-[#0032A0] border-b-2 border-[#0032A0]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Abgeschlossen ({closedCases.length})
          </button>
        </div>

        {/* Liste */}
        <div>
          {displayCases.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-500">
                {searchQuery 
                  ? 'Keine Ergebnisse gefunden' 
                  : activeTab === 'open' 
                    ? 'Keine offenen Risikoprüfungen' 
                    : 'Keine abgeschlossenen Risikoprüfungen'
                }
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
              {displayCases.map((uwCase) => {
                const statusBadge = getStatusBadge(uwCase.status);
                const riskScoreBadge = getRiskScoreBadge(uwCase.quote.riskScore);
                const companyData = uwCase.quote.companyData as any;
                const companyName = companyData?.companyName || 'Unbekannt';
                const createdDate = new Date(uwCase.createdAt).toLocaleDateString('de-CH');
                const customerName = uwCase.quote.user.name;
                const StatusIcon = statusBadge.icon;
                
                return (
                  <Link
                    key={uwCase.id}
                    href={`/risikopruefungen/${uwCase.id}`}
                    className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer block"
                  >
                    <div className="flex items-center gap-6 flex-1">
                      {/* Icon */}
                      <div className={`w-14 h-14 ${statusBadge.class.replace('text-', 'bg-').replace('-700', '-100').replace('-800', '-100')} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <StatusIcon className={statusBadge.class.split(' ')[1]} size={28} />
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-[#0032A0]">
                            {companyName}
                          </h3>
                          {riskScoreBadge && (
                            <span className={`px-3 py-1 text-sm font-bold rounded ${riskScoreBadge.bg} ${riskScoreBadge.text}`}>
                              Score {riskScoreBadge.label}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-8 text-sm text-gray-600">
                          <span>Kunde: {customerName}</span>
                          <span>Offerte #{uwCase.quote.quoteNumber}</span>
                          <span>Erstellt am {createdDate}</span>
                        </div>
                        {uwCase.notes && (
                          <p className="text-sm text-gray-500 mt-2 italic line-clamp-2">{uwCase.notes}</p>
                        )}
                      </div>

                      {/* Status & Action */}
                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-1.5 text-sm font-medium rounded-full ${statusBadge.class}`}>
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
