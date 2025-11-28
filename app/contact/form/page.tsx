/**
 * Kontaktformular
 * Schriftliche Anfragen an Zurich
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

const contactFormSchema = z.object({
  name: z.string().min(1, 'Pflichtfeld'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Pflichtfeld'),
  message: z.string().min(10, 'Nachricht muss mindestens 10 Zeichen lang sein'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ContactFormPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    // TODO: Server Action zum Senden
    console.log('Kontaktformular:', data);
    
    // Simuliere Absenden
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    reset();
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-[#CADB2D] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#0032A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-light text-[#0032A0] mb-4">
            Vielen Dank für Ihre Nachricht!
          </h2>
          <p className="text-gray-700 mb-8">
            Wir haben Ihre Anfrage erhalten und werden uns innerhalb von 24 Stunden bei Ihnen melden.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-[#0032A0] hover:gap-3 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Zurück zur Kontaktseite
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Back Link */}
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 text-[#0032A0] hover:gap-3 transition-all mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Zurück
        </Link>

        {/* Header */}
        <h1 className="text-4xl font-light text-[#0032A0] mb-4">
          Schreiben Sie uns
        </h1>
        <p className="text-gray-700 mb-8">
          Füllen Sie das Formular aus und wir melden uns innerhalb von 24 Stunden bei Ihnen.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0032A0] focus:border-transparent"
              placeholder="Ihr Name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-Mail *
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0032A0] focus:border-transparent"
              placeholder="ihre.email@beispiel.ch"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Telefon (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon (optional)
            </label>
            <input
              type="tel"
              {...register('phone')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0032A0] focus:border-transparent"
              placeholder="+41 44 123 45 67"
            />
          </div>

          {/* Betreff */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Betreff *
            </label>
            <select
              {...register('subject')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0032A0] focus:border-transparent"
            >
              <option value="">Bitte wählen</option>
              <option value="quote">Frage zu Offerte</option>
              <option value="policy">Frage zu Police</option>
              <option value="claim">Frage zu Schadenfall</option>
              <option value="general">Allgemeine Anfrage</option>
              <option value="other">Sonstiges</option>
            </select>
            {errors.subject && (
              <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
            )}
          </div>

          {/* Nachricht */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ihre Nachricht *
            </label>
            <textarea
              {...register('message')}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0032A0] focus:border-transparent resize-none"
              placeholder="Beschreiben Sie Ihr Anliegen..."
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0032A0] text-white rounded-full hover:bg-[#0032A0]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Wird gesendet...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Nachricht senden
                </>
              )}
            </button>
          </div>

          <p className="text-sm text-gray-600">
            * Pflichtfelder
          </p>
        </form>
      </div>
    </div>
  );
}
