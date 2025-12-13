/**
 * Location Selection Step
 * Ermöglicht die Auswahl eines Standorts bei Vermittlern mit mehreren Standorten
 * Zeigt automatisch den Default-Standort des Users als vorausgewählt an
 */

'use client';

import { useEffect, useState } from 'react';
import { MapPin, Building2, Check, Plus, X, Loader2 } from 'lucide-react';

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
  
  // State für Inline-Formular "Neuer Standort"
  const [showNewLocationForm, setShowNewLocationForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    zip: '',
    city: '',
  });

  // Funktion zum Laden der Standorte
  const loadLocations = async () => {
    try {
      const res = await fetch(`/api/brokers/${brokerId}/locations`);
      if (!res.ok) throw new Error('Fehler beim Laden der Standorte');
      const data = await res.json();
      setLocations(data);
      return data;
    } catch (err) {
      console.error('Error loading broker locations:', err);
      setError('Standorte konnten nicht geladen werden');
      return [];
    }
  };

  // Neuen Standort speichern
  const handleSaveNewLocation = async () => {
    if (!newLocation.name || !newLocation.address || !newLocation.zip || !newLocation.city) {
      setFormError('Bitte füllen Sie alle Felder aus');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const res = await fetch(`/api/brokers/${brokerId}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLocation),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Fehler beim Speichern');
      }

      const createdLocation = await res.json();
      
      // Standorte neu laden und neuen Standort auswählen
      await loadLocations();
      onSelect(createdLocation.id);
      
      // Formular zurücksetzen und schliessen
      setNewLocation({ name: '', address: '', zip: '', city: '' });
      setShowNewLocationForm(false);
    } catch (err: any) {
      setFormError(err.message || 'Fehler beim Speichern des Standorts');
    } finally {
      setSaving(false);
    }
  };

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
      ) : locations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MapPin className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600">Momentan sind keine Standorte für diesen Vermittler vorhanden.</p>
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

      {/* Neuer Standort Bereich */}
      {!loading && !error && (
        <div className="mb-6">
          {!showNewLocationForm ? (
            <button
              type="button"
              onClick={() => setShowNewLocationForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-[#0032A0] hover:text-[#0032A0] transition-colors"
            >
              <Plus size={18} />
              Neuer Standort erfassen
            </button>
          ) : (
            <div className="p-6 bg-gray-50 rounded-lg border-2 border-[#0032A0]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-[#1A1A1A]">Neuer Standort erfassen</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewLocationForm(false);
                    setFormError(null);
                    setNewLocation({ name: '', address: '', zip: '', city: '' });
                  }}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded"
                >
                  <X size={20} />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Standortname *
                  </label>
                  <input
                    type="text"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                    placeholder="z.B. Zürich Hauptsitz"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    value={newLocation.address}
                    onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                    placeholder="z.B. Bahnhofstrasse 1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PLZ *
                  </label>
                  <input
                    type="text"
                    value={newLocation.zip}
                    onChange={(e) => setNewLocation({ ...newLocation, zip: e.target.value })}
                    placeholder="z.B. 8001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ort *
                  </label>
                  <input
                    type="text"
                    value={newLocation.city}
                    onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                    placeholder="z.B. Zürich"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewLocationForm(false);
                    setFormError(null);
                    setNewLocation({ name: '', address: '', zip: '', city: '' });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={handleSaveNewLocation}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0032A0] text-white rounded-lg hover:bg-[#002080] transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Speichern...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Standort speichern
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation - immer sichtbar */}
      {!loading && !error && (
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onPrevious}
            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Zurück
          </button>
          {locations.length > 0 && (
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
          )}
        </div>
      )}
    </div>
  );
}
