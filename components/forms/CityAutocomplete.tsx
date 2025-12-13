/**
 * CityAutocomplete Komponente
 * Intelligente Ort-Auswahl mit PLZ-basierter Auto-Complete
 * Zeigt automatisch passende Orte zur eingegebenen PLZ
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { FieldError } from 'react-hook-form';
import { ChevronDown, MapPin } from 'lucide-react';
import { getValidCitiesForZip, searchCities } from '@/lib/data/swiss-zip-codes';
import ValidationFeedback, { ValidationIcon } from './ValidationFeedback';
import { validateCity } from '@/lib/validation/realtime-validators';
import { useRealtimeValidation } from '@/hooks/useRealtimeValidation';

interface CityAutocompleteProps {
  label: string;
  name: string;
  zip?: string;
  value?: string;
  error?: FieldError;
  registerProps?: any;
  onChange?: (value: string) => void;
  optional?: boolean;
}

export default function CityAutocomplete({
  label,
  name,
  zip,
  value = '',
  error,
  registerProps,
  onChange,
  optional = false,
}: CityAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isTouched, setIsTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const validation = useRealtimeValidation(
    (city: string, zipCode?: string) => validateCity(city, zipCode),
    {
      validateOnChange: true,
      debounceMs: 300,
      dependencies: [zip],
    }
  );

  useEffect(() => {
    if (!inputValue || inputValue.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    let citySuggestions: string[] = [];

    if (zip && zip.length === 4) {
      const citiesForZip = getValidCitiesForZip(zip);
      if (citiesForZip.length > 0) {
        citySuggestions = citiesForZip;
      }
    }

    if (citySuggestions.length === 0) {
      const searchResults = searchCities(inputValue, 5);
      citySuggestions = searchResults.map(entry => entry.city);
    }

    citySuggestions = [...new Set(citySuggestions)];
    setSuggestions(citySuggestions);
  }, [inputValue, zip]);

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
    setShowSuggestions(true);
    setSelectedIndex(-1);

    if (isTouched) {
      validation.validate(newValue);
    }

    if (onChange) {
      onChange(newValue);
    }

    if (registerProps?.onChange) {
      registerProps.onChange(e);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);

    validation.validate(suggestion);

    if (onChange) {
      onChange(suggestion);
    }

    if (inputRef.current && registerProps?.onChange) {
      const event = {
        target: { ...inputRef.current, value: suggestion },
      } as React.ChangeEvent<HTMLInputElement>;
      registerProps.onChange(event);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const hasError = error || (validation.validationResult && !validation.validationResult.isValid);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {optional && <span className="ml-1 text-xs text-gray-500">(optional)</span>}
        </label>
      )}

      <div className="relative">
        <div className="relative">
          <input
            id={name}
            ref={inputRef}
            type="text"
            value={inputValue}
            {...registerProps}
            onChange={handleInputChange}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={(e) => {
              setIsTouched(true);
              if (inputValue) validation.validate(inputValue);
              if (registerProps?.onBlur) registerProps.onBlur(e);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ort*"
            autoComplete="off"
            className={`
              w-full px-6 py-4 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] placeholder:text-[#0032A0]/60 pr-12
              focus:outline-none focus:ring-2 focus:ring-[#0032A0]
              transition-colors
              ${hasError ? 'ring-2 ring-red-500' : ''}
            `}
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <ValidationIcon
              isValidating={validation.isValidating}
              validationResult={validation.validationResult}
            />
            {suggestions.length > 0 && <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            {zip && (
              <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b">
                Orte für PLZ {zip}
              </div>
            )}

            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion}-${index}`}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className={`
                  w-full px-4 py-2.5 text-left flex items-center gap-2
                  hover:bg-gray-50 transition-colors
                  ${selectedIndex === index ? 'bg-gray-100' : ''}
                `}
              >
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}

      <ValidationFeedback
        isValidating={validation.isValidating}
        validationResult={validation.validationResult}
        showOnlyWhenTouched={true}
        isTouched={isTouched}
      />
    </div>
  );
}
