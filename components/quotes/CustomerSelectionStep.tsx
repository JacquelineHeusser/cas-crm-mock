/**
 * Customer Selection Step
 * Ermöglicht Vermittlern die Auswahl eines Kunden (Versicherungsnehmer)
 */

'use client';

import { useEffect, useState } from 'react';
import { Building2, User, Mail, Search } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  company: {
    id: string;
    name: string;
  } | null;
}

interface CustomerSelectionStepProps {
  onSelect: (customerId: string) => void;
  selectedCustomerId?: string;
  onNext: () => void;
  onPrevious: () => void;
}

export default function CustomerSelectionStep({
  onSelect,
  selectedCustomerId,
  onNext,
  onPrevious,
}: CustomerSelectionStepProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Lade alle Kunden
    fetch('/api/customers')
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading customers:', err);
        setLoading(false);
      });
  }, []);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.company?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContinue = () => {
    if (selectedCustomerId) {
      onNext();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-light text-[#1A1A1A] mb-6">
        Versicherungsnehmer auswählen
      </h2>
      <p className="text-gray-600 mb-8">
        Bitte wählen Sie den Kunden aus, für den Sie diese Offerte erstellen.
      </p>

      {/* Suchfeld */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Suche nach Name, E-Mail oder Firma..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0032A0]"></div>
          <p className="text-gray-600 mt-4">Lade Kunden...</p>
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Keine Kunden gefunden</p>
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
            filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => onSelect(customer.id)}
                className={`w-full text-left p-6 rounded-lg border-2 transition-all ${
                  selectedCustomerId === customer.id
                    ? 'border-[#0032A0] bg-[#D9E8FC]'
                    : 'border-gray-200 hover:border-[#0032A0] bg-white'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      selectedCustomerId === customer.id
                        ? 'bg-[#0032A0]'
                        : 'bg-gray-200'
                    }`}
                  >
                    <User
                      className={selectedCustomerId === customer.id ? 'text-white' : 'text-gray-600'}
                      size={24}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-[#1A1A1A] mb-1">{customer.name}</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={16} />
                        <span>{customer.email}</span>
                      </div>
                      {customer.company && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Building2 size={16} />
                          <span>{customer.company.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedCustomerId === customer.id && (
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-[#0032A0] rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onPrevious}
          className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Zurück
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedCustomerId}
          className={`px-6 py-3 rounded-lg transition-colors ${
            selectedCustomerId
              ? 'bg-[#0032A0] text-white hover:bg-[#002080]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Weiter
        </button>
      </div>
    </div>
  );
}
