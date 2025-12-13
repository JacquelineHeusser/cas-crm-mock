/**
 * Custom Hook für Echtzeit-Validierung
 * Integriert Debouncing, Loading States und Caching
 */

import { useState, useEffect, useRef } from 'react';
import { ValidationResult } from '@/lib/validation/realtime-validators';

interface UseRealtimeValidationOptions {
  // Debounce-Zeit in Millisekunden (Standard: 500ms)
  debounceMs?: number;
  // Ob die Validierung bei jedem Keystroke erfolgen soll (onChange) oder nur bei Blur
  validateOnChange?: boolean;
  // Ob die Validierung bei Blur erfolgen soll
  validateOnBlur?: boolean;
  // Zusätzliche Abhängigkeiten für die Validierung (z.B. PLZ für Ort-Validierung)
  dependencies?: any[];
}

interface UseRealtimeValidationReturn {
  // Validierungs-Status
  isValidating: boolean;
  validationResult: ValidationResult | null;
  // Hilfsfunktionen
  validate: (value: string) => Promise<void>;
  reset: () => void;
}

/**
 * Custom Hook für Echtzeit-Validierung mit Debouncing
 * 
 * @param validator - Async Validierungsfunktion
 * @param options - Konfigurationsoptionen
 * 
 * @example
 * const { isValidating, validationResult, validate } = useRealtimeValidation(
 *   validateSwissZip,
 *   { debounceMs: 500, validateOnChange: true }
 * );
 */
export function useRealtimeValidation(
  validator: (value: string, ...deps: any[]) => Promise<ValidationResult>,
  options: UseRealtimeValidationOptions = {}
): UseRealtimeValidationReturn {
  const {
    debounceMs = 500,
    validateOnChange = true,
    validateOnBlur = true,
    dependencies = [],
  } = options;

  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  
  // Cache für bereits validierte Werte
  const cacheRef = useRef<Map<string, ValidationResult>>(new Map());
  
  // Debounce Timer
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // AbortController für laufende Requests
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Validiert einen Wert
   * Nutzt Cache falls vorhanden, sonst führt Validierung durch
   */
  const validate = async (value: string): Promise<void> => {
    // Leere Werte nicht validieren (außer Validator erfordert es)
    if (!value || value.trim().length === 0) {
      setValidationResult(null);
      return;
    }

    // Prüfe Cache (mit Dependencies als Teil des Keys)
    const cacheKey = `${value}:${JSON.stringify(dependencies)}`;
    const cachedResult = cacheRef.current.get(cacheKey);
    
    if (cachedResult) {
      setValidationResult(cachedResult);
      return;
    }

    // Abbruch laufender Validierung
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Neue AbortController erstellen
    abortControllerRef.current = new AbortController();

    setIsValidating(true);

    try {
      // Validierung durchführen
      const result = await validator(value, ...dependencies);
      
      // Ergebnis speichern
      setValidationResult(result);
      
      // In Cache speichern
      cacheRef.current.set(cacheKey, result);
      
      // Cache-Größe limitieren (max 50 Einträge)
      if (cacheRef.current.size > 50) {
        const firstKey = cacheRef.current.keys().next().value;
        if (firstKey !== undefined) {
          cacheRef.current.delete(firstKey);
        }
      }
    } catch (error) {
      // Fehler bei Validierung
      console.error('Validierungsfehler:', error);
      setValidationResult({
        isValid: false,
        message: 'Validierung fehlgeschlagen',
      });
    } finally {
      setIsValidating(false);
      abortControllerRef.current = null;
    }
  };

  /**
   * Validierung mit Debouncing
   */
  const debouncedValidate = async (value: string): Promise<void> => {
    // Clear bestehender Timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Neuer Timer - return Promise
    return new Promise((resolve) => {
      debounceTimerRef.current = setTimeout(async () => {
        await validate(value);
        resolve();
      }, debounceMs);
    });
  };

  /**
   * Setzt Validierungsstatus zurück
   */
  const reset = (): void => {
    setIsValidating(false);
    setValidationResult(null);
    
    // Timer clearen
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Laufende Validierung abbrechen
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Cleanup bei Unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, []);

  return {
    isValidating,
    validationResult,
    validate: validateOnChange ? debouncedValidate : validate,
    reset,
  };
}

/**
 * Vereinfachter Hook für Feld-spezifische Validierung
 * Integriert sich direkt mit React Hook Form
 * 
 * @example
 * const zipValidation = useFieldValidation('zip', validateSwissZip);
 * 
 * <input
 *   {...register('zip')}
 *   onBlur={(e) => zipValidation.validate(e.target.value)}
 * />
 * <ValidationFeedback {...zipValidation} />
 */
export function useFieldValidation(
  fieldName: string,
  validator: (value: string, ...deps: any[]) => Promise<ValidationResult>,
  options: UseRealtimeValidationOptions = {}
) {
  const validation = useRealtimeValidation(validator, options);

  return {
    fieldName,
    ...validation,
  };
}

/**
 * Hook für kombinierte Validierung (z.B. PLZ + Ort)
 * Validiert mehrere Felder die voneinander abhängig sind
 * 
 * @example
 * const { validatePrimary, validateSecondary } = useCombinedValidation(
 *   'zip',
 *   'city',
 *   validateSwissZip,
 *   validateCity
 * );
 */
export function useCombinedValidation(
  primaryFieldName: string,
  secondaryFieldName: string,
  primaryValidator: (value: string) => Promise<ValidationResult>,
  secondaryValidator: (value: string, dependency: string) => Promise<ValidationResult>
) {
  const [primaryValue, setPrimaryValue] = useState('');
  const [secondaryValue, setSecondaryValue] = useState('');

  const primaryValidation = useRealtimeValidation(primaryValidator, {
    validateOnChange: true,
  });

  const secondaryValidation = useRealtimeValidation(secondaryValidator, {
    validateOnChange: true,
    dependencies: [primaryValue],
  });

  const validatePrimary = async (value: string) => {
    setPrimaryValue(value);
    await primaryValidation.validate(value);
    
    // Re-validiere Secondary falls vorhanden
    if (secondaryValue) {
      await secondaryValidation.validate(secondaryValue);
    }
  };

  const validateSecondary = async (value: string) => {
    setSecondaryValue(value);
    await secondaryValidation.validate(value);
  };

  return {
    primary: {
      fieldName: primaryFieldName,
      ...primaryValidation,
      validate: validatePrimary,
    },
    secondary: {
      fieldName: secondaryFieldName,
      ...secondaryValidation,
      validate: validateSecondary,
    },
  };
}
