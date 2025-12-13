/**
 * Location Selection Step
 * Ermöglicht die Auswahl eines Standorts bei Vermittlern mit mehreren Standorten
 * Zeigt automatisch den Default-Standort des Users als vorausgewählt an
 */

'use client';

import { useEffect, useState } from 'react';
import { MapPin, Building2, Check } from 'lucide-react';

interface BrokerLocation {
  id: string;
  name: string;
  address: string;
  zip: string;
  city: string;
  isDefault: boolean;
}

interface LocationSelectionStepProps {
  brokerId: string;
  onSelect: (locationId: string) => void;
  selectedLocationId?: string;
  onNext: () => void;
  onPrevious: () => void;
}

export default function LocationSelectionStep({
  brokerId,
  onSelect,
  selectedLocationId,
  onNext,
  onPrevious,
}: LocationSelectionStepProps) {
  const [locations, setLocations] = useState<BrokerLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Lade alle Standorte des Brokers
    fetch(`/api/brokers/${brokerId}/locations`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Fehler beim Laden der Standorte');
        }
        return res.json();
      })
      .then((data) => {
        setLocations(data);
        
        // Automatisch den Default-Standort auswählen, falls noch keiner ausgewählt
        if (!selectedLocationId && data.length > 0) {
          const defaultLocation = data.find((loc: BrokerLocation) => loc.isDefault) || data[0];
          onSelect(defaultLocation.id);
        }
        
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading broker locations:', err);
        setError('Standorte konnten nicht geladen werden');
        setLoading(false);
      });
  }, [brokerId, selectedLocationId, onSelect]);

  // Auto-Skip bei nur einem Standort
  useEffect(() => {
    if (!loading && locations.length === 1 && selectedLocationId) {
      onNext();
    }
  }, [loading, locations.length, selectedLocationId, onNext]);

  const handleContinue = () => {
    if (selectedLocationId) {
      onNext();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-light text-[#1A1A1A] mb-6">
        Standort auswählen
      </h2>
      <p className="text-gray-600 mb-8">
        Bitte wählen Sie den Standort für diese Offerte. Ihr Standardstandort ist bereits vorausgewählt.
      </p>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0032A0]"></div>
          <p className="text-gray-600 mt-4">Lade Standorte...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {locations.map((location) => (
            <button
              key={location.id}
              onClick={() => onSelect(location.id)}
              className={`w-full text-left p-6 rounded-lg border-2 transition-all ${
                selectedLocationId === location.id
                  ? 'border-[#0032A0] bg-[#D9E8FC]'
                  : 'border-gray-200 hover:border-[#0032A0] bg-white'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    selectedLocationId === location.id
                      ? 'bg-[#0032A0]'
                      : 'bg-gray-200'
                  }`}
                >
                  <Building2
                    className={selectedLocationId === location.id ? 'text-white' : 'text-gray-600'}
                    size={24}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-[#1A1A1A]">{location.name}</h3>
                    {location.isDefault && (
                      <span className="px-2 py-1 bg-[#0032A0] text-white text-xs rounded-full">
                        Standard
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span>{`${location.address}, ${location.zip} ${location.city}`}</span>
                  </div>
                </div>
                {selectedLocationId === location.id && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-[#0032A0] rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Navigation */}
      {!loading && !error && locations.length > 1 && (
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
            disabled={!selectedLocationId}
            className={`px-6 py-3 rounded-lg transition-colors ${
              selectedLocationId
                ? 'bg-[#0032A0] text-white hover:bg-[#002080]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Weiter
          </button>
        </div>
      )}
    </div>
  );
}
