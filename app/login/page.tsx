/**
 * Login-Seite
 * Formular für E-Mail/Passwort-Login mit React Hook Form + Zod
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login } from '@/app/actions/auth';
import { useState } from 'react';

// Zod Schema für Login-Formular
const loginSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen lang sein'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold mb-4">
            ZurichOne Login
          </h2>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* E-Mail Feld */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">E-Mail</span>
              </label>
              <input
                type="email"
                placeholder="name@firma.ch"
                className={`input input-bordered ${
                  errors.email ? 'input-error' : ''
                }`}
                {...register('email')}
              />
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.email.message}
                  </span>
                </label>
              )}
            </div>

            {/* Passwort Feld */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Passwort</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className={`input input-bordered ${
                  errors.password ? 'input-error' : ''
                }`}
                {...register('password')}
              />
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.password.message}
                  </span>
                </label>
              )}
            </div>

            {/* Submit Button */}
            <div className="form-control mt-6">
              <button
                type="submit"
                className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Wird eingeloggt...' : 'Einloggen'}
              </button>
            </div>
          </form>

          {/* Test-Accounts Hinweis */}
          <div className="divider">Test-Accounts</div>
          <div className="text-sm text-base-content/70">
            <p className="font-semibold mb-2">Für Tests:</p>
            <ul className="space-y-1">
              <li>• Kunde: kontakt@swisstech.ch</li>
              <li>• Broker: broker@swissquality.ch</li>
              <li>• Underwriter: underwriter@zurich.ch</li>
            </ul>
            <p className="mt-2 text-xs">
              (Passwort muss in Supabase Auth erstellt werden)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
