/**
 * ZipWithCitySuggestions Komponente
 * PLZ-Input mit Dropdown-Vorschlägen für passende Orte
 * Befüllt automatisch das Ort-Feld beim Klick auf Vorschlag
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { FieldError } from 'react-hook-form';
import { MapPin } from 'lucide-react';
import { getValidCitiesForZip } from '@/lib/data/swiss-zip-codes';
import ValidationFeedback, { ValidationIcon } from './ValidationFeedback';
import { validateSwissZip } from '@/lib/validation/realtime-validators';
import { useRealtimeValidation } from '@/hooks/useRealtimeValidation';

interface ZipWithCitySuggestionsProps {
  label?: string;
  name: string;
  value?: string;
  error?: FieldError;
  registerProps?: any;
  onChange?: (value: string) => void;
  onCitySelect?: (city: string) => void;
  className?: string;
  placeholder?: string;
  maxLength?: number;
}

export default function ZipWithCitySuggestions({
  label,
  name,
  value = '',
  error,
  registerProps,
  onChange,
  onCitySelect,
  className = '',
  placeholder = 'PLZ*',
  maxLength = 4,
}: ZipWithCitySuggestionsProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [isTouched, setIsTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Echtzeit-Validierung für PLZ
  const validation = useRealtimeValidation(validateSwissZip, {
    validateOnChange: true,
    debounceMs: 300,
  });

  // Sync inputValue mit externem value
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  // Lade Stadt-Vorschläge basierend auf PLZ
  useEffect(() => {
    if (inputValue && inputValue.length === 4) {
      const cities = getValidCitiesForZip(inputValue);
      setCitySuggestions(cities);
      
      // Zeige Dropdown wenn Städte gefunden wurden
      if (cities.length > 0 && isTouched) {
        setShowSuggestions(true);
      }
    } else {
      setCitySuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, isTouched]);

  // Click outside Handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsTouched(true);

    // Trigger Validierung
    if (newValue) {
      validation.validate(newValue);
    }

    // Callbacks
    if (onChange) {
      onChange(newValue);
    }

    if (registerProps?.onChange) {
      registerProps.onChange(e);
    }
  };

  const handleCitySelect = (city: string) => {
    // Befülle Ort-Feld
    if (onCitySelect) {
      onCitySelect(city);
    }
    
    // Schliesse Dropdown
    setShowSuggestions(false);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsTouched(true);

    // Validierung bei Blur
    if (inputValue) {
      validation.validate(inputValue);
    }

    // React Hook Form
    if (registerProps?.onBlur) {
      registerProps.onBlur(e);
    }
  };

  const hasError = error || (validation.validationResult && !validation.validationResult.isValid);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        {/* PLZ Input */}
        <div className="relative">
          <input
            id={name}
            ref={inputRef}
            type="text"
            value={inputValue}
            maxLength={maxLength}
            placeholder={placeholder}
            {...registerProps}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onFocus={() => {
              if (citySuggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            autoComplete="off"
            className={`
              ${className}
              ${hasError ? 'ring-2 ring-red-500' : ''}
            `}
          />

          {/* Validation Icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <ValidationIcon
              isValidating={validation.isValidating}
              validationResult={validation.validationResult}
            />
          </div>
        </div>

        {/* Dropdown mit Stadt-Vorschlägen */}
        {showSuggestions && citySuggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b">
              Orte für PLZ {inputValue}
            </div>

            {citySuggestions.map((city, index) => (
              <button
                key={`${city}-${index}`}
                type="button"
                onClick={() => handleCitySelect(city)}
                className="
                  w-full px-4 py-2.5 text-left flex items-center gap-2
                  hover:bg-gray-50 transition-colors
                  text-[#0032A0]
                "
              >
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{city}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fehler - nur bei React Hook Form Fehlern oder ungültiger PLZ */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
      
      {!error && validation.validationResult && !validation.validationResult.isValid && (
        <p className="mt-1 text-sm text-red-600">{validation.validationResult.message}</p>
      )}
    </div>
  );
}
