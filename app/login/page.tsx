/**
 * Login-Seite - Zurich Design
 * Formular für E-Mail/Passwort-Login
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login } from '@/app/actions/auth';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

// Zod Schema für Login-Formular
const loginSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen lang sein'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    const result = await login(data.email, data.password);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
    // Bei Erfolg wird automatisch zu /dashboard redirected
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md px-8">
        {/* Zurich Logo */}
        <div className="flex justify-center mb-12">
          <Image
            src="/zurich-logo.png"
            alt="Zurich"
            width={200}
            height={40}
            priority
          />
        </div>

        {/* Titel */}
        <h1 className="text-2xl font-light text-[#1A1A1A] mb-2 text-center">
          Anmeldung bei Ihrem Konto
        </h1>
        <p className="text-center text-[#0032A0] text-sm mb-8">
          Geben Sie Ihr Passwort ein.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* E-Mail Feld */}
          <div className="relative">
            <input
              type="email"
              placeholder="name@firma.ch"
              className={`w-full px-6 py-4 border-2 rounded-full text-[#0032A0] placeholder:text-gray-400 focus:outline-none focus:border-[#008C95] ${
                errors.email ? 'border-red-500' : 'border-[#008C95]'
              }`}
              {...register('email')}
            />
            <button
              type="button"
              className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] text-sm hover:underline"
            >
              Bearbeiten
            </button>
            {errors.email && (
              <p className="text-red-500 text-xs mt-2 ml-6">{errors.email.message}</p>
            )}
          </div>

          {/* Passwort Feld */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Passwort*"
              className={`w-full px-6 py-4 border-2 rounded-full text-[#0032A0] placeholder:text-gray-400 focus:outline-none focus:border-[#008C95] ${
                errors.password ? 'border-red-500' : 'border-[#008C95]'
              }`}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && (
              <p className="text-red-500 text-xs mt-2 ml-6">{errors.password.message}</p>
            )}
          </div>

          {/* Passwort vergessen */}
          <div className="text-left">
            <a href="#" className="text-[#0032A0] text-sm hover:underline">
              Passwort vergessen?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0032A0] text-white py-4 rounded-full font-medium hover:bg-[#001E5F] transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Wird angemeldet...' : 'Weiter'}
          </button>

          {/* Registrieren Link */}
          <div className="text-center text-sm">
            <span className="text-gray-600">Sie haben noch kein Konto? </span>
            <a href="#" className="text-[#0032A0] hover:underline">
              Registrieren
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
