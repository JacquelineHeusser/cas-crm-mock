/**
 * Neue Cyber-Offerte erstellen
 * Mehrstufiger Wizard mit React Hook Form + Zod
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { 
  companyDataSchema, 
  itStructureSchema,
  securityMeasuresSchema,
  incidentsSchema,
  coverageSchema,
  INDUSTRIES,
  type CompanyData,
  type ITStructure,
  type SecurityMeasures,
  type Incidents,
  type Coverage,
} from '@/lib/validation/quote-schema';

// Formular-Schritte
const STEPS = [
  { id: 1, title: 'Unternehmen', schema: companyDataSchema },
  { id: 2, title: 'IT-Struktur', schema: itStructureSchema },
  { id: 3, title: 'Sicherheit', schema: securityMeasuresSchema },
  { id: 4, title: 'Vorfälle', schema: incidentsSchema },
  { id: 5, title: 'Deckung', schema: coverageSchema },
];

export default function NewQuotePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});

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

  // Nächster Schritt
  const onNext = async (data: any) => {
    setFormData({ ...formData, ...data });
    
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      reset();
    } else {
      // Letzter Schritt: Offerte speichern
      console.log('Finale Daten:', { ...formData, ...data });
      // TODO: Server Action zum Speichern
    }
  };

  // Vorheriger Schritt
  const onBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Berechne Fortschritt
  const progress = Math.round((currentStep / STEPS.length) * 100);

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
      <div className="flex-1 p-12 max-w-3xl">
        <form onSubmit={handleSubmit(onNext)}>
          {/* Dynamischer Content */}
          {currentStep === 1 && <Step1CompanyData register={register} errors={errors} />}
          {currentStep === 2 && <Step2ITStructure register={register} errors={errors} />}
          {currentStep === 3 && <Step3Security register={register} errors={errors} />}
          {currentStep === 4 && <Step4Incidents register={register} errors={errors} />}
          {currentStep === 5 && <Step5Coverage register={register} errors={errors} />}

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
              {currentStep === STEPS.length ? 'Offerte berechnen' : 'Weiter'}
              <ChevronRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Temporäre Step-Komponenten (werden später ausgelagert)
function Step1CompanyData({ register, errors }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-light text-[#1A1A1A] mb-8">Ihr Unternehmen</h2>
      
      {/* Name des Unternehmens */}
      <div>
        <input
          type="text"
          placeholder="Name des Unternehmens*"
          className="w-full px-6 py-4 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] placeholder:text-[#0032A0]/60 focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
          {...register('companyName')}
        />
        {errors.companyName && (
          <p className="text-red-600 text-xs mt-2 ml-6">{errors.companyName.message}</p>
        )}
      </div>

      {/* Adresse */}
      <div>
        <input
          type="text"
          placeholder="Adresse*"
          className="w-full px-6 py-4 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] placeholder:text-[#0032A0]/60 focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
          {...register('address')}
        />
        {errors.address && (
          <p className="text-red-600 text-xs mt-2 ml-6">{errors.address.message}</p>
        )}
      </div>

      {/* PLZ & Ort */}
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

      {/* Anzahl Mitarbeitende */}
      <div>
        <input
          type="number"
          placeholder="Anzahl Mitarbeitende (inkl. Geschäftsinhaber:in)*"
          className="w-full px-6 py-4 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] placeholder:text-[#0032A0]/60 focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
          {...register('employees', { valueAsNumber: true })}
        />
        {errors.employees && (
          <p className="text-red-600 text-xs mt-2 ml-6">{errors.employees.message}</p>
        )}
      </div>

      {/* Branche */}
      <div className="relative">
        <select
          className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
          {...register('industry')}
          defaultValue=""
        >
          <option value="" disabled className="text-[#0032A0]/60">
            Branche wählen*
          </option>
          {INDUSTRIES.map((industry) => (
            <option key={industry} value={industry} className="text-[#0032A0]">
              {industry}
            </option>
          ))}
        </select>
        {/* Dropdown Icon */}
        <ChevronRight 
          className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" 
          size={20} 
        />
        {errors.industry && (
          <p className="text-red-600 text-xs mt-2 ml-6">{errors.industry.message}</p>
        )}
      </div>

      {/* Jahresumsatz */}
      <div>
        <input
          type="number"
          placeholder="Jahresumsatz (CHF)*"
          className="w-full px-6 py-4 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] placeholder:text-[#0032A0]/60 focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
          {...register('revenue', { valueAsNumber: true })}
        />
        {errors.revenue && (
          <p className="text-red-600 text-xs mt-2 ml-6">{errors.revenue.message}</p>
        )}
      </div>
    </div>
  );
}

