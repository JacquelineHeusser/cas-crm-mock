/**
 * ValidatedInput Komponente
 * Input-Wrapper mit integrierter Echtzeit-Validierung
 * Unterstützt verschiedene Input-Typen und zeigt Validierungs-Feedback
 */

'use client';

import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { FieldError } from 'react-hook-form';
import ValidationFeedback, { ValidationIcon } from './ValidationFeedback';
import { ValidationResult } from '@/lib/validation/realtime-validators';
import { useRealtimeValidation } from '@/hooks/useRealtimeValidation';

interface ValidatedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  name: string;
  error?: FieldError;
  // Validierungs-Funktion (optional)
  validator?: (value: string, ...deps: any[]) => Promise<ValidationResult>;
  // Abhängigkeiten für Validierung (z.B. PLZ für Ort)
  validationDependencies?: any[];
  // React Hook Form register
  registerProps?: any;
  // Custom onChange Handler
  onChange?: (value: string) => void;
  // Zeige Icon im Input
  showValidationIcon?: boolean;
  // Optionales Feld
  optional?: boolean;
  // Hilfetext
  helperText?: string;
}

const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(
  (
    {
      label,
      name,
      error,
      validator,
      validationDependencies = [],
      registerProps,
      onChange,
      showValidationIcon = true,
      optional = false,
      helperText,
      className = '',
      ...inputProps
    },
    ref
  ) => {
    const [isTouched, setIsTouched] = useState(false);
    const [currentValue, setCurrentValue] = useState('');

    // Echtzeit-Validierung Hook (nur wenn Validator angegeben)
    const realtimeValidation = validator
      ? useRealtimeValidation(validator, {
          validateOnChange: true,
          debounceMs: 500,
          dependencies: validationDependencies,
        })
      : null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setCurrentValue(value);

      // Trigger Echtzeit-Validierung
      if (realtimeValidation && isTouched) {
        realtimeValidation.validate(value);
      }

      // Custom onChange
      if (onChange) {
        onChange(value);
      }

      // React Hook Form onChange
      if (registerProps?.onChange) {
        registerProps.onChange(e);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsTouched(true);

      // Trigger Validierung bei Blur
      if (realtimeValidation && currentValue) {
        realtimeValidation.validate(currentValue);
      }

      // React Hook Form onBlur
      if (registerProps?.onBlur) {
        registerProps.onBlur(e);
      }
    };

    // Prüfe ob Fehler vorliegt (React Hook Form Error oder Validierungs-Error)
    const hasError = error || (realtimeValidation?.validationResult && !realtimeValidation.validationResult.isValid);

    return (
      <div className="w-full">
        {/* Label */}
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {optional && (
            <span className="ml-1 text-xs text-gray-500">(optional)</span>
          )}
        </label>

        {/* Input mit Icon */}
        <div className="relative">
          <input
            id={name}
            ref={ref}
            {...inputProps}
            {...registerProps}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`
              w-full px-4 py-2.5 border-2 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-[#008C95] focus:border-transparent
              transition-colors
              ${hasError ? 'border-red-500' : 'border-gray-300'}
              ${showValidationIcon && realtimeValidation ? 'pr-12' : ''}
              ${className}
            `}
          />

          {/* Validation Icon im Input */}
          {showValidationIcon && realtimeValidation && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <ValidationIcon
                isValidating={realtimeValidation.isValidating}
                validationResult={realtimeValidation.validationResult}
              />
            </div>
          )}
        </div>

        {/* Hilfetext */}
        {helperText && !error && !realtimeValidation?.validationResult && (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        )}

        {/* React Hook Form Error */}
        {error && (
          <p className="mt-1 text-sm text-red-600">{error.message}</p>
        )}

        {/* Echtzeit-Validierungs-Feedback */}
        {realtimeValidation && (
          <ValidationFeedback
            isValidating={realtimeValidation.isValidating}
            validationResult={realtimeValidation.validationResult}
            showOnlyWhenTouched={true}
            isTouched={isTouched}
          />
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = 'ValidatedInput';

export default ValidatedInput;

/**
 * Textarea-Variante
 */
interface ValidatedTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label: string;
  name: string;
  error?: FieldError;
  registerProps?: any;
  onChange?: (value: string) => void;
  optional?: boolean;
  helperText?: string;
  rows?: number;
}

export const ValidatedTextarea = forwardRef<HTMLTextAreaElement, ValidatedTextareaProps>(
  (
    {
      label,
      name,
      error,
      registerProps,
      onChange,
      optional = false,
      helperText,
      rows = 4,
      className = '',
      ...textareaProps
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;

      if (onChange) {
        onChange(value);
      }

      if (registerProps?.onChange) {
        registerProps.onChange(e);
      }
    };

    return (
      <div className="w-full">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {optional && (
            <span className="ml-1 text-xs text-gray-500">(optional)</span>
          )}
        </label>

        <textarea
          id={name}
          ref={ref}
          rows={rows}
          {...textareaProps}
          {...registerProps}
          onChange={handleChange}
          className={`
            w-full px-4 py-2.5 border-2 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-[#008C95] focus:border-transparent
            transition-colors resize-none
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${className}
          `}
        />

        {helperText && !error && (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        )}

        {error && (
          <p className="mt-1 text-sm text-red-600">{error.message}</p>
        )}
      </div>
    );
  }
);

ValidatedTextarea.displayName = 'ValidatedTextarea';
