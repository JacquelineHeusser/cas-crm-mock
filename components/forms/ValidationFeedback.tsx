/**
 * ValidationFeedback Komponente
 * Zeigt visuelles Feedback für Echtzeit-Validierung
 * ⏳ Loading, ✅ Success, ❌ Error, 💡 Suggestions
 */

import { CheckCircle, XCircle, Loader2, Info } from 'lucide-react';
import { ValidationResult } from '@/lib/validation/realtime-validators';

interface ValidationFeedbackProps {
  isValidating?: boolean;
  validationResult?: ValidationResult | null;
  // Optional: Zeige Feedback nur wenn Feld berührt wurde
  showOnlyWhenTouched?: boolean;
  isTouched?: boolean;
}

export default function ValidationFeedback({
  isValidating = false,
  validationResult = null,
  showOnlyWhenTouched = false,
  isTouched = true,
}: ValidationFeedbackProps) {
  // Nichts anzeigen wenn Feld noch nicht berührt und showOnlyWhenTouched aktiv
  if (showOnlyWhenTouched && !isTouched) {
    return null;
  }

  // Nichts anzeigen wenn keine Validierung läuft und kein Ergebnis
  if (!isValidating && !validationResult) {
    return null;
  }

  return (
    <div className="mt-2 space-y-1">
      {/* Loading State */}
      {isValidating && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Wird validiert...</span>
        </div>
      )}

      {/* Validation Result */}
      {!isValidating && validationResult && (
        <>
          {/* Success oder Error Message */}
          <div
            className={`flex items-start gap-2 text-sm ${
              validationResult.isValid
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {validationResult.isValid ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            )}
            <span>{validationResult.message}</span>
          </div>

          {/* Suggestions / Hints */}
          {validationResult.suggestions && validationResult.suggestions.length > 0 && (
            <div className="ml-6 space-y-1">
              {validationResult.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-xs text-gray-600"
                >
                  <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Kompakte Version für Inline-Display (neben Input)
 */
interface ValidationIconProps {
  isValidating?: boolean;
  validationResult?: ValidationResult | null;
}

export function ValidationIcon({
  isValidating = false,
  validationResult = null,
}: ValidationIconProps) {
  if (isValidating) {
    return (
      <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
    );
  }

  if (!validationResult) {
    return null;
  }

  if (validationResult.isValid) {
    return (
      <CheckCircle className="w-5 h-5 text-green-500" />
    );
  }

  return (
    <XCircle className="w-5 h-5 text-red-500" />
  );
}

/**
 * Badge-Version für Summary-Views
 */
interface ValidationBadgeProps {
  isValid?: boolean;
  label?: string;
}

export function ValidationBadge({
  isValid = true,
  label,
}: ValidationBadgeProps) {
  if (isValid) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
        <CheckCircle className="w-3 h-3" />
        {label || 'Gültig'}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
      <XCircle className="w-3 h-3" />
      {label || 'Ungültig'}
    </span>
  );
}
