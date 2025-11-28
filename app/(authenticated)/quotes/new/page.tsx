/**
 * Neue Cyber-Offerte erstellen
 * Mehrstufiger Wizard mit React Hook Form + Zod
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { saveQuoteStep, getUserId } from '@/app/actions/quote';
import { 
  companyDataSchema, 
  cyberRiskProfileSchema,
  cyberSecuritySchema,
  coverageSchema,
  summarySchema,
  confirmationSchema,
  INDUSTRIES,
  type CompanyData,
  type CyberRiskProfile,
  type CyberSecurity,
  type Coverage,
} from '@/lib/validation/quote-schema';
import { premiumSchema, PACKAGES } from '@/lib/validation/premium-schema';

// Formular-Schritte
const STEPS = [
  { id: 1, title: 'Unternehmensdaten', schema: companyDataSchema },
  { id: 2, title: 'Cyber Risikoprofil', schema: cyberRiskProfileSchema },
  { id: 3, title: 'Cyber-Sicherheit', schema: cyberSecuritySchema },
  { id: 4, title: 'Prämie', schema: premiumSchema },
  { id: 5, title: 'Versicherte Leistungen', schema: coverageSchema },
  { id: 6, title: 'Zusammenfassung', schema: summarySchema },
  { id: 7, title: 'Bestätigung', schema: confirmationSchema },
];

export default function NewQuotePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [quoteId, setQuoteId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Aktuelles Schema basierend auf Step
  const currentSchema = STEPS[currentStep - 1].schema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: formData,
  });

  // Beim Mounting: Prüfe ob User eingeloggt ist
  useEffect(() => {
    const checkAuth = async () => {
      // Hole User ID aus Session (Server Action)
      const { success, userId } = await getUserId();
      
      if (!success || !userId) {
        // Nicht eingeloggt - redirect zu Login
        window.location.href = '/login';
        return;
      }
      
      // User ist eingeloggt - starte mit leerer Offerte
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Nächster Schritt
  const onNext = async (data: any) => {
    const updatedFormData = { ...formData, ...data };
    setFormData(updatedFormData);
    
    // Speichere aktuellen Step in Datenbank
    const stepMapping: Record<number, 'companyData' | 'cyberRiskProfile' | 'cyberSecurity' | 'coverage'> = {
      1: 'companyData',
      2: 'cyberRiskProfile',
      3: 'cyberSecurity',
      4: 'coverage',
    };
    
    const stepName = stepMapping[currentStep];
    
    if (stepName) {
      // Hole User ID aus Session (Server Action)
      const { success, userId } = await getUserId();
      
      if (!success || !userId) {
        window.location.href = '/login';
        return;
      }
      
      const result = await saveQuoteStep({
        quoteId,
        userId,
        step: stepName,
        stepData: data,
      });
      
      if (result.success && result.quoteId) {
        setQuoteId(result.quoteId);
      }
    }
    
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      reset();
    } else {
      // Letzter Schritt: Offerte finalisieren
      console.log('Offerte abgeschlossen:', quoteId);
      // TODO: Redirect zu Bestätigungsseite
    }
  };

  // Vorheriger Schritt
  const onBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Lade Daten für vorherigen Step
      reset(formData);
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[#0032A0]">Lade Offertdaten...</div>
      </div>
    );
  }

  // Berechne Fortschritt (startet bei 0%)
  const progress = Math.round(((currentStep - 1) / STEPS.length) * 100);

  return (
    <div className="flex flex-1 bg-white">
      {/* Linke Sidebar - Progress */}
      <div className="w-64 bg-[#F5F5F5] p-6">
        <h2 className="text-[#0032A0] text-lg font-light mb-6">
          Prämie berechnen
        </h2>

        {/* Progress Circle */}
        <div className="mb-8">
          <div className="relative w-20 h-20">
            <svg className="transform -rotate-90 w-20 h-20">
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="#E5E5E5"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="#0032A0"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 36}`}
                strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[#0032A0] font-semibold">{progress}%</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`
                py-2 px-3 rounded text-sm
                ${currentStep === step.id 
                  ? 'text-[#0032A0] font-medium bg-white/50' 
                  : 'text-gray-600'
                }
              `}
            >
              {step.title}
            </div>
          ))}
        </nav>
      </div>

      {/* Rechte Seite - Formular */}
      <div className="flex-1 p-12">
        <form onSubmit={handleSubmit(onNext)}>
          {/* Dynamischer Content */}
          {currentStep === 1 && <Step1CompanyData register={register} errors={errors} />}
          {currentStep === 2 && <Step2CyberRiskProfile register={register} errors={errors} />}
          {currentStep === 3 && <Step3CyberSecurity register={register} errors={errors} />}
          {currentStep === 4 && <Step4Premium register={register} errors={errors} formData={formData} />}
          {currentStep === 5 && <Step5Coverage register={register} errors={errors} />}
          {currentStep === 6 && <Step6Summary formData={formData} />}
          {currentStep === 7 && <Step7Confirmation register={register} errors={errors} />}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-12">
            {/* Zurück Button - nur ab Step 2 */}
            {currentStep > 1 && (
              <button
                type="button"
                onClick={onBack}
                className="btn btn-ghost text-[#0032A0] hover:bg-[#0032A0]/10 gap-2"
              >
                <ChevronLeft size={18} />
                Zurück
              </button>
            )}

            {/* Platzhalter wenn kein Zurück Button */}
            {currentStep === 1 && <div></div>}

            {/* Weiter Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn bg-[#008C95] text-white hover:bg-[#006B73] rounded-full px-8 gap-2"
            >
              {currentStep === STEPS.length ? 'Offerte absenden' : 'Weiter'}
              <ChevronRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper: Label + Input Komponente
function QuestionField({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[#0032A0] text-sm font-normal mb-3">
        {question}
      </label>
      {children}
    </div>
  );
}

// Step 1: Unternehmensdaten
function Step1CompanyData({ register, errors }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-light text-[#1A1A1A] mb-8">Unternehmensdaten</h2>
      
      <QuestionField question="Versicherungsnehmer">
        <input
          type="text"
          placeholder="Versicherungsnehmer*"
          className="w-full px-6 py-4 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] placeholder:text-[#0032A0]/60 focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
          {...register('companyName')}
        />
        {errors.companyName && (
          <p className="text-red-600 text-xs mt-2 ml-6">{errors.companyName.message}</p>
        )}
      </QuestionField>

      <QuestionField question="Adresse">
        <input
          type="text"
          placeholder="Adresse*"
          className="w-full px-6 py-4 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] placeholder:text-[#0032A0]/60 focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
          {...register('address')}
        />
        {errors.address && (
          <p className="text-red-600 text-xs mt-2 ml-6">{errors.address.message}</p>
        )}
      </QuestionField>

      <QuestionField question="PLZ, Ort">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="PLZ*"
              className="w-full px-6 py-4 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] placeholder:text-[#0032A0]/60 focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
              {...register('zip')}
            />
            {errors.zip && (
              <p className="text-red-600 text-xs mt-2 ml-6">{errors.zip.message}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              placeholder="Ort*"
              className="w-full px-6 py-4 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] placeholder:text-[#0032A0]/60 focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
              {...register('city')}
            />
            {errors.city && (
              <p className="text-red-600 text-xs mt-2 ml-6">{errors.city.message}</p>
            )}
          </div>
        </div>
      </QuestionField>

      <QuestionField question="Land">
        <input
          type="text"
          defaultValue="Schweiz"
          className="w-full px-6 py-4 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
          {...register('country')}
          readOnly
        />
      </QuestionField>

      <QuestionField question="URL">
        <input
          type="text"
          placeholder="www.beispiel.ch"
          className="w-full px-6 py-4 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] placeholder:text-[#0032A0]/60 focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
          {...register('url')}
        />
      </QuestionField>
    </div>
  );
}

// Step 2: Cyber Risikoprofil  
function Step2CyberRiskProfile({ register, errors }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-light text-[#1A1A1A] mb-8">Cyber Risikoprofil</h2>
      
      <QuestionField question="Welche dieser Kategorien beschreibt die Geschäftstätigkeit Ihrer Firma am ehesten?">
        <div className="relative">
          <select
            className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
            {...register('industry')}
            defaultValue=""
          >
            <option value="" disabled className="text-[#0032A0]/60">Branche wählen*</option>
            {INDUSTRIES.map((industry) => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
          <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
          {errors.industry && <p className="text-red-600 text-xs mt-2 ml-6">{errors.industry.message}</p>}
        </div>
      </QuestionField>

      <QuestionField question="Ihre Firma hat keine Tochtergesellschaften im Ausland und gehört zu keiner ausländischen Unternehmensgruppe.">
        <div className="relative">
          <select
            className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
            {...register('noForeignSubsidiaries')}
            defaultValue=""
          >
            <option value="" disabled className="text-[#0032A0]/60">Auswählen*</option>
            <option value="Trifft zu">Trifft zu</option>
            <option value="Trifft nicht zu">Trifft nicht zu</option>
          </select>
          <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
          {errors.noForeignSubsidiaries && <p className="text-red-600 text-xs mt-2 ml-6">{errors.noForeignSubsidiaries.message}</p>}
        </div>
      </QuestionField>

      <QuestionField question="Für die betreffenden Risiken wurde in den letzten 3 Jahren kein Versicherungsantrag abgelehnt.">
        <div className="relative">
          <select
            className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
            {...register('noRejectedInsurance')}
            defaultValue=""
          >
            <option value="" disabled className="text-[#0032A0]/60">Auswählen*</option>
            <option value="Trifft zu">Trifft zu</option>
            <option value="Trifft nicht zu">Trifft nicht zu</option>
          </select>
          <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
          {errors.noRejectedInsurance && <p className="text-red-600 text-xs mt-2 ml-6">{errors.noRejectedInsurance.message}</p>}
        </div>
      </QuestionField>

      <QuestionField question="Anzahl Mitarbeitende">
        <input
          type="number"
          placeholder="Anzahl Mitarbeitende*"
          className="w-full px-6 py-4 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] placeholder:text-[#0032A0]/60 focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
          {...register('employees', { valueAsNumber: true })}
        />
        {errors.employees && <p className="text-red-600 text-xs mt-2 ml-6">{errors.employees.message}</p>}
      </QuestionField>

      <QuestionField question="Brutto-Gesamtumsatz im vergangenen Geschäftsjahr">
        <input
          type="number"
          placeholder="Umsatz in CHF*"
          className="w-full px-6 py-4 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] placeholder:text-[#0032A0]/60 focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
          {...register('revenue', { valueAsNumber: true })}
        />
        {errors.revenue && <p className="text-red-600 text-xs mt-2 ml-6">{errors.revenue.message}</p>}
      </QuestionField>

      <QuestionField question="Wie viel Prozent des Gesamtumsatzes wurden durch E-Commerce erwirtschaftet?">
        <div className="relative">
          <select
            className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
            {...register('eCommercePercentage')}
            defaultValue=""
          >
            <option value="" disabled className="text-[#0032A0]/60">Auswählen*</option>
            <option value="0%">0%</option>
            <option value="1 - 25%">1 - 25%</option>
            <option value="26 - 50%">26 - 50%</option>
            <option value="Mehr als 50%">Mehr als 50%</option>
          </select>
          <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
          {errors.eCommercePercentage && <p className="text-red-600 text-xs mt-2 ml-6">{errors.eCommercePercentage.message}</p>}
        </div>
      </QuestionField>

      <QuestionField question="Wie viel Prozent des Gesamtumsatzes wurden ausserhalb der Schweiz und dem Fürstentum Liechtenstein erwirtschaftet?">
        <div className="relative">
          <select
            className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
            {...register('foreignRevenuePercentage')}
            defaultValue=""
          >
            <option value="" disabled className="text-[#0032A0]/60">Auswählen*</option>
            <option value="0%">0%</option>
            <option value="1 - 25%">1 - 25%</option>
            <option value="26 - 50%">26 - 50%</option>
            <option value="Mehr als 50%">Mehr als 50%</option>
          </select>
          <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
          {errors.foreignRevenuePercentage && <p className="text-red-600 text-xs mt-2 ml-6">{errors.foreignRevenuePercentage.message}</p>}
        </div>
      </QuestionField>
    </div>
  );
}

// Step 3: Cyber-Sicherheit (erste Basisfelder - kann erweitert werden)
function Step3CyberSecurity({ register, errors }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-light text-[#1A1A1A] mb-8">Cyber-Sicherheit</h2>
      
      <QuestionField question="Gab es in den letzten 3 Jahren Cybervorfälle oder -angriffe, durch die Informationen verloren gingen oder gestohlen wurden?">
        <div className="relative">
          <select
            className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
            {...register('hadCyberIncidents')}
            defaultValue=""
          >
            <option value="" disabled className="text-[#0032A0]/60">Auswählen*</option>
            <option value="Nein">Nein</option>
            <option value="Ja">Ja</option>
          </select>
          <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
          {errors.hadCyberIncidents && <p className="text-red-600 text-xs mt-2 ml-6">{errors.hadCyberIncidents.message}</p>}
        </div>
      </QuestionField>

      <QuestionField question="Wie viele Personen- und Kundendaten bearbeitet Ihre Firma?">
        <div className="relative">
          <select
            className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
            {...register('personalDataCount')}
            defaultValue=""
          >
            <option value="" disabled className="text-[#0032A0]/60">Auswählen*</option>
            <option value="Keine">Keine</option>
            <option value="Bis 1'000">Bis 1'000</option>
            <option value="Bis 10'000">Bis 10'000</option>
            <option value="Bis 100'000">Bis 100'000</option>
            <option value="Bis 1'000'000">Bis 1'000'000</option>
            <option value="Mehr als 1'000'000">Mehr als 1'000'000</option>
          </select>
          <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
          {errors.personalDataCount && <p className="text-red-600 text-xs mt-2 ml-6">{errors.personalDataCount.message}</p>}
        </div>
      </QuestionField>

      <QuestionField question="Wie viele Medizinal- und Gesundheitsdaten bearbeitet Ihre Firma?">
        <div className="relative">
          <select
            className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
            {...register('medicalDataCount')}
            defaultValue=""
          >
            <option value="" disabled className="text-[#0032A0]/60">Auswählen*</option>
            <option value="Keine">Keine</option>
            <option value="Nur von Mitarbeitenden">Nur von Mitarbeitenden</option>
            <option value="Bis 10'000">Bis 10'000</option>
            <option value="Bis 100'000">Bis 100'000</option>
            <option value="Bis 1'000'000">Bis 1'000'000</option>
            <option value="Mehr als 1'000'000">Mehr als 1'000'000</option>
          </select>
          <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
          {errors.medicalDataCount && <p className="text-red-600 text-xs mt-2 ml-6">{errors.medicalDataCount.message}</p>}
        </div>
      </QuestionField>

      <QuestionField question="Wie viele Kreditkartendaten bearbeitet Ihre Firma?">
        <div className="relative">
          <select
            className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
            {...register('creditCardDataCount')}
            defaultValue=""
          >
            <option value="" disabled className="text-[#0032A0]/60">Auswählen*</option>
            <option value="Keine oder durch einen externen Dienstleister verarbeitet">Keine oder durch einen externen Dienstleister verarbeitet</option>
            <option value="Nur von Mitarbeitenden">Nur von Mitarbeitenden</option>
            <option value="Bis 10'000">Bis 10'000</option>
            <option value="Bis 100'000">Bis 100'000</option>
            <option value="Bis 1'000'000">Bis 1'000'000</option>
            <option value="Mehr als 1'000'000">Mehr als 1'000'000</option>
          </select>
          <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
          {errors.creditCardDataCount && <p className="text-red-600 text-xs mt-2 ml-6">{errors.creditCardDataCount.message}</p>}
        </div>
      </QuestionField>

      <QuestionField question="Arbeiten Sie noch mit älteren Systemen, für die keine Sicherheits-Updates mehr bereitgestellt werden (z.B. Windows 10)?">
        <div className="relative">
          <select
            className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
            {...register('hasEndOfLifeSystems')}
            defaultValue=""
          >
            <option value="" disabled className="text-[#0032A0]/60">Auswählen*</option>
            <option value="Nein">Nein</option>
            <option value="Ja">Ja</option>
          </select>
          <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
          {errors.hasEndOfLifeSystems && <p className="text-red-600 text-xs mt-2 ml-6">{errors.hasEndOfLifeSystems.message}</p>}
        </div>
      </QuestionField>
    </div>
  );
}

// Step 5: Versicherte Leistungen
function Step5Coverage({ register, errors }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-light text-[#1A1A1A] mb-8">Versicherte Leistungen</h2>
      
      <QuestionField question="Versicherte Deckungen">
        <div className="relative">
          <select
            className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
            {...register('package')}
            defaultValue=""
          >
            <option value="" disabled className="text-[#0032A0]/60">Paket wählen*</option>
            <option value="BASIC">BASIC Paket</option>
            <option value="OPTIMUM">OPTIMUM Paket</option>
            <option value="PREMIUM">PREMIUM Paket</option>
          </select>
          <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
          {errors.package && <p className="text-red-600 text-xs mt-2 ml-6">{errors.package.message}</p>}
        </div>
      </QuestionField>

      <QuestionField question="Versicherungssumme Eigenschäden">
        <div className="relative">
          <select
            className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
            {...register('sumInsuredProperty')}
            defaultValue=""
          >
            <option value="" disabled className="text-[#0032A0]/60">Auswählen*</option>
            <option value="CHF 50'000">CHF 50'000</option>
            <option value="CHF 100'000">CHF 100'000</option>
            <option value="CHF 250'000">CHF 250'000</option>
            <option value="CHF 500'000">CHF 500'000</option>
            <option value="CHF 1'000'000">CHF 1'000'000</option>
            <option value="CHF 2'000'000">CHF 2'000'000</option>
          </select>
          <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
          {errors.sumInsuredProperty && <p className="text-red-600 text-xs mt-2 ml-6">{errors.sumInsuredProperty.message}</p>}
        </div>
      </QuestionField>

      <QuestionField question="Versicherungssumme Haftpflicht">
        <div className="relative">
          <select
            className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
            {...register('sumInsuredLiability')}
            defaultValue=""
          >
            <option value="" disabled className="text-[#0032A0]/60">Auswählen*</option>
            <option value="CHF 500'000">CHF 500'000</option>
            <option value="CHF 1'000'000">CHF 1'000'000</option>
            <option value="CHF 2'000'000">CHF 2'000'000</option>
          </select>
          <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
          {errors.sumInsuredLiability && <p className="text-red-600 text-xs mt-2 ml-6">{errors.sumInsuredLiability.message}</p>}
        </div>
      </QuestionField>

      <QuestionField question="Versicherungssumme Cyber Crime">
        <div className="relative">
          <select
            className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
            {...register('sumInsuredCyberCrime')}
            defaultValue=""
          >
            <option value="" disabled className="text-[#0032A0]/60">Auswählen*</option>
            <option value="CHF 50'000">CHF 50'000</option>
            <option value="CHF 100'000">CHF 100'000</option>
            <option value="CHF 250'000">CHF 250'000</option>
          </select>
          <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
          {errors.sumInsuredCyberCrime && <p className="text-red-600 text-xs mt-2 ml-6">{errors.sumInsuredCyberCrime.message}</p>}
        </div>
      </QuestionField>

      <QuestionField question="Selbstbehalt">
        <div className="relative">
          <select
            className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
            {...register('deductible')}
            defaultValue=""
          >
            <option value="" disabled className="text-[#0032A0]/60">Auswählen*</option>
            <option value="CHF 500">CHF 500</option>
            <option value="CHF 1'000">CHF 1'000</option>
            <option value="CHF 2'500">CHF 2'500</option>
            <option value="CHF 5'000">CHF 5'000</option>
          </select>
          <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
          {errors.deductible && <p className="text-red-600 text-xs mt-2 ml-6">{errors.deductible.message}</p>}
        </div>
      </QuestionField>

      <QuestionField question="Wartefrist Betriebsunterbruch">
        <div className="relative">
          <select
            className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
            {...register('waitingPeriod')}
            defaultValue=""
          >
            <option value="" disabled className="text-[#0032A0]/60">Auswählen*</option>
            <option value="12h">12h</option>
            <option value="24h">24h</option>
            <option value="48h">48h</option>
          </select>
          <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
          {errors.waitingPeriod && <p className="text-red-600 text-xs mt-2 ml-6">{errors.waitingPeriod.message}</p>}
        </div>
      </QuestionField>
    </div>
  );
}

// Step 4: Prämie (Package Selection)
function Step4Premium({ register, errors, formData }: any) {
  const [selectedPackage, setSelectedPackage] = useState<string>(formData.package || '');

  const formatCurrency = (amount: number) => {
    return `CHF ${amount.toLocaleString('de-CH')}`;
  };

  const CheckIcon = () => (
    <svg className="w-5 h-5 text-[#008C95]" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );

  const CrossIcon = () => (
    <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );

  const coverageRows = [
    { label: 'Cyber Daten- und Systemwiederherstellung', basic: true, optimum: true, premium: true },
    { label: 'Cyber Krisenmanagement', basic: true, optimum: true, premium: true },
    { label: 'Cyber Haftpflicht', basic: true, optimum: true, premium: true },
    { label: 'Cyber Rechtsschutz', basic: true, optimum: true, premium: true },
    { label: 'Cyber Betriebsunterbruch', basic: false, optimum: true, premium: true },
    { label: 'Cyber Diebstahl', basic: false, optimum: false, premium: true },
    { label: 'Cyber Betrug', basic: false, optimum: false, premium: true },
  ];

  return (
    <div className="space-y-6 w-full">
      <h2 className="text-2xl font-light text-[#1A1A1A] mb-8">Prämie</h2>
      
      <div className="bg-[#CADB2D]/20 p-4 rounded-lg mb-8">
        <p className="text-[#0032A0] text-sm">
          Wählen Sie das passende Paket für Ihre Cyberversicherung.
        </p>
      </div>

      {/* Table Layout */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-0 bg-[#F5F5F5] border-b border-gray-200">
          <div className="p-8"></div>
          <div className={`text-center p-6 transition-colors ${selectedPackage === 'BASIC' ? 'bg-[#D9E8FC]' : ''}`}>
            <h3 className="text-[#0032A0] text-lg font-medium mb-2">BASIC</h3>
            <div className="text-2xl font-bold text-[#0032A0] mb-1">
              {formatCurrency(PACKAGES.BASIC.price)}
            </div>
            <p className="text-xs text-gray-600 mb-3">ab / Jahr</p>
            <button
              type="button"
              onClick={() => setSelectedPackage('BASIC')}
              className={`w-full py-2 rounded-full text-sm font-medium transition-colors ${
                selectedPackage === 'BASIC'
                  ? 'bg-[#0032A0] text-white'
                  : 'bg-[#008C95] text-white hover:bg-[#006B73]'
              }`}
            >
              {selectedPackage === 'BASIC' ? 'Ausgewählt' : 'Paket auswählen'}
            </button>
            <input
              type="radio"
              value="BASIC"
              {...register('package')}
              checked={selectedPackage === 'BASIC'}
              className="hidden"
            />
          </div>
          <div className={`text-center p-6 transition-colors ${selectedPackage === 'OPTIMUM' ? 'bg-[#D9E8FC]' : ''}`}>
            <h3 className="text-[#0032A0] text-lg font-medium mb-2">OPTIMUM</h3>
            <div className="text-2xl font-bold text-[#0032A0] mb-1">
              {formatCurrency(PACKAGES.OPTIMUM.price)}
            </div>
            <p className="text-xs text-gray-600 mb-3">ab / Jahr</p>
            <button
              type="button"
              onClick={() => setSelectedPackage('OPTIMUM')}
              className={`w-full py-2 rounded-full text-sm font-medium transition-colors ${
                selectedPackage === 'OPTIMUM'
                  ? 'bg-[#0032A0] text-white'
                  : 'bg-[#008C95] text-white hover:bg-[#006B73]'
              }`}
            >
              {selectedPackage === 'OPTIMUM' ? 'Ausgewählt' : 'Paket auswählen'}
            </button>
            <input
              type="radio"
              value="OPTIMUM"
              {...register('package')}
              checked={selectedPackage === 'OPTIMUM'}
              className="hidden"
            />
          </div>
          <div className={`text-center p-6 transition-colors ${selectedPackage === 'PREMIUM' ? 'bg-[#D9E8FC]' : ''}`}>
            <h3 className="text-[#0032A0] text-lg font-medium mb-2">PREMIUM</h3>
            <div className="text-2xl font-bold text-[#0032A0] mb-1">
              {formatCurrency(PACKAGES.PREMIUM.price)}
            </div>
            <p className="text-xs text-gray-600 mb-3">ab / Jahr</p>
            <button
              type="button"
              onClick={() => setSelectedPackage('PREMIUM')}
              className={`w-full py-2 rounded-full text-sm font-medium transition-colors ${
                selectedPackage === 'PREMIUM'
                  ? 'bg-[#0032A0] text-white'
                  : 'bg-[#008C95] text-white hover:bg-[#006B73]'
              }`}
            >
              {selectedPackage === 'PREMIUM' ? 'Ausgewählt' : 'Paket auswählen'}
            </button>
            <input
              type="radio"
              value="PREMIUM"
              {...register('package')}
              checked={selectedPackage === 'PREMIUM'}
              className="hidden"
            />
          </div>
        </div>

        {/* Coverage Rows */}
        {coverageRows.map((row, index) => (
          <div key={index} className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-0 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-700 flex items-center px-6 py-3">{row.label}</div>
            <div className={`flex justify-center items-center py-3 transition-colors ${selectedPackage === 'BASIC' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>
              {row.basic ? <CheckIcon /> : <CrossIcon />}
            </div>
            <div className={`flex justify-center items-center py-3 transition-colors ${selectedPackage === 'OPTIMUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>
              {row.optimum ? <CheckIcon /> : <CrossIcon />}
            </div>
            <div className={`flex justify-center items-center py-3 transition-colors ${selectedPackage === 'PREMIUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>
              {row.premium ? <CheckIcon /> : <CrossIcon />}
            </div>
          </div>
        ))}

        {/* VS Eigenschäden */}
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-0 border-b border-gray-100">
          <div className="text-sm font-medium text-gray-700 flex items-center px-6 py-3">VS Eigenschäden</div>
          <div className={`text-center text-sm text-[#0032A0] py-3 transition-colors ${selectedPackage === 'BASIC' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{formatCurrency(PACKAGES.BASIC.eigenSchadenSum)}</div>
          <div className={`text-center text-sm text-[#0032A0] py-3 transition-colors ${selectedPackage === 'OPTIMUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{formatCurrency(PACKAGES.OPTIMUM.eigenSchadenSum)}</div>
          <div className={`text-center text-sm text-[#0032A0] py-3 transition-colors ${selectedPackage === 'PREMIUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{formatCurrency(PACKAGES.PREMIUM.eigenSchadenSum)}</div>
        </div>

        {/* VS Cyber Haftpflicht */}
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-0 border-b border-gray-100">
          <div className="text-sm font-medium text-gray-700 flex items-center px-6 py-3">VS Cyber Haftpflicht</div>
          <div className={`text-center text-sm text-[#0032A0] py-3 transition-colors ${selectedPackage === 'BASIC' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{formatCurrency(PACKAGES.BASIC.haftpflichtSum)}</div>
          <div className={`text-center text-sm text-[#0032A0] py-3 transition-colors ${selectedPackage === 'OPTIMUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{formatCurrency(PACKAGES.OPTIMUM.haftpflichtSum)}</div>
          <div className={`text-center text-sm text-[#0032A0] py-3 transition-colors ${selectedPackage === 'PREMIUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{formatCurrency(PACKAGES.PREMIUM.haftpflichtSum)}</div>
        </div>

        {/* VS Cyber Rechtsschutz */}
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-0 border-b border-gray-100">
          <div className="text-sm font-medium text-gray-700 flex items-center px-6 py-3">VS Cyber Rechtsschutz</div>
          <div className={`text-center text-sm text-[#0032A0] py-3 transition-colors ${selectedPackage === 'BASIC' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{formatCurrency(PACKAGES.BASIC.rechtsschutzSum)}</div>
          <div className={`text-center text-sm text-[#0032A0] py-3 transition-colors ${selectedPackage === 'OPTIMUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{formatCurrency(PACKAGES.OPTIMUM.rechtsschutzSum)}</div>
          <div className={`text-center text-sm text-[#0032A0] py-3 transition-colors ${selectedPackage === 'PREMIUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{formatCurrency(PACKAGES.PREMIUM.rechtsschutzSum)}</div>
        </div>

        {/* VS Cyber Crime */}
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-0 border-b border-gray-100">
          <div className="text-sm font-medium text-gray-700 flex items-center px-6 py-3">VS Cyber Crime</div>
          <div className={`flex justify-center items-center py-3 transition-colors ${selectedPackage === 'BASIC' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}><CrossIcon /></div>
          <div className={`flex justify-center items-center py-3 transition-colors ${selectedPackage === 'OPTIMUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}><CrossIcon /></div>
          <div className={`text-center text-sm text-[#0032A0] py-3 transition-colors ${selectedPackage === 'PREMIUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{formatCurrency(PACKAGES.PREMIUM.crimeSum)}</div>
        </div>

        {/* Selbstbehalt */}
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-0 border-b border-gray-100">
          <div className="text-sm font-medium text-gray-700 flex items-center px-6 py-3">Selbstbehalt</div>
          <div className={`text-center text-sm text-[#0032A0] py-3 transition-colors ${selectedPackage === 'BASIC' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{formatCurrency(PACKAGES.BASIC.deductible)}</div>
          <div className={`text-center text-sm text-[#0032A0] py-3 transition-colors ${selectedPackage === 'OPTIMUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{formatCurrency(PACKAGES.OPTIMUM.deductible)}</div>
          <div className={`text-center text-sm text-[#0032A0] py-3 transition-colors ${selectedPackage === 'PREMIUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>CHF 0</div>
        </div>

        {/* Wartefrist */}
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-0">
          <div className="text-sm font-medium text-gray-700 flex items-center px-6 py-3">Wartefrist</div>
          <div className={`flex justify-center items-center py-3 transition-colors ${selectedPackage === 'BASIC' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}><CrossIcon /></div>
          <div className={`text-center text-sm text-[#0032A0] py-3 transition-colors ${selectedPackage === 'OPTIMUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{PACKAGES.OPTIMUM.waitingPeriod}</div>
          <div className={`text-center text-sm text-[#0032A0] py-3 transition-colors ${selectedPackage === 'PREMIUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{PACKAGES.PREMIUM.waitingPeriod}</div>
        </div>
      </div>

      {errors.package && (
        <p className="text-red-600 text-sm mt-4">{errors.package.message}</p>
      )}
    </div>
  );
}

// Step 6: Zusammenfassung (Read-Only)
function Step6Summary({ formData }: { formData: any }) {
  const SummarySection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-[#0032A0] mb-4 border-b border-gray-200 pb-2">{title}</h3>
      {children}
    </div>
  );

  const SummaryRow = ({ label, value }: { label: string; value: any }) => (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-gray-600">{label}</span>
      <span className="text-[#0032A0] font-medium">{value || '-'}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-light text-[#1A1A1A] mb-8">Zusammenfassung</h2>
      <p className="text-gray-600 mb-6">Bitte prüfen Sie Ihre Angaben vor dem Absenden.</p>

      {/* Unternehmensdaten */}
      <SummarySection title="Unternehmensdaten">
        <SummaryRow label="Versicherungsnehmer" value={formData.companyName} />
        <SummaryRow label="Adresse" value={formData.address} />
        <SummaryRow label="PLZ, Ort" value={formData.zip && formData.city ? `${formData.zip} ${formData.city}` : '-'} />
        <SummaryRow label="Land" value={formData.country} />
        <SummaryRow label="URL" value={formData.url} />
      </SummarySection>

      {/* Cyber Risikoprofil */}
      <SummarySection title="Cyber Risikoprofil">
        <SummaryRow label="Branche" value={formData.industry} />
        <SummaryRow label="Keine Tochtergesellschaften im Ausland" value={formData.noForeignSubsidiaries} />
        <SummaryRow label="Kein abgelehnter Versicherungsantrag" value={formData.noRejectedInsurance} />
        <SummaryRow label="Anzahl Mitarbeitende" value={formData.employees} />
        <SummaryRow label="Brutto-Gesamtumsatz" value={formData.revenue ? `CHF ${formData.revenue.toLocaleString('de-CH')}` : '-'} />
        <SummaryRow label="E-Commerce Umsatzanteil" value={formData.eCommercePercentage} />
        <SummaryRow label="Auslandsumsatz" value={formData.foreignRevenuePercentage} />
      </SummarySection>

      {/* Cyber-Sicherheit */}
      <SummarySection title="Cyber-Sicherheit">
        <SummaryRow label="Cybervorfälle in letzten 3 Jahren" value={formData.hadCyberIncidents} />
        <SummaryRow label="Anzahl Personen-/Kundendaten" value={formData.personalDataCount} />
        <SummaryRow label="Anzahl Medizinal-/Gesundheitsdaten" value={formData.medicalDataCount} />
        <SummaryRow label="Anzahl Kreditkartendaten" value={formData.creditCardDataCount} />
        <SummaryRow label="End-of-Life Systeme" value={formData.hasEndOfLifeSystems} />
      </SummarySection>

      {/* Versicherte Leistungen */}
      <SummarySection title="Versicherte Leistungen">
        <SummaryRow label="Deckungspaket" value={formData.package ? `${formData.package} Paket` : '-'} />
        <SummaryRow label="Versicherungssumme Eigenschäden" value={formData.sumInsuredProperty} />
        <SummaryRow label="Versicherungssumme Haftpflicht" value={formData.sumInsuredLiability} />
        <SummaryRow label="Versicherungssumme Cyber Crime" value={formData.sumInsuredCyberCrime} />
        <SummaryRow label="Selbstbehalt" value={formData.deductible} />
        <SummaryRow label="Wartefrist Betriebsunterbruch" value={formData.waitingPeriod} />
      </SummarySection>

      {/* Prämie */}
      {formData.package && PACKAGES[formData.package as keyof typeof PACKAGES] && (
        <SummarySection title="Prämie">
          <SummaryRow 
            label="Gewähltes Paket" 
            value={`${formData.package} - CHF ${PACKAGES[formData.package as keyof typeof PACKAGES].price.toLocaleString('de-CH')}/Jahr`} 
          />
        </SummarySection>
      )}
    </div>
  );
}

// Step 7: Bestätigung
function Step7Confirmation({ register, errors }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-light text-[#1A1A1A] mb-8">Bestätigung</h2>
      
      <div className="bg-[#D9E8FC] p-6 rounded-lg mb-8">
        <p className="text-[#0032A0] text-sm">
          Mit dem Absenden dieser Offertanfrage bestätigen Sie, dass alle Angaben wahrheitsgemäss und vollständig sind.
        </p>
      </div>

      <label className="flex items-start gap-4 p-4 bg-[#F5F5F5] rounded-lg cursor-pointer">
        <input
          type="checkbox"
          className="checkbox checkbox-primary mt-1"
          {...register('acceptTerms')}
        />
        <span className="text-[#0032A0]">
          Ich bestätige, dass alle gemachten Angaben korrekt und vollständig sind. Mir ist bewusst, dass falsche Angaben zur Ablehnung des Antrags oder zur Kündigung der Versicherung führen können.
        </span>
      </label>
      {errors.acceptTerms && (
        <p className="text-red-600 text-xs mt-2 ml-6">{errors.acceptTerms.message}</p>
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Nach dem Absenden wird Ihre Offertanfrage geprüft und Sie erhalten innerhalb von 2 Werktagen eine Rückmeldung.
        </p>
      </div>
    </div>
  );
}