function Step2ITStructure({ register, errors }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-light text-[#1A1A1A] mb-8">IT-Struktur</h2>
      
      {/* Anzahl IT-Systeme */}
      <div>
        <input
          type="number"
          placeholder="Anzahl IT-Systeme*"
          className="w-full px-6 py-4 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] placeholder:text-[#0032A0]/60 focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
          {...register('itSystemsCount', { valueAsNumber: true })}
        />
        {errors.itSystemsCount && (
          <p className="text-red-600 text-xs mt-2 ml-6">{errors.itSystemsCount.message}</p>
        )}
      </div>

      {/* End-of-Life Systeme */}
      <div className="relative">
        <select
          className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
          {...register('hasEndOfLifeSystems')}
          defaultValue=""
        >
          <option value="" disabled className="text-[#0032A0]/60">
            Veraltete End-of-Life Systeme vorhanden?*
          </option>
          <option value="no">Nein</option>
          <option value="yes">Ja</option>
        </select>
        <ChevronRight 
          className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" 
          size={20} 
        />
        {errors.hasEndOfLifeSystems && (
          <p className="text-red-600 text-xs mt-2 ml-6">{errors.hasEndOfLifeSystems.message}</p>
        )}
      </div>

      {/* Cloud-Services */}
      <div className="relative">
        <select
          className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
          {...register('hasCloudServices')}
          defaultValue=""
        >
          <option value="" disabled className="text-[#0032A0]/60">
            Cloud-Services für Backup/Redundanz?*
          </option>
          <option value="yes">Ja</option>
          <option value="no">Nein</option>
        </select>
        <ChevronRight 
          className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" 
          size={20} 
        />
        {errors.hasCloudServices && (
          <p className="text-red-600 text-xs mt-2 ml-6">{errors.hasCloudServices.message}</p>
        )}
      </div>

      {/* Backup-System */}
      <div className="relative">
        <select
          className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
          {...register('hasBackupSystem')}
          defaultValue=""
        >
          <option value="" disabled className="text-[#0032A0]/60">
            Regelmässiges Backup-System vorhanden?*
          </option>
          <option value="yes">Ja</option>
          <option value="no">Nein</option>
        </select>
        <ChevronRight 
          className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" 
          size={20} 
        />
        {errors.hasBackupSystem && (
          <p className="text-red-600 text-xs mt-2 ml-6">{errors.hasBackupSystem.message}</p>
        )}
      </div>
    </div>
  );
}

