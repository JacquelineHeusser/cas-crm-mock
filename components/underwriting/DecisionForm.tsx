/**
 * Underwriting Decision Form
 * Formular für Vermittler zur Entscheidung über Risikoprüfungen
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, AlertCircle } from 'lucide-react';

interface DecisionFormProps {
  underwritingCaseId: string;
  quoteId: string;
  currentStatus: string;
}

export default function UnderwritingDecisionForm({ 
  underwritingCaseId, 
  quoteId,
  currentStatus 
}: DecisionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | 'MORE_INFO_REQUIRED' | null>(null);
  const [notes, setNotes] = useState('');
  const [adjustedPremium, setAdjustedPremium] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!decision) {
      alert('Bitte treffen Sie eine Entscheidung');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/underwriting/decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          underwritingCaseId,
          quoteId,
          decision,
          notes,
          adjustedPremium: adjustedPremium ? parseFloat(adjustedPremium) * 100 : null, // CHF zu Rappen
        }),
      });

      if (response.ok) {
        router.push('/risikopruefungen');
        router.refresh();
      } else {
        alert('Fehler beim Speichern der Entscheidung');
      }
    } catch (error) {
      console.error('Error submitting decision:', error);
      alert('Fehler beim Speichern der Entscheidung');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Falls bereits entschieden wurde
  if (currentStatus !== 'PENDING') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-[#0032A0] mb-4">
          Entscheidung bereits getroffen
        </h2>
        <p className="text-gray-600">
          Dieser Fall wurde bereits bearbeitet (Status: {currentStatus})
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-[#0032A0] mb-6 border-b border-gray-200 pb-2">
        Entscheidung treffen
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Entscheidungs-Buttons */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-3">
            Ihre Entscheidung *
          </label>
          <div className="grid grid-cols-3 gap-4">
            {/* Genehmigen */}
            <button
              type="button"
              onClick={() => setDecision('APPROVED')}
              className={`p-4 rounded-lg border-2 transition-all ${
                decision === 'APPROVED'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  decision === 'APPROVED' ? 'bg-green-500' : 'bg-gray-200'
                }`}>
                  <Check className="text-white" size={24} />
                </div>
                <span className={`font-medium ${
                  decision === 'APPROVED' ? 'text-green-700' : 'text-gray-700'
                }`}>
                  Genehmigen
                </span>
              </div>
            </button>

            {/* Weitere Informationen */}
            <button
              type="button"
              onClick={() => setDecision('MORE_INFO_REQUIRED')}
              className={`p-4 rounded-lg border-2 transition-all ${
                decision === 'MORE_INFO_REQUIRED'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  decision === 'MORE_INFO_REQUIRED' ? 'bg-blue-500' : 'bg-gray-200'
                }`}>
                  <AlertCircle className="text-white" size={24} />
                </div>
                <span className={`font-medium ${
                  decision === 'MORE_INFO_REQUIRED' ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  Info benötigt
                </span>
              </div>
            </button>

            {/* Ablehnen */}
            <button
              type="button"
              onClick={() => setDecision('REJECTED')}
              className={`p-4 rounded-lg border-2 transition-all ${
                decision === 'REJECTED'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  decision === 'REJECTED' ? 'bg-red-500' : 'bg-gray-200'
                }`}>
                  <X className="text-white" size={24} />
                </div>
                <span className={`font-medium ${
                  decision === 'REJECTED' ? 'text-red-700' : 'text-gray-700'
                }`}>
                  Ablehnen
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Angepasste Prämie (nur bei Genehmigung) */}
        {decision === 'APPROVED' && (
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
              Angepasste Jahresprämie (optional)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">CHF</span>
              <input
                type="number"
                step="0.01"
                value={adjustedPremium}
                onChange={(e) => setAdjustedPremium(e.target.value)}
                className="input input-bordered flex-1"
                placeholder="z.B. 2500.00"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Lassen Sie dieses Feld leer, um die Standardprämie zu verwenden
            </p>
          </div>
        )}

        {/* Notizen */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
            Notizen / Begründung *
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            required
            rows={4}
            className="textarea textarea-bordered w-full"
            placeholder={
              decision === 'APPROVED' 
                ? 'Begründung für die Genehmigung...'
                : decision === 'REJECTED'
                ? 'Begründung für die Ablehnung...'
                : decision === 'MORE_INFO_REQUIRED'
                ? 'Welche zusätzlichen Informationen werden benötigt?'
                : 'Ihre Notizen und Begründung...'
            }
          />
        </div>

        {/* Aktionsbuttons */}
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-ghost"
            disabled={isSubmitting}
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={!decision || !notes || isSubmitting}
            className={`btn flex-1 ${
              decision === 'APPROVED'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : decision === 'REJECTED'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : decision === 'MORE_INFO_REQUIRED'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'btn-disabled'
            }`}
          >
            {isSubmitting ? 'Wird gespeichert...' : 'Entscheidung speichern'}
          </button>
        </div>
      </form>
    </div>
  );
}
