/**
 * Neue Cyber-Offerte erstellen
 * Mehrstufiger Wizard mit React Hook Form + Zod
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveQuoteStep, getUserId, getUserData, loadQuote, createPolicyFromQuote, createUnderwritingCase, submitCustomerResponse } from '@/app/actions/quote';
import { getDnbCompany } from '@/app/actions/dnb';
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
import BrokerSelectionStep from '@/components/quotes/BrokerSelectionStep';

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
  const searchParams = useSearchParams();
  const editQuoteId = searchParams.get('edit');
  const dnbId = searchParams.get('dnbId');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [quoteId, setQuoteId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [riskScore, setRiskScore] = useState<string | null>(null);
  const [riskScoreReason, setRiskScoreReason] = useState<string | null>(null);
  const [underwritingCase, setUnderwritingCase] = useState<any>(null);
  const [selectedBrokerId, setSelectedBrokerId] = useState<string | undefined>(undefined);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showBrokerSelection, setShowBrokerSelection] = useState(false);

  // Aktuelles Schema basierend auf Step
  const currentSchema = STEPS[currentStep - 1].schema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: formData,
  });

  // Ermittle letzten ausgefüllten Step
  const getLastCompletedStep = (data: any): number => {
    if (data.acceptTerms !== undefined) return 7; // Confirmation
    if (data.package) return 5; // Coverage (nach Premium)
    if (data.hasEndOfLifeSystems !== undefined) return 3; // Cyber Security
    if (data.hadCyberIncidents !== undefined) return 2; // Cyber Risk Profile
    if (data.companyName) return 1; // Company Data
    return 0;
  };

  // Prüfe ob Step erreichbar ist
  const canNavigateToStep = (targetStep: number): boolean => {
    // Zurück geht immer
    if (targetStep < currentStep) return true;
    
    // Zu Step 1 geht immer
    if (targetStep === 1) return true;
    
    // Vorwärts nur wenn vorherige Steps ausgefüllt
    const lastCompleted = getLastCompletedStep(formData);
    return targetStep <= lastCompleted + 1;
  };

  // Direkt zu Step springen
  const navigateToStep = (targetStep: number) => {
    if (!canNavigateToStep(targetStep)) return;
    
    setCurrentStep(targetStep);
    reset(formData);
  };

  // Beim Mounting: Prüfe ob User eingeloggt ist und lade ggf. existierende Quote
  useEffect(() => {
    const initialize = async () => {
      // Hole User-Daten aus Session (Server Action)
      const { success, userId, role } = await getUserData();
      
      if (!success || !userId) {
        // Nicht eingeloggt - redirect zu Login
        window.location.href = '/login';
        return;
      }
      
      // Setze Rolle und prüfe ob Broker-Auswahl nötig ist
      setUserRole(role);
      const needsBrokerSelection = role === 'BROKER' || role === 'UNDERWRITER' || role === 'MFU_TEAMLEITER' || role === 'HEAD_CYBER_UNDERWRITING';
      setShowBrokerSelection(needsBrokerSelection && !editQuoteId); // Nur bei neuen Offerten
      
      // Wenn Quote-ID vorhanden, lade existierende Quote
      if (editQuoteId) {
        const result = await loadQuote(editQuoteId);
        
        if (result.success && result.quote) {
          // Setze Quote ID
          setQuoteId(result.quote.id);
          
          // Setze Risk Score wenn vorhanden
          if (result.quote.riskScore) {
            setRiskScore(result.quote.riskScore);
            setRiskScoreReason(result.quote.riskScoreReason || null);
          }
          
          // Setze Underwriting Case wenn vorhanden
          if (result.quote.underwritingCase) {
            setUnderwritingCase(result.quote.underwritingCase);
          }
          
          // Merge alle Daten aus den JSON Feldern
          const loadedData = {
            ...(result.quote.companyData as any || {}),
            ...(result.quote.cyberRiskProfile as any || {}),
            ...(result.quote.cyberSecurity as any || {}),
            ...(result.quote.coverage as any || {}),
          };
          
          setFormData(loadedData);
          reset(loadedData);
          
          // Springe zum letzten ausgefüllten Step
          const lastStep = getLastCompletedStep(loadedData);
          if (lastStep > 0) {
            setCurrentStep(lastStep);
          }
        }
      } else if (dnbId) {
        // Neue Offerte mit vorausgewählter DnB-Firma
        try {
          const dnbResult = await getDnbCompany(dnbId);
          if (dnbResult?.success && dnbResult.company) {
            const prefillData = {
              companyName: dnbResult.company.name,
              address: dnbResult.company.address,
              zip: dnbResult.company.zip,
              city: dnbResult.company.city,
              country: dnbResult.company.country ?? 'CH',
              url: dnbResult.company.url ?? '',
              industry: dnbResult.company.industryCode,
              employees: dnbResult.company.employeeCount,
              revenue: Number(dnbResult.company.annualRevenue) / 100,
            };

            setFormData(prefillData);
            reset(prefillData);
          }
        } catch (error) {
          console.error('Fehler beim Laden der DnB-Firma:', error);
        }
      }
      
      setIsLoading(false);
    };
    
    initialize();
  }, [editQuoteId, dnbId, reset]);

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
        ...(selectedBrokerId ? { brokerId: selectedBrokerId } : {}),
        step: stepName,
        stepData: data,
      });
      
      if (result.success && result.quoteId) {
        setQuoteId(result.quoteId);
        
        // Speichere Risk Score wenn vorhanden (wird bei Step 3 berechnet)
        if (result.riskScore) {
          setRiskScore(result.riskScore);
        }
      }
    }
    
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      reset(updatedFormData); // Wichtig: Formulardaten beibehalten für bedingte Logik
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

  // PDF-Offerte generieren
  const handleGeneratePDF = async () => {
    if (!quoteId) {
      alert('Bitte speichern Sie zuerst die Offerte');
      return;
    }

    try {
      // Öffne PDF in neuem Tab
      const pdfUrl = `/api/quotes/${quoteId}/pdf`;
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Fehler bei PDF-Generierung:', error);
      alert('Fehler bei der PDF-Generierung');
    }
  };

  // Direktabschluss
  const handleDirectContract = async (startDate: string) => {
    if (!quoteId) {
      alert('Bitte speichern Sie zuerst die Offerte');
      return { success: false };
    }

    try {
      // Hole User ID aus Session
      const { success: userSuccess, userId } = await getUserId();
      
      if (!userSuccess || !userId) {
        alert('Bitte melden Sie sich an');
        return { success: false };
      }

      // Erstelle Policy aus Quote
      const result = await createPolicyFromQuote({
        quoteId,
        userId,
        startDate,
      });

      if (result.success) {
        return { success: true, policy: result.policy };
      } else {
        alert(result.error || 'Fehler beim Erstellen der Police');
        return { success: false };
      }
    } catch (error) {
      console.error('Fehler beim Direktabschluss:', error);
      alert('Fehler beim Direktabschluss');
      return { success: false };
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

  // Broker-Auswahl (nur für Broker/Underwriter, vor dem eigentlichen Flow)
  if (showBrokerSelection && !selectedBrokerId) {
    return (
      <div className="flex-1 p-8">
        <BrokerSelectionStep
          onSelect={(brokerId) => setSelectedBrokerId(brokerId)}
          selectedBrokerId={selectedBrokerId}
          onNext={() => setShowBrokerSelection(false)}
          onPrevious={() => window.location.href = '/dashboard'}
        />
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
          {STEPS.map((step) => {
            const isAccessible = canNavigateToStep(step.id);
            const isCurrent = currentStep === step.id;
            
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => navigateToStep(step.id)}
                disabled={!isAccessible}
                className={`
                  w-full text-left py-2 px-3 rounded text-sm transition-colors
                  ${
                    isCurrent
                      ? 'text-[#0032A0] font-medium bg-white/50'
                      : isAccessible
                        ? 'text-gray-600 hover:bg-white/30 cursor-pointer'
                        : 'text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {step.title}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Rechte Seite - Formular */}
      <div className="flex-1 p-12">
        <form onSubmit={handleSubmit(onNext)}>
          {/* Dynamischer Content */}
          {currentStep === 1 && (
            <Step1CompanyData
              register={register}
              errors={errors}
              currentCompanyName={watch('companyName')}
            />
          )}
          {currentStep === 2 && <Step2CyberRiskProfile register={register} errors={errors} />}
          {currentStep === 3 && <Step3CyberSecurity register={register} errors={errors} watch={watch} formData={formData} />}
          {currentStep === 4 && <Step4Premium register={register} errors={errors} formData={formData} />}
          {currentStep === 5 && <Step5Coverage register={register} errors={errors} formData={formData} />}
          {currentStep === 6 && <Step6Summary formData={formData} riskScore={riskScore} riskScoreReason={riskScoreReason} />}
          {currentStep === 7 && <Step7Confirmation register={register} errors={errors} formData={formData} watch={watch} riskScore={riskScore} onGeneratePDF={handleGeneratePDF} onDirectContract={handleDirectContract} onCreateUnderwriting={createUnderwritingCase} quoteId={quoteId} underwritingCase={underwritingCase} userRole={userRole} />}

          {/* Navigation Buttons - versteckt bei Step 7 (Bestätigung) */}
          {currentStep !== 7 && (
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
                Weiter
                <ChevronRight size={18} />
              </button>
            </div>
          )}
          
          {/* Zurück Button bei Step 7 */}
          {currentStep === 7 && (
            <div className="mt-12">
              <button
                type="button"
                onClick={onBack}
                className="btn btn-ghost text-[#0032A0] hover:bg-[#0032A0]/10 gap-2"
              >
                <ChevronLeft size={18} />
                Zurück
              </button>
            </div>
          )}
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
function Step1CompanyData({ register, errors, currentCompanyName }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-light text-[#1A1A1A] mb-8">Unternehmensdaten</h2>
      
      <QuestionField question="Versicherungsnehmer">
        <div className="flex gap-3 items-center">
          <input
            type="text"
            placeholder="Versicherungsnehmer*"
            className="w-full px-6 py-4 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] placeholder:text-[#0032A0]/60 focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
            {...register('companyName')}
          />
          <Link
            href={`/firmensuche${currentCompanyName ? `?q=${encodeURIComponent(currentCompanyName)}` : ''}`}
            className="btn btn-outline btn-sm rounded-full whitespace-nowrap"
          >
            Firmensuche
          </Link>
        </div>
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

// Step 3: Cyber-Sicherheit (mit bedingter Logik)
function Step3CyberSecurity({ register, errors, watch, formData }: any) {
  // Beobachte den Wert für Cybervorfälle
  const hadCyberIncidents = watch('hadCyberIncidents');
  const usesIndustrialControlSystems = watch('usesIndustrialControlSystems');
  const usesCloudServices = watch('usesCloudServices');
  const hasOutsourcedProcesses = watch('hasOutsourcedProcesses');
  
  // Prüfe Umsatz-Schwellenwerte (aus Step 2)
  // Verwende formData.revenue da es durch setFormData bereits vor dem Render aktualisiert wurde
  // Konvertiere explizit zu Number, falls es als String gespeichert wurde
  const revenue = Number(formData?.revenue) || 0;
  const showRevenue5Questions = revenue > 5_000_000;
  const showRevenue10Questions = revenue > 10_000_000;
  
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

      {/* Bedingte Folgefragen bei Cybervorfällen */}
      {hadCyberIncidents === 'Ja' && (
        <div className="space-y-6 pl-6 border-l-4 border-[#008C95] bg-[#F8FAFC] p-6 rounded-lg">
          <h3 className="text-lg font-medium text-[#0032A0] mb-4">Details zu den Cybervorfällen</h3>
          
          <QuestionField question="Gab es mehrere Vorfälle in den letzten 3 Jahren?">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('multipleIncidents')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
              {errors.multipleIncidents && <p className="text-red-600 text-xs mt-2 ml-6">{errors.multipleIncidents.message}</p>}
            </div>
          </QuestionField>

          <QuestionField question="Führte ein Vorfall zu einem Ausfall von mehr als 72 Stunden?">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('incidentDowntime72h')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
              {errors.incidentDowntime72h && <p className="text-red-600 text-xs mt-2 ml-6">{errors.incidentDowntime72h.message}</p>}
            </div>
          </QuestionField>

          <QuestionField question="Führte ein Vorfall zu einem finanziellen Schaden?">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('incidentFinancialLoss')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
              {errors.incidentFinancialLoss && <p className="text-red-600 text-xs mt-2 ml-6">{errors.incidentFinancialLoss.message}</p>}
            </div>
          </QuestionField>

          <QuestionField question="Führte ein Vorfall zu Haftpflichtansprüchen Dritter?">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('incidentLiabilityClaims')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
              {errors.incidentLiabilityClaims && <p className="text-red-600 text-xs mt-2 ml-6">{errors.incidentLiabilityClaims.message}</p>}
            </div>
          </QuestionField>
        </div>
      )}

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

      {/* Business Continuity Frage - nur wenn Cybervorfälle */}
      {hadCyberIncidents === 'Ja' && (
        <QuestionField question="Wie lange kann Ihre Firma den Betrieb aufrechthalten, wenn zentrale interne IT-Systeme ausfallen?">
          <div className="relative">
            <select
              className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
              {...register('businessContinuityAfterITFailure')}
              defaultValue=""
            >
              <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
              <option value="Alle Geschäftsprozesse können eine Woche fortgesetzt werden.">Alle Geschäftsprozesse können eine Woche fortgesetzt werden.</option>
              <option value="Die meisten Geschäftsprozesse können eine Woche fortgesetzt werden.">Die meisten Geschäftsprozesse können eine Woche fortgesetzt werden.</option>
              <option value="Die meisten Geschäftsprozesse können mindestens einen Tag, aber weniger als eine Woche, fortgesetzt werden.">Die meisten Geschäftsprozesse können mindestens einen Tag, aber weniger als eine Woche, fortgesetzt werden.</option>
              <option value="Die meisten Geschäftsprozesse können weniger als einen Tag fortgesetzt werden oder kommen sofort zum Erliegen.">Die meisten Geschäftsprozesse können weniger als einen Tag fortgesetzt werden oder kommen sofort zum Erliegen.</option>
            </select>
            <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
            {errors.businessContinuityAfterITFailure && <p className="text-red-600 text-xs mt-2 ml-6">{errors.businessContinuityAfterITFailure.message}</p>}
          </div>
        </QuestionField>
      )}

      {/* Umsatz > 5 Mio. Fragen */}
      {showRevenue5Questions && (
        <div className="space-y-6 pl-6 border-l-4 border-[#CADB2D] bg-[#FEFCE8] p-6 rounded-lg mt-8">
          <h3 className="text-lg font-medium text-[#0032A0] mb-4">Erweiterte Sicherheitsfragen (Umsatz &gt; CHF 5 Mio.)</h3>
          
          <QuestionField question="Jeglicher Fernzugriff auf das Firmennetzwerk erfolgt über eine verschlüsselte Verbindung und erfordert Multifaktor-Authentifizierung (MFA).">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('hasMFARemoteAccess')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
            </div>
          </QuestionField>

          <QuestionField question="Ein dokumentierter IT-Notfallplan mit definierten Verantwortlichkeiten und Checklisten ist vorhanden.">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('hasITEmergencyPlan')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
            </div>
          </QuestionField>

          <QuestionField question="Mindestens wöchentlich wird ein Back-up bzw. eine Sicherheitskopie aller geschäftskritischen Daten erstellt.">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('hasWeeklyBackups')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
            </div>
          </QuestionField>

          <QuestionField question="Alle Back-ups mit vertraulichen Personen- oder Geschäftsdaten sind verschlüsselt.">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('hasEncryptedBackups')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
            </div>
          </QuestionField>

          <QuestionField question="Die Back-ups der geschäftskritischen Daten sind getrennt vom Firmennetzwerk gespeichert oder so gesichert, dass sie vom Firmennetzwerk aus nicht gelöscht werden können.">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('hasOfflineBackups')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
            </div>
          </QuestionField>

          <QuestionField question="Werden industrielle Steuerungssysteme oder Operational Technology (OT) genutzt?">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('usesIndustrialControlSystems')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
            </div>
          </QuestionField>

          {/* OT-spezifische Fragen bei Umsatz > 5 Mio. UND OT = Ja */}
          {usesIndustrialControlSystems === 'Ja' && (
            <div className="space-y-6 pl-6 border-l-4 border-[#0032A0] bg-white p-6 rounded-lg">
              <h4 className="text-md font-medium text-[#0032A0] mb-4">Operational Technology (OT) Details</h4>
              
              <QuestionField question="Jeglicher Fernzugriff auf industrielle Steuerungssysteme / OT erfolgt über eine verschlüsselte Verbindung und erfordert Multifaktor-Authentifizierung (MFA).">
                <div className="relative">
                  <select
                    className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                    {...register('hasOTMFARemoteAccess')}
                    defaultValue=""
                  >
                    <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                    <option value="Ja">Ja</option>
                    <option value="Nein">Nein</option>
                  </select>
                  <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
                </div>
              </QuestionField>

              <QuestionField question="Industrielle Steuerungssysteme / OT sind mit Firewalls vom (IT-) Firmennetzwerk getrennt.">
                <div className="relative">
                  <select
                    className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                    {...register('hasOTFirewallSeparation')}
                    defaultValue=""
                  >
                    <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                    <option value="Ja">Ja</option>
                    <option value="Nein">Nein</option>
                  </select>
                  <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
                </div>
              </QuestionField>
            </div>
          )}

          <QuestionField question="Es wird eine E-Mail-Sicherheitslösung verwendet, um Spam, Phishing und gefährliche Anhänge oder Links herauszufiltern.">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('hasEmailSecuritySolution')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
            </div>
          </QuestionField>

          <QuestionField question="IT-Systeme werden automatisch aktualisiert und auf dem neuesten Softwarestand gehalten.">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('hasAutomaticUpdates')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
            </div>
          </QuestionField>

          <QuestionField question="Alle Geräte und Server in Ihrer Firma sind mit einer Antiviren-Software ausgestattet.">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('hasAntivirusSoftware')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
            </div>
          </QuestionField>

          <QuestionField question="Interne Richtlinien schreiben für alle Benutzerkonten starke Passwörter vor.">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('hasStrongPasswordPolicies')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
            </div>
          </QuestionField>

          <QuestionField question="Alle Mitarbeitenden werden mindestens jährlich zu Informationssicherheit geschult.">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('hasAnnualSecurityTraining')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
            </div>
          </QuestionField>
        </div>
      )}

      {/* Umsatz > 10 Mio. Fragen */}
      {showRevenue10Questions && (
        <div className="space-y-6 pl-6 border-l-4 border-[#008C95] bg-[#F0FDFA] p-6 rounded-lg mt-8">
          <h3 className="text-lg font-medium text-[#0032A0] mb-4">Umfassende Sicherheitsanalyse (Umsatz &gt; CHF 10 Mio.)</h3>
          
          <QuestionField question="Nutzt Ihre Firma Cloud-Services?">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('usesCloudServices')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
            </div>
          </QuestionField>

          {usesCloudServices === 'Ja' && (
            <QuestionField question="Von welchen Anbietern nutzt Ihre Firma Cloud-Services? (Mehrfachauswahl möglich)">
              <input
                type="text"
                placeholder="z.B. Microsoft; Google; Amazon; Andere"
                className="w-full px-6 py-4 bg-white rounded-full border-none text-[#0032A0] placeholder:text-[#0032A0]/60 focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
                {...register('cloudServiceProviders')}
              />
            </QuestionField>
          )}

          <QuestionField question="Sind Prozesse oder Systeme ausgelagert und werden von externen Dienstleistern betrieben?">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('hasOutsourcedProcesses')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
            </div>
          </QuestionField>

          {hasOutsourcedProcesses === 'Ja' && (
            <QuestionField question="Welche Prozesse oder Systeme sind betroffen? (Mehrfachauswahl möglich)">
              <input
                type="text"
                placeholder="z.B. Microsoft 365, ERP, CRM, etc."
                className="w-full px-6 py-4 bg-white rounded-full border-none text-[#0032A0] placeholder:text-[#0032A0]/60 focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
                {...register('outsourcedProcessTypes')}
              />
            </QuestionField>
          )}

          <QuestionField question="Werden Wechseldatenträger wie USB-Sticks oder externe Festplatten genutzt?">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('usesRemovableMedia')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
            </div>
          </QuestionField>

          <QuestionField question="Für Administrator-Aufgaben wird ein separates, privilegiertes Nutzerkonto verwendet.">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('usesSeparateAdminAccounts')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
                <option value="Teilweise">Teilweise</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
            </div>
          </QuestionField>

          <QuestionField question="Die Zugriffsrechte für die Back-up-Umgebung werden nicht über die zentrale Benutzerverwaltung verwaltet.">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('hasIsolatedBackupAccess')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
                <option value="Teilweise">Teilweise</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
            </div>
          </QuestionField>

          <QuestionField question="Interne Richtlinien verbieten, dass dasselbe Passwort für verschiedene Nutzerkonten verwendet wird, und alle Nutzer werden entsprechend geschult.">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('hasUniquePasswordPolicy')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
                <option value="Teilweise">Teilweise</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
            </div>
          </QuestionField>

          <QuestionField question="Firewalls oder spezielle Sicherheitssysteme zur Erkennung und Verhinderung von Angriffen (IDS/IPS) prüfen alle Verbindungen, die ins Firmennetzwerk hinein- oder herausgehen.">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('hasFirewallIDSIPS')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
                <option value="Teilweise">Teilweise</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
            </div>
          </QuestionField>

          <QuestionField question="Sicherheits-Updates (Patches) werden zentral verwaltet und innerhalb von 30 Tagen nach Veröffentlichung auf alle Systeme ausgerollt.">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('hasRegularPatchManagement')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
                <option value="Teilweise">Teilweise</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
            </div>
          </QuestionField>

          <QuestionField question="Kritische Sicherheits-Updates werden mit einem Notfall-Prozess innerhalb von 3 Tagen nach Veröffentlichung auf alle Systeme ausgerollt.">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('hasCriticalPatchManagement')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
                <option value="Teilweise">Teilweise</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
            </div>
          </QuestionField>

          <QuestionField question="Phishing-Simulationen werden regelmässig durchgeführt.">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('hasPhishingSimulations')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
                <option value="Teilweise">Teilweise</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
            </div>
          </QuestionField>

          <QuestionField question="Es besteht in Ihrer Firma oder bei einem externen Dienstleister ein Security Operation Center (SOC), dessen Experten technisch in der Lage und befugt sind, potenzielle Sicherheitsvorfälle sofort nach ihrer Entdeckung einzudämmen und zu beheben.">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('hasSecurityOperationCenter')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
                <option value="Teilweise">Teilweise</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
            </div>
          </QuestionField>

          <QuestionField question="Wie lange kann Ihre Firma den Betrieb aufrechterhalten, wenn kritische IT-Systeme, die von externen IT-Dienstleistern betrieben werden, ausfallen?">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('businessContinuityExternalIT')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Alle Geschäftsprozesse können eine Woche fortgesetzt werden.">Alle Geschäftsprozesse können eine Woche fortgesetzt werden.</option>
                <option value="Die meisten Geschäftsprozesse können eine Woche fortgesetzt werden.">Die meisten Geschäftsprozesse können eine Woche fortgesetzt werden.</option>
                <option value="Die meisten Geschäftsprozesse können mindestens einen Tag, aber weniger als eine Woche, fortgesetzt werden.">Die meisten Geschäftsprozesse können mindestens einen Tag, aber weniger als eine Woche, fortgesetzt werden.</option>
                <option value="Die meisten Geschäftsprozesse können weniger als einen Tag fortgesetzt werden oder kommen sofort zum Erliegen.">Die meisten Geschäftsprozesse können weniger als einen Tag fortgesetzt werden oder kommen sofort zum Erliegen.</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
            </div>
          </QuestionField>

          {/* OT-spezifische Fragen bei Umsatz > 10 Mio. UND OT = Ja */}
          {usesIndustrialControlSystems === 'Ja' && (
            <div className="space-y-6 pl-6 border-l-4 border-[#0032A0] bg-white p-6 rounded-lg">
              <h4 className="text-md font-medium text-[#0032A0] mb-4">Erweiterte OT-Sicherheit</h4>
              
              <QuestionField question="Es gibt stets eine aktuelle Inventarliste mit allen industriellen Steuerungssystemen / OT.">
                <div className="relative">
                  <select
                    className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                    {...register('hasOTInventory')}
                    defaultValue=""
                  >
                    <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                    <option value="Ja">Ja</option>
                    <option value="Nein">Nein</option>
                    <option value="Teilweise">Teilweise</option>
                  </select>
                  <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
                </div>
              </QuestionField>

              <QuestionField question="Industrielle Steuerungssysteme / OT in verschiedenen Werken / an unterschiedlichen Standorten sind mit Firewalls voneinander getrennt.">
                <div className="relative">
                  <select
                    className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                    {...register('hasOTSiteSeparation')}
                    defaultValue=""
                  >
                    <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                    <option value="Ja">Ja</option>
                    <option value="Nein">Nein</option>
                    <option value="Teilweise">Teilweise</option>
                  </select>
                  <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
                </div>
              </QuestionField>

              <QuestionField question="Industrielle Steuerungssysteme / OT sind mit Firewalls vom Internet getrennt.">
                <div className="relative">
                  <select
                    className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                    {...register('hasOTInternetSeparation')}
                    defaultValue=""
                  >
                    <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                    <option value="Ja">Ja</option>
                    <option value="Nein">Nein</option>
                    <option value="Teilweise">Teilweise</option>
                  </select>
                  <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
                </div>
              </QuestionField>

              <QuestionField question="In den Netzwerken der industriellen Steuerungssysteme / OT werden regelmässig Schwachstellenscans durchgeführt.">
                <div className="relative">
                  <select
                    className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                    {...register('hasOTVulnerabilityScans')}
                    defaultValue=""
                  >
                    <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                    <option value="Ja">Ja</option>
                    <option value="Nein">Nein</option>
                    <option value="Teilweise">Teilweise</option>
                  </select>
                  <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
                </div>
              </QuestionField>

              <QuestionField question="Ein Back-up der industriellen Steuerungssysteme / OT wird mindestens einmal pro Monat und bei allen grossen Änderungen an Systemen und Prozessen erstellt.">
                <div className="relative">
                  <select
                    className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                    {...register('hasOTRegularBackups')}
                    defaultValue=""
                  >
                    <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                    <option value="Ja">Ja</option>
                    <option value="Nein">Nein</option>
                    <option value="Teilweise">Teilweise</option>
                  </select>
                  <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
                </div>
              </QuestionField>
            </div>
          )}

          <QuestionField question="Die Firma hat eine PCI-Zertifizierung (der Payment Card Industry) mit dem entsprechenden DSS-Reporting-Level -- basierend auf den jährlich verarbeiteten Kreditkarten-Transaktionen. Bei externen Zahlungsabwicklern werden die Audit-Berichte jährlich geprüft.">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('hasPCICertification')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
                <option value="Teilweise">Teilweise</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
            </div>
          </QuestionField>

          <QuestionField question="Medizinische Daten werden gemäss den anwendbaren datenschutzrechtlichen Bestimmungen (z.B. DSG, GDPR, HIPAA) geschützt.">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('protectsMedicalDataGDPR')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
                <option value="Teilweise">Teilweise</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
            </div>
          </QuestionField>

          <QuestionField question="Biometrische Daten werden nach den geltenden Gesetzen geschützt und nur wie vorgeschrieben erfasst, gespeichert und genutzt.">
            <div className="relative">
              <select
                className="w-full px-6 py-4 pr-12 bg-white rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
                {...register('protectsBiometricData')}
                defaultValue=""
              >
                <option value="" disabled className="text-[#0032A0]/60">Auswählen</option>
                <option value="Ja">Ja</option>
                <option value="Nein">Nein</option>
                <option value="Teilweise">Teilweise</option>
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
            </div>
          </QuestionField>
        </div>
      )}
    </div>
  );
}

// Step 5: Versicherte Leistungen
function Step5Coverage({ register, errors, formData }: any) {
  const selectedPackage = formData.package;
  const packageData = selectedPackage ? PACKAGES[selectedPackage as keyof typeof PACKAGES] : null;
  
  // Formatiere Währungsbeträge für Defaults (mit Apostroph als Tausendertrennzeichen)
  const formatCurrency = (amount: number) => {
    if (amount === 0) return 'CHF 0';
    const formatted = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    return `CHF ${formatted}`;
  };
  
  // Konvertiere Wartefrist in Stunden-Format
  const formatWaitingPeriod = (period: string) => {
    if (period === '48 Stunden') return '48h';
    if (period === '24 Stunden') return '24h';
    if (period === '12 Stunden') return '12h';
    return '';
  };
  
  // Default-Werte basierend auf gewähltem Paket
  const defaultEigenSchadenSum = packageData ? formatCurrency(packageData.eigenSchadenSum) : '';
  const defaultHaftpflichtSum = packageData ? formatCurrency(packageData.haftpflichtSum) : '';
  const defaultCrimeSum = packageData && packageData.crimeSum > 0 ? formatCurrency(packageData.crimeSum) : '';
  const defaultDeductible = packageData ? formatCurrency(packageData.deductible) : '';
  const defaultWaitingPeriod = packageData ? formatWaitingPeriod(packageData.waitingPeriod) : '';
  
  // Zeige Cyber Crime nur bei PREMIUM
  const showCyberCrime = selectedPackage === 'PREMIUM';
  
  // Zeige Wartefrist bei OPTIMUM und PREMIUM
  const showWaitingPeriod = selectedPackage === 'OPTIMUM' || selectedPackage === 'PREMIUM';
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-light text-[#1A1A1A] mb-8">Versicherte Leistungen</h2>
      
      <QuestionField question="Versicherte Deckungen">
        <div className="relative">
          <select
            className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
            {...register('package')}
            defaultValue={selectedPackage || ''}
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
            defaultValue={defaultEigenSchadenSum}
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
            defaultValue={defaultHaftpflichtSum}
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

      <QuestionField question="Versicherungssumme Rechtsschutz">
        <div className="px-6 py-4 text-[#0032A0]">
          CHF 50'000
        </div>
        <input
          type="hidden"
          {...register('sumInsuredLegalProtection')}
          value="CHF 50'000"
        />
      </QuestionField>

      {showCyberCrime && (
        <QuestionField question="Versicherungssumme Cyber Crime">
          <div className="relative">
            <select
              className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
              {...register('sumInsuredCyberCrime')}
              defaultValue={defaultCrimeSum}
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
      )}

      <QuestionField question="Selbstbehalt">
        <div className="relative">
          <select
            className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
            {...register('deductible')}
            defaultValue={defaultDeductible}
          >
            <option value="" disabled className="text-[#0032A0]/60">Auswählen*</option>
            <option value="CHF 500">CHF 500</option>
            <option value="CHF 1'000">CHF 1'000</option>
            <option value="CHF 2'500">CHF 2'500</option>
            <option value="CHF 5'000">CHF 5'000</option>
            <option value="CHF 0">CHF 0</option>
          </select>
          <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" size={20} />
          {errors.deductible && <p className="text-red-600 text-xs mt-2 ml-6">{errors.deductible.message}</p>}
        </div>
      </QuestionField>

      {showWaitingPeriod && (
        <QuestionField question="Wartefrist Betriebsunterbruch">
          <div className="relative">
            <select
              className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
              {...register('waitingPeriod')}
              defaultValue={defaultWaitingPeriod}
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
      )}
    </div>
  );
}

// Step 4: Prämie (Package Selection)
function Step4Premium({ register, errors, formData }: any) {
  const [selectedPackage, setSelectedPackage] = useState<string>(formData.package || '');
  
  const handlePackageSelect = (packageName: string) => {
    setSelectedPackage(packageName);
    // Trigger das versteckte Radio-Input
    const radioInput = document.querySelector(`input[value="${packageName}"]`) as HTMLInputElement;
    if (radioInput) {
      radioInput.click();
    }
  };

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
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-0 bg-[#F5F5F5] border-b border-gray-200">
          <div className="p-8"></div>
          <div className={`text-center p-6 transition-colors ${selectedPackage === 'BASIC' ? 'bg-[#D9E8FC]' : ''}`}>
            <h3 className="text-[#0032A0] text-lg font-medium mb-2">BASIC</h3>
            <div className="text-2xl font-bold text-[#0032A0] mb-1">
              {formatCurrency(PACKAGES.BASIC.price)}
            </div>
            <p className="text-xs text-gray-600 mb-3">ab / Jahr</p>
            <button
              type="button"
              onClick={() => handlePackageSelect('BASIC')}
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
              onClick={() => handlePackageSelect('OPTIMUM')}
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
              onClick={() => handlePackageSelect('PREMIUM')}
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
          <div key={index} className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-0 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-700 flex items-center px-6 py-4">{row.label}</div>
            <div className={`flex justify-center items-center py-4 transition-colors ${selectedPackage === 'BASIC' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>
              {row.basic ? <CheckIcon /> : <CrossIcon />}
            </div>
            <div className={`flex justify-center items-center py-4 transition-colors ${selectedPackage === 'OPTIMUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>
              {row.optimum ? <CheckIcon /> : <CrossIcon />}
            </div>
            <div className={`flex justify-center items-center py-4 transition-colors ${selectedPackage === 'PREMIUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>
              {row.premium ? <CheckIcon /> : <CrossIcon />}
            </div>
          </div>
        ))}

        {/* VS Eigenschäden */}
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-0 border-b border-gray-100">
          <div className="text-sm font-medium text-gray-700 flex items-center px-6 py-4">VS Eigenschäden</div>
          <div className={`text-center text-sm text-[#0032A0] py-4 transition-colors ${selectedPackage === 'BASIC' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{formatCurrency(PACKAGES.BASIC.eigenSchadenSum)}</div>
          <div className={`text-center text-sm text-[#0032A0] py-4 transition-colors ${selectedPackage === 'OPTIMUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{formatCurrency(PACKAGES.OPTIMUM.eigenSchadenSum)}</div>
          <div className={`text-center text-sm text-[#0032A0] py-4 transition-colors ${selectedPackage === 'PREMIUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{formatCurrency(PACKAGES.PREMIUM.eigenSchadenSum)}</div>
        </div>

        {/* VS Cyber Haftpflicht */}
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-0 border-b border-gray-100">
          <div className="text-sm font-medium text-gray-700 flex items-center px-6 py-4">VS Cyber Haftpflicht</div>
          <div className={`text-center text-sm text-[#0032A0] py-4 transition-colors ${selectedPackage === 'BASIC' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{formatCurrency(PACKAGES.BASIC.haftpflichtSum)}</div>
          <div className={`text-center text-sm text-[#0032A0] py-4 transition-colors ${selectedPackage === 'OPTIMUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{formatCurrency(PACKAGES.OPTIMUM.haftpflichtSum)}</div>
          <div className={`text-center text-sm text-[#0032A0] py-4 transition-colors ${selectedPackage === 'PREMIUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{formatCurrency(PACKAGES.PREMIUM.haftpflichtSum)}</div>
        </div>

        {/* VS Cyber Rechtsschutz */}
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-0 border-b border-gray-100">
          <div className="text-sm font-medium text-gray-700 flex items-center px-6 py-4">VS Cyber Rechtsschutz</div>
          <div className={`text-center text-sm text-[#0032A0] py-4 transition-colors ${selectedPackage === 'BASIC' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{formatCurrency(PACKAGES.BASIC.rechtsschutzSum)}</div>
          <div className={`text-center text-sm text-[#0032A0] py-4 transition-colors ${selectedPackage === 'OPTIMUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{formatCurrency(PACKAGES.OPTIMUM.rechtsschutzSum)}</div>
          <div className={`text-center text-sm text-[#0032A0] py-4 transition-colors ${selectedPackage === 'PREMIUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{formatCurrency(PACKAGES.PREMIUM.rechtsschutzSum)}</div>
        </div>

        {/* VS Cyber Crime */}
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-0 border-b border-gray-100">
          <div className="text-sm font-medium text-gray-700 flex items-center px-6 py-4">VS Cyber Crime</div>
          <div className={`flex justify-center items-center py-4 transition-colors ${selectedPackage === 'BASIC' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}><CrossIcon /></div>
          <div className={`flex justify-center items-center py-4 transition-colors ${selectedPackage === 'OPTIMUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}><CrossIcon /></div>
          <div className={`text-center text-sm text-[#0032A0] py-4 transition-colors ${selectedPackage === 'PREMIUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{formatCurrency(PACKAGES.PREMIUM.crimeSum)}</div>
        </div>

        {/* Selbstbehalt */}
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-0 border-b border-gray-100">
          <div className="text-sm font-medium text-gray-700 flex items-center px-6 py-4">Selbstbehalt</div>
          <div className={`text-center text-sm text-[#0032A0] py-4 transition-colors ${selectedPackage === 'BASIC' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{formatCurrency(PACKAGES.BASIC.deductible)}</div>
          <div className={`text-center text-sm text-[#0032A0] py-4 transition-colors ${selectedPackage === 'OPTIMUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{formatCurrency(PACKAGES.OPTIMUM.deductible)}</div>
          <div className={`text-center text-sm text-[#0032A0] py-4 transition-colors ${selectedPackage === 'PREMIUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>CHF 0</div>
        </div>

        {/* Wartefrist */}
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-0">
          <div className="text-sm font-medium text-gray-700 flex items-center px-6 py-4">Wartefrist</div>
          <div className={`flex justify-center items-center py-4 transition-colors ${selectedPackage === 'BASIC' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}><CrossIcon /></div>
          <div className={`text-center text-sm text-[#0032A0] py-4 transition-colors ${selectedPackage === 'OPTIMUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{PACKAGES.OPTIMUM.waitingPeriod}</div>
          <div className={`text-center text-sm text-[#0032A0] py-4 transition-colors ${selectedPackage === 'PREMIUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{PACKAGES.PREMIUM.waitingPeriod}</div>
        </div>
      </div>

      {errors.package && (
        <p className="text-red-600 text-sm mt-4">{errors.package.message}</p>
      )}
    </div>
  );
}

// Step 6: Zusammenfassung (Read-Only)
function Step6Summary({ formData, riskScore, riskScoreReason }: { formData: any; riskScore: string | null; riskScoreReason: string | null }) {
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

  // Risk Score Badge Farbe
  const getRiskScoreBadge = (score: string | null) => {
    if (!score) return null;
    
    const config: Record<string, { bg: string; text: string; label: string }> = {
      A: { bg: 'bg-green-100', text: 'text-green-800', label: 'Sehr Gut (A)' },
      B: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Gut (B)' },
      C: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Mittel (C)' },
      D: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Erhöht (D)' },
      E: { bg: 'bg-red-100', text: 'text-red-800', label: 'Hoch (E)' },
    };
    
    return config[score] || null;
  };

  const scoreBadge = getRiskScoreBadge(riskScore);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-light text-[#1A1A1A] mb-8">Zusammenfassung</h2>
      <p className="text-gray-600 mb-6">Bitte prüfen Sie Ihre Angaben vor dem Absenden.</p>
      
      {/* Risk Score Anzeige */}
      {riskScore && scoreBadge && (
        <div className={`p-6 rounded-lg border-2 ${riskScore === 'A' || riskScore === 'B' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-medium text-[#1A1A1A]">Risikoklassifizierung</h3>
                <span className={`px-4 py-1 rounded-full text-sm font-medium ${scoreBadge.bg} ${scoreBadge.text}`}>
                  {scoreBadge.label}
                </span>
              </div>
              {riskScoreReason && (
                <p className="text-sm text-gray-600">{riskScoreReason}</p>
              )}
              {(riskScore === 'A' || riskScore === 'B') ? (
                <p className="text-sm text-green-700 mt-2 font-medium">
                  ✅ Direkter Abschluss möglich
                </p>
              ) : (
                <p className="text-sm text-yellow-700 mt-2 font-medium">
                  ⚠️ Risikoprüfung durch Vermittler erforderlich
                </p>
              )}
            </div>
          </div>
        </div>
      )}

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
        
        {/* Bedingte Details bei Cybervorfällen */}
        {formData.hadCyberIncidents === 'Ja' && (
          <div className="ml-4 space-y-2">
            <SummaryRow label="Mehrere Vorfälle" value={formData.multipleIncidents || '-'} />
            <SummaryRow label="Ausfall > 72 Stunden" value={formData.incidentDowntime72h || '-'} />
            <SummaryRow label="Finanzieller Schaden" value={formData.incidentFinancialLoss || '-'} />
            <SummaryRow label="Haftpflichtansprüche" value={formData.incidentLiabilityClaims || '-'} />
            {formData.businessContinuityAfterITFailure && (
              <SummaryRow label="Business Continuity (interne IT)" value={formData.businessContinuityAfterITFailure} />
            )}
          </div>
        )}
        
        <SummaryRow label="Anzahl Personen-/Kundendaten" value={formData.personalDataCount} />
        <SummaryRow label="Anzahl Medizinal-/Gesundheitsdaten" value={formData.medicalDataCount} />
        <SummaryRow label="Anzahl Kreditkartendaten" value={formData.creditCardDataCount} />
        <SummaryRow label="End-of-Life Systeme" value={formData.hasEndOfLifeSystems} />
        
        {/* Umsatz > 5 Mio. Fragen */}
        {(formData.revenue > 5_000_000 && formData.hasMFARemoteAccess) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-[#0032A0] mb-3">Erweiterte Sicherheit (Umsatz &gt; CHF 5 Mio.)</h4>
            <div className="ml-4 space-y-2">
              {formData.hasMFARemoteAccess && <SummaryRow label="MFA für Fernzugriff" value={formData.hasMFARemoteAccess} />}
              {formData.hasITEmergencyPlan && <SummaryRow label="IT-Notfallplan vorhanden" value={formData.hasITEmergencyPlan} />}
              {formData.hasWeeklyBackups && <SummaryRow label="Wöchentliche Backups" value={formData.hasWeeklyBackups} />}
              {formData.hasEncryptedBackups && <SummaryRow label="Verschlüsselte Backups" value={formData.hasEncryptedBackups} />}
              {formData.hasOfflineBackups && <SummaryRow label="Offline/getrennte Backups" value={formData.hasOfflineBackups} />}
              {formData.usesIndustrialControlSystems && <SummaryRow label="Industrielle Steuerungssysteme (OT)" value={formData.usesIndustrialControlSystems} />}
              
              {/* OT-Details bei Umsatz > 5 Mio. */}
              {formData.usesIndustrialControlSystems === 'Ja' && (
                <div className="ml-4 space-y-2 mt-2">
                  {formData.hasOTMFARemoteAccess && <SummaryRow label="OT: MFA für Fernzugriff" value={formData.hasOTMFARemoteAccess} />}
                  {formData.hasOTFirewallSeparation && <SummaryRow label="OT: Firewall-Trennung" value={formData.hasOTFirewallSeparation} />}
                </div>
              )}
              
              {formData.hasEmailSecuritySolution && <SummaryRow label="E-Mail-Sicherheitslösung" value={formData.hasEmailSecuritySolution} />}
              {formData.hasAutomaticUpdates && <SummaryRow label="Automatische Updates" value={formData.hasAutomaticUpdates} />}
              {formData.hasAntivirusSoftware && <SummaryRow label="Antiviren-Software" value={formData.hasAntivirusSoftware} />}
              {formData.hasStrongPasswordPolicies && <SummaryRow label="Starke Passwort-Richtlinien" value={formData.hasStrongPasswordPolicies} />}
              {formData.hasAnnualSecurityTraining && <SummaryRow label="Jährliche Security-Schulungen" value={formData.hasAnnualSecurityTraining} />}
            </div>
          </div>
        )}
        
        {/* Umsatz > 10 Mio. Fragen */}
        {(formData.revenue > 10_000_000 && formData.usesCloudServices) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-[#0032A0] mb-3">Umfassende Sicherheitsanalyse (Umsatz &gt; CHF 10 Mio.)</h4>
            <div className="ml-4 space-y-2">
              {formData.usesCloudServices && <SummaryRow label="Cloud-Services" value={formData.usesCloudServices} />}
              {formData.cloudServiceProviders && <SummaryRow label="Cloud-Anbieter" value={formData.cloudServiceProviders} />}
              {formData.hasOutsourcedProcesses && <SummaryRow label="Ausgelagerte Prozesse" value={formData.hasOutsourcedProcesses} />}
              {formData.outsourcedProcessTypes && <SummaryRow label="Ausgelagerte System-Typen" value={formData.outsourcedProcessTypes} />}
              {formData.usesRemovableMedia && <SummaryRow label="Wechseldatenträger" value={formData.usesRemovableMedia} />}
              {formData.usesSeparateAdminAccounts && <SummaryRow label="Separate Admin-Konten" value={formData.usesSeparateAdminAccounts} />}
              {formData.hasIsolatedBackupAccess && <SummaryRow label="Isolierte Backup-Zugriffe" value={formData.hasIsolatedBackupAccess} />}
              {formData.hasUniquePasswordPolicy && <SummaryRow label="Einzigartige Passwörter" value={formData.hasUniquePasswordPolicy} />}
              {formData.hasFirewallIDSIPS && <SummaryRow label="Firewalls/IDS/IPS" value={formData.hasFirewallIDSIPS} />}
              {formData.hasRegularPatchManagement && <SummaryRow label="Patch-Management (30 Tage)" value={formData.hasRegularPatchManagement} />}
              {formData.hasCriticalPatchManagement && <SummaryRow label="Kritische Patches (3 Tage)" value={formData.hasCriticalPatchManagement} />}
              {formData.hasPhishingSimulations && <SummaryRow label="Phishing-Simulationen" value={formData.hasPhishingSimulations} />}
              {formData.hasSecurityOperationCenter && <SummaryRow label="Security Operation Center (SOC)" value={formData.hasSecurityOperationCenter} />}
              {formData.businessContinuityExternalIT && <SummaryRow label="Business Continuity (externe IT)" value={formData.businessContinuityExternalIT} />}
              
              {/* OT-Details bei Umsatz > 10 Mio. */}
              {formData.usesIndustrialControlSystems === 'Ja' && (
                <div className="ml-4 space-y-2 mt-2">
                  <h5 className="text-xs font-medium text-[#0032A0] mb-2">Erweiterte OT-Sicherheit:</h5>
                  {formData.hasOTInventory && <SummaryRow label="OT-Inventarliste" value={formData.hasOTInventory} />}
                  {formData.hasOTSiteSeparation && <SummaryRow label="OT-Standort-Trennung" value={formData.hasOTSiteSeparation} />}
                  {formData.hasOTInternetSeparation && <SummaryRow label="OT-Internet-Trennung" value={formData.hasOTInternetSeparation} />}
                  {formData.hasOTVulnerabilityScans && <SummaryRow label="OT-Schwachstellenscans" value={formData.hasOTVulnerabilityScans} />}
                  {formData.hasOTRegularBackups && <SummaryRow label="OT-Regelmässige Backups" value={formData.hasOTRegularBackups} />}
                </div>
              )}
              
              {formData.hasPCICertification && <SummaryRow label="PCI-Zertifizierung" value={formData.hasPCICertification} />}
              {formData.protectsMedicalDataGDPR && <SummaryRow label="Medizinischer Datenschutz (GDPR)" value={formData.protectsMedicalDataGDPR} />}
              {formData.protectsBiometricData && <SummaryRow label="Biometrischer Datenschutz" value={formData.protectsBiometricData} />}
            </div>
          </div>
        )}
      </SummarySection>

      {/* Versicherte Leistungen */}
      <SummarySection title="Versicherte Leistungen">
        <SummaryRow label="Deckungspaket" value={formData.package ? `${formData.package} Paket` : '-'} />
        <SummaryRow label="Versicherungssumme Eigenschäden" value={formData.sumInsuredProperty} />
        <SummaryRow label="Versicherungssumme Haftpflicht" value={formData.sumInsuredLiability} />
        <SummaryRow label="Versicherungssumme Rechtsschutz" value={formData.sumInsuredLegalProtection} />
        {formData.sumInsuredCyberCrime && (
          <SummaryRow label="Versicherungssumme Cyber Crime" value={formData.sumInsuredCyberCrime} />
        )}
        <SummaryRow label="Selbstbehalt" value={formData.deductible} />
        {formData.waitingPeriod && (
          <SummaryRow label="Wartefrist Betriebsunterbruch" value={formData.waitingPeriod} />
        )}
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
function Step7Confirmation({ register, errors, formData, watch, riskScore, quoteId, onGeneratePDF, onDirectContract, onCreateUnderwriting, underwritingCase, userRole }: any) {
  const router = useRouter();
  const [showDirectContract, setShowDirectContract] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [policyCreated, setPolicyCreated] = useState(false);
  const [createdPolicyId, setCreatedPolicyId] = useState<string | null>(null);
  const [underwritingCreated, setUnderwritingCreated] = useState(false);
  const [isCreatingUnderwriting, setIsCreatingUnderwriting] = useState(false);
  const [customerResponse, setCustomerResponse] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [responseSubmitted, setResponseSubmitted] = useState(false);
  const [customerConsentConfirmed, setCustomerConsentConfirmed] = useState(false);
  
  // Prüfe ob User ein Broker/Underwriter ist
  const isBrokerOrUnderwriter = userRole === 'BROKER' || userRole === 'UNDERWRITER' || userRole === 'MFU_TEAMLEITER' || userRole === 'HEAD_CYBER_UNDERWRITING';
  
  // Prüfe ob Direktabschluss möglich ist (nur bei Risk Score A oder B)
  const canDirectContract = riskScore === 'A' || riskScore === 'B';
  const needsUnderwriting = riskScore && !canDirectContract;
  
  // Beobachte den aktuellen Wert der Checkbox
  const acceptTerms = watch('acceptTerms');
  
  // Prüfe ob alle notwendigen Felder ausgefüllt sind
  const isComplete = formData.companyName && 
    formData.package && 
    formData.sumInsuredProperty && 
    formData.sumInsuredLiability && 
    formData.deductible &&
    acceptTerms;
  
  // Standard-Versicherungsbeginn: Heute + 7 Tage
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  });
  
  const handleDirectContractClick = () => {
    setShowDirectContract(!showDirectContract);
  };
  
  const handleFinalizeContract = async () => {
    // Prüfe Kundeneinverständnis für Broker/Underwriter
    if (isBrokerOrUnderwriter && !customerConsentConfirmed) {
      alert('Bitte bestätigen Sie, dass Sie das Einverständnis des Kunden eingeholt haben.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await onDirectContract(startDate);
      if (result?.success) {
        setPolicyCreated(true);
        setCreatedPolicyId(result.policy?.id || null);
      }
    } catch (error) {
      console.error('Fehler beim Vertragsabschluss:', error);
      alert('Fehler beim Vertragsabschluss');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kunden-Antwort auf Vermittler-Rückfrage senden
  const handleSubmitResponse = async () => {
    if (!customerResponse.trim() || !quoteId) return;
    
    setIsSubmittingResponse(true);
    try {
      const { success, userId } = await getUserId();
      if (!success || !userId) {
        alert('Fehler: Benutzer nicht gefunden');
        return;
      }

      const result = await submitCustomerResponse({
        quoteId,
        userId,
        response: customerResponse,
      });

      if (result.success) {
        setResponseSubmitted(true);
        setCustomerResponse('');
        alert('Ihre Antwort wurde erfolgreich übermittelt. Der Vermittler wird sich in Kürze bei Ihnen melden.');
        router.refresh();
      } else {
        alert(result.error || 'Fehler beim Senden der Antwort');
      }
    } catch (error) {
      console.error('Fehler beim Senden der Antwort:', error);
      alert('Fehler beim Senden der Antwort');
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-light text-[#1A1A1A] mb-8">Bestätigung</h2>
      
      {/* Vermittler-Rückfrage Benachrichtigung */}
      {underwritingCase && underwritingCase.status === 'NEEDS_INFO' && !responseSubmitted && (
        <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-yellow-800 font-semibold mb-2">Zusätzliche Informationen benötigt</h3>
              <p className="text-yellow-700 text-sm mb-4">
                Der Vermittler benötigt weitere Informationen von Ihnen, um Ihre Offerte zu prüfen.
              </p>
              
              {/* Vermittler-Kommentare anzeigen */}
              <div className="bg-white p-4 rounded-lg mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Nachricht vom Vermittler:</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{underwritingCase.notes}</p>
              </div>

              {/* Antwort-Feld */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Ihre Antwort
                </label>
                <textarea
                  value={customerResponse}
                  onChange={(e) => setCustomerResponse(e.target.value)}
                  placeholder="Bitte beantworten Sie die Fragen des Vermittlers..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0032A0] resize-none"
                />
                <button
                  type="button"
                  onClick={handleSubmitResponse}
                  disabled={!customerResponse.trim() || isSubmittingResponse}
                  className="w-full py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingResponse ? 'Wird gesendet...' : 'Antwort absenden'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Erfolgsbestätigung nach Antwort */}
      {responseSubmitted && (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-green-800 font-semibold mb-2">Antwort erfolgreich gesendet</h3>
              <p className="text-green-700 text-sm">
                Ihre Antwort wurde an den Vermittler übermittelt. Sie werden in Kürze über den Status Ihrer Offerte informiert.
              </p>
            </div>
          </div>
        </div>
      )}
      
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

      {/* Warnung wenn nicht alle Felder ausgefüllt */}
      {!isComplete && (
        <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-orange-700 text-sm">
            ⚠️ Bitte füllen Sie alle Pflichtfelder aus und akzeptieren Sie die Bestätigung, um fortzufahren.
          </p>
        </div>
      )}

      {/* Aktionsbuttons */}
      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-medium text-[#1A1A1A] mb-4">Wie möchten Sie fortfahren?</h3>
        
        {/* PDF Offerte generieren - nur bei Risk Score A oder B */}
        {canDirectContract && (
          <button
            type="button"
            onClick={onGeneratePDF}
            disabled={!isComplete}
            className={`w-full p-6 rounded-lg border-2 text-left transition-all ${
              isComplete
                ? 'border-[#0032A0] bg-white hover:bg-[#D9E8FC] cursor-pointer'
                : 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#0032A0] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-[#0032A0] font-medium mb-2">PDF-Offerte erstellen</h4>
                <p className="text-sm text-gray-600">
                  Generieren Sie eine Offerte als PDF-Dokument mit allen erfassten Daten. Sie können diese herunterladen, ausdrucken oder per E-Mail versenden.
                </p>
              </div>
            </div>
          </button>
        )}

        {/* Direktabschluss - nur bei Risk Score A oder B */}
        {canDirectContract && (
          <button
            type="button"
            onClick={handleDirectContractClick}
            disabled={!isComplete}
            className={`w-full p-6 rounded-lg border-2 text-left transition-all ${
              isComplete
                ? 'border-[#008C95] bg-gradient-to-r from-[#008C95]/5 to-[#006B73]/5 hover:from-[#008C95]/10 hover:to-[#006B73]/10 cursor-pointer'
                : 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#008C95] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-[#008C95] font-medium mb-2">Direktabschluss</h4>
                <p className="text-sm text-gray-600">
                  Schliessen Sie die Versicherung direkt online ab. Nach erfolgreicher Prüfung erhalten Sie sofort Ihre Police per E-Mail.
                </p>
              </div>
              <ChevronRight 
                className={`text-[#008C95] transform transition-transform ${showDirectContract ? 'rotate-90' : ''}`} 
                size={24} 
              />
            </div>
          </button>
        )}
        
        {/* Underwriting erforderlich - bei Risk Score C, D oder E */}
        {needsUnderwriting && (
          <div className="w-full p-6 rounded-lg border-2 border-yellow-300 bg-yellow-50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-yellow-800 font-medium mb-2">Risikoprüfung erforderlich</h4>
                <p className="text-sm text-yellow-700 mb-4">
                  Aufgrund Ihrer Risikoklassifizierung ({riskScore}) ist kein Direktabschluss möglich. Ein Versicherungsvermittler wird Ihre Offerte prüfen und sich mit Ihnen in Verbindung setzen.
                </p>
                {!underwritingCreated ? (
                  <button
                    type="button"
                    onClick={async () => {
                      setIsCreatingUnderwriting(true);
                      try {
                        const { success, userId } = await getUserId();
                        if (success && userId && quoteId) {
                          const result = await onCreateUnderwriting({ quoteId, userId });
                          if (result.success) {
                            setUnderwritingCreated(true);
                            // Warte 1.5 Sekunden und leite dann zur Offerten-Übersicht weiter
                            setTimeout(() => {
                              router.push('/offerten');
                            }, 1500);
                          }
                        }
                      } catch (error) {
                        console.error('Fehler beim Erstellen des Risikoprüfungsauftrags:', error);
                        alert('Fehler beim Erstellen des Risikoprüfungsauftrags');
                      } finally {
                        setIsCreatingUnderwriting(false);
                      }
                    }}
                    disabled={isCreatingUnderwriting || !quoteId}
                    className="px-6 py-3 bg-yellow-600 text-white font-medium rounded-full hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingUnderwriting ? 'Wird erstellt...' : 'Risikoprüfungsauftrag erstellen'}
                  </button>
                ) : (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      ✅ Risikoprüfungsauftrag erfolgreich erstellt. Sie werden zur Offerten-Übersicht weitergeleitet...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Expandierbare Direktabschluss-Sektion */}
        {showDirectContract && !policyCreated && (
          <div className="border-2 border-[#008C95] rounded-lg p-6 space-y-6 bg-white">
            <h3 className="text-lg font-medium text-[#0032A0] mb-4">Vertragsdetails</h3>
            
            {/* Versicherungsbeginn */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#1A1A1A]">
                Versicherungsbeginn
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
              />
            </div>

            {/* Gewähltes Paket */}
            {formData.package && PACKAGES[formData.package as keyof typeof PACKAGES] && (
              <div className="bg-[#D9E8FC] p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Gewähltes Paket:</span>
                  <span className="text-[#0032A0] font-medium">{formData.package}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Jahresprämie:</span>
                  <span className="text-[#0032A0] font-bold text-lg">
                    CHF {PACKAGES[formData.package as keyof typeof PACKAGES].price.toLocaleString('de-CH')}
                  </span>
                </div>
              </div>
            )}

            {/* Kundeneinverständnis - nur für Broker/Underwriter */}
            {isBrokerOrUnderwriter && (
              <div className="border-2 border-yellow-300 bg-yellow-50 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customerConsentConfirmed}
                    onChange={(e) => setCustomerConsentConfirmed(e.target.checked)}
                    className="mt-1 w-5 h-5 text-[#0032A0] border-gray-300 rounded focus:ring-[#0032A0]"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-yellow-900">
                      Ich bestätige, dass ich das Einverständnis des Kunden für diesen Direktabschluss eingeholt habe.
                    </span>
                    <p className="text-xs text-yellow-700 mt-1">
                      Als Vermittler sind Sie verpflichtet, vor Vertragsabschluss die ausdrückliche Zustimmung des Kunden einzuholen.
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Abschluss Button */}
            <button
              type="button"
              onClick={handleFinalizeContract}
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-[#008C95] to-[#006B73] text-white font-medium rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Wird abgeschlossen...' : 'Versicherung jetzt abschliessen'}
            </button>
          </div>
        )}

        {/* Bestätigung nach erfolgreicher Erstellung */}
        {policyCreated && (
          <div className="border-2 border-green-500 rounded-lg p-6 bg-green-50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-green-700 font-medium mb-2">Police erfolgreich erstellt!</h4>
                <p className="text-sm text-green-600 mb-4">
                  Ihre Cyberversicherung wurde erfolgreich abgeschlossen. Sie finden Ihre Police nun unter "Meine Policen".
                </p>
                <a 
                  href={createdPolicyId ? `/policen/${createdPolicyId}` : '/policen'}
                  className="inline-block px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                >
                  Police anzeigen
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