function Step3Security({ register, errors }: any) {
  const securityMeasures = [
    { name: 'firewall', label: 'Firewall' },
    { name: 'antivirus', label: 'Antivirus' },
    { name: 'backup', label: 'Backup' },
    { name: 'mfa', label: 'Multi-Faktor-Authentifizierung (MFA)' },
    { name: 'encryption', label: 'Verschlüsselung' },
    { name: 'incidentResponse', label: 'Incident Response Plan' },
    { name: 'securityTraining', label: 'Sicherheitsschulungen' },
    { name: 'patchManagement', label: 'Patch Management' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-light text-[#1A1A1A] mb-8">Sicherheitsmassnahmen</h2>
      <p className="text-gray-600 mb-6">Welche Sicherheitsmassnahmen sind implementiert?</p>
      
      <div className="space-y-4">
        {securityMeasures.map((measure) => (
          <label key={measure.name} className="flex items-center gap-4 p-4 bg-[#F5F5F5] rounded-full cursor-pointer hover:bg-[#E8E8E8] transition-colors">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              {...register(measure.name)}
            />
            <span className="text-[#0032A0]">{measure.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function Step4Incidents({ register, errors }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-light text-[#1A1A1A] mb-8">Cybervorfälle</h2>
      
      {/* Vorfälle vorhanden */}
      <div className="relative">
        <select
          className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
          {...register('hasIncidents')}
          defaultValue=""
        >
          <option value="" disabled className="text-[#0032A0]/60">
            Gab es bereits Cybervorfälle?*
          </option>
          <option value="no">Nein</option>
          <option value="yes">Ja</option>
        </select>
        <ChevronRight 
          className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" 
          size={20} 
        />
        {errors.hasIncidents && (
          <p className="text-red-600 text-xs mt-2 ml-6">{errors.hasIncidents.message}</p>
        )}
      </div>

      {/* Checkboxen für spezifische Vorfälle */}
      <div className="space-y-4">
        <label className="flex items-center gap-4 p-4 bg-[#F5F5F5] rounded-full cursor-pointer hover:bg-[#E8E8E8] transition-colors">
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            {...register('ransomwareAttack')}
          />
          <span className="text-[#0032A0]">Ransomware-Angriff</span>
        </label>

        <label className="flex items-center gap-4 p-4 bg-[#F5F5F5] rounded-full cursor-pointer hover:bg-[#E8E8E8] transition-colors">
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            {...register('dataLeak')}
          />
          <span className="text-[#0032A0]">Datenleck</span>
        </label>
      </div>
    </div>
  );
}

function Step5Coverage({ register, errors }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-light text-[#1A1A1A] mb-8">Deckungswünsche</h2>
      
      {/* Deckungsvariante */}
      <div className="relative">
        <select
          className="w-full px-6 py-4 pr-12 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] focus:outline-none focus:ring-2 focus:ring-[#0032A0] appearance-none cursor-pointer"
          {...register('coverageVariant')}
          defaultValue=""
        >
          <option value="" disabled className="text-[#0032A0]/60">
            Deckungsvariante wählen*
          </option>
          <option value="basic">Basic</option>
          <option value="standard">Standard</option>
          <option value="optimum">Optimum</option>
        </select>
        <ChevronRight 
          className="absolute right-6 top-1/2 -translate-y-1/2 text-[#0032A0] pointer-events-none rotate-90" 
          size={20} 
        />
        {errors.coverageVariant && (
          <p className="text-red-600 text-xs mt-2 ml-6">{errors.coverageVariant.message}</p>
        )}
      </div>

      {/* Versicherungssumme */}
      <div>
        <input
          type="number"
          placeholder="Versicherungssumme (CHF)*"
          className="w-full px-6 py-4 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] placeholder:text-[#0032A0]/60 focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
          {...register('sumInsured', { valueAsNumber: true })}
        />
        {errors.sumInsured && (
          <p className="text-red-600 text-xs mt-2 ml-6">{errors.sumInsured.message}</p>
        )}
      </div>

      {/* Selbstbehalt */}
      <div>
        <input
          type="number"
          placeholder="Selbstbehalt (CHF)*"
          className="w-full px-6 py-4 bg-[#F5F5F5] rounded-full border-none text-[#0032A0] placeholder:text-[#0032A0]/60 focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
          {...register('deductible', { valueAsNumber: true })}
        />
        {errors.deductible && (
          <p className="text-red-600 text-xs mt-2 ml-6">{errors.deductible.message}</p>
        )}
      </div>
    </div>
  );
}
