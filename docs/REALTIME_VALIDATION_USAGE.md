# Echtzeit-Validierung - Nutzungsanleitung

## Übersicht

Das Feature **Echtzeit-Validierung** validiert Benutzereingaben automatisch während der Eingabe und gibt sofortiges visuelles Feedback. Aktuell implementiert im **Schritt 1 (Unternehmensdaten)** des Cyber-Offerten-Wizards.

---

## Validierte Felder

### 1. **Firmenname** (`companyName`)
- **Validierung:** Min. 2, Max. 200 Zeichen, erlaubte Zeichen
- **Feedback:** ✅ Gültiger Name / ❌ zu kurz/lang/ungültige Zeichen

### 2. **Adresse** (`address`)
- **Validierung:** Schweizer Adressformat (Strasse + Hausnummer)
- **Beispiel:** "Bahnhofstrasse 12" ✅
- **Feedback:** ⏳ während Eingabe → ✅ gültig / ❌ Format falsch
- **Hinweis:** "Bitte geben Sie Strasse und Hausnummer ein"

### 3. **PLZ** (`zip`)
- **Validierung:** 4-stellig, Bereich 1000-9999, Datenbank-Check
- **Feedback:** 
  - ✅ "Gültige PLZ"
  - 💡 "Ort: Zürich" (zeigt passende Orte)
  - ❌ "PLZ nicht in Datenbank" (wird trotzdem akzeptiert)

### 4. **Ort** (`city`)
- **Intelligente Features:**
  - 🔍 PLZ-basierte Auto-Complete
  - ⌨️ Keyboard Navigation (↑ ↓ Enter Escape)
  - 💡 Vorschläge bei Tippfehlern
- **Validierung:** Abgleich mit PLZ, wenn vorhanden
- **Feedback:** 
  - ✅ "Ort und PLZ passen zusammen"
  - ❌ "Ort passt nicht zu PLZ 8000" + Vorschläge

### 5. **URL** (`url`)
- **Optional:** Feld kann leer bleiben
- **Validierung:** URL-Format, automatische https://-Ergänzung
- **Feedback:**
  - ✅ "Gültiges URL-Format"
  - 💡 "Die Erreichbarkeit wird beim Speichern geprüft"
  - ❌ "Ungültiges URL-Format" + Beispiel

---

## Technische Details

### Verwendete Komponenten

```typescript
// Einfaches validiertes Input
<ValidatedInput
  label="Postleitzahl"
  name="zip"
  placeholder="PLZ*"
  validator={validateSwissZip}
  registerProps={register('zip')}
  error={errors.zip}
  showValidationIcon={true}
  maxLength={4}
/>

// Auto-Complete für Ort
<CityAutocomplete
  label="Ort"
  name="city"
  zip={zipValue}  // Dependency für PLZ-basierte Vorschläge
  registerProps={register('city')}
  error={errors.city}
/>
```

### Validierungs-Funktionen

| Funktion | Import aus | Beschreibung |
|----------|-----------|--------------|
| `validateSwissAddress` | `@/lib/validation/realtime-validators` | Adressformat |
| `validateSwissZip` | `@/lib/validation/realtime-validators` | PLZ + DB-Check |
| `validateCity` | `@/lib/validation/realtime-validators` | Ort + PLZ-Abgleich |
| `validateUrl` | `@/lib/validation/realtime-validators` | URL-Format |
| `validateCompanyName` | `@/lib/validation/realtime-validators` | Firmenname |

### PLZ-Datenbank

- **Datei:** `/lib/data/swiss-zip-codes.ts`
- **Einträge:** 200+ Schweizer PLZ/Ort-Kombinationen
- **Abdeckung:** Alle grossen Städte + wichtige Orte
- **Funktionen:**
  - `getValidCitiesForZip(zip)` - Orte für PLZ
  - `isValidZip(zip)` - PLZ existiert?
  - `validateZipCityMatch(zip, city)` - Passen zusammen?
  - `searchCities(query)` - Fuzzy Search

---

## Performance

### Debouncing
- **Default:** 500ms für Text-Inputs
- **City-Autocomplete:** 300ms (schnellere Response)
- Verhindert übermässige Validierungs-Calls

### Caching
- **Strategie:** Bereits validierte Werte werden gecacht
- **Limit:** Max. 50 Einträge
- **Benefit:** Schnellere Validierung bei wiederholter Eingabe

### Async Validierung
- Loading State während Validierung (⏳)
- AbortController für abgebrochene Requests
- Timeout für langsame Validierungen

---

## UX-Features

### Visuelles Feedback

| State | Icon | Farbe | Beispiel |
|-------|------|-------|----------|
| Loading | ⏳ Spinner | Grau | "Wird validiert..." |
| Success | ✅ Check | Grün | "Gültige PLZ" |
| Error | ❌ X | Rot | "PLZ muss 4-stellig sein" |
| Info | 💡 Info | Blau | "Ort: Zürich" |

### Intelligente Vorschläge

**PLZ 8000 eingegeben:**
```
✅ Gültige PLZ
💡 Ort: Zürich
```

**Ort "Zurich" eingegeben mit PLZ 8000:**
```
❌ Ort passt nicht zu PLZ 8000
💡 Vorschläge: Zürich
```

**Ort-Autocomplete bei PLZ 8000:**
```
┌─────────────────────────┐
│ Orte für PLZ 8000       │
├─────────────────────────┤
│ 📍 Zürich               │
└─────────────────────────┘
```

---

## Zukünftige Erweiterungen

### Phase 5: URL-Erreichbarkeit
- Server-seitige Prüfung ob URL erreichbar ist
- DNS-Lookup + HEAD-Request
- Feedback: "✅ URL ist erreichbar" oder "❌ URL nicht erreichbar"

### Phase 6: Weitere Schritte
- Echtzeit-Validierung für Schritt 2 (Cyber Risikoprofil)
- Validierung von E-Mail-Adressen
- Duplikaten-Check für Firmennamen

### Phase 7: Erweiterte Datenbank
- Vollständige Schweizer PLZ-Datenbank (3000+ Einträge)
- Integration Swiss Post API
- Mehrsprachige Ortsnamen (D/F/I)

---

## Troubleshooting

### Problem: Validierung wird nicht ausgelöst
**Lösung:** Stelle sicher, dass `validator` Prop übergeben wurde

### Problem: Auto-Complete zeigt keine Vorschläge
**Lösung:** Prüfe ob PLZ-Wert korrekt übergeben wird: `zip={watch('zip')}`

### Problem: Styling passt nicht
**Lösung:** Verwende `className` Prop für Custom Styling

### Problem: Performance-Probleme
**Lösung:** 
- Erhöhe `debounceMs` (z.B. auf 1000ms)
- Deaktiviere `validateOnChange` für langsame Validatoren

---

## Beispiel: Komplettes Formular

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ValidatedInput from '@/components/forms/ValidatedInput';
import CityAutocomplete from '@/components/forms/CityAutocomplete';
import { companyDataSchema } from '@/lib/validation/quote-schema';
import { 
  validateSwissAddress, 
  validateSwissZip, 
  validateUrl 
} from '@/lib/validation/realtime-validators';

export default function CompanyForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(companyDataSchema),
  });

  const zipValue = watch('zip');

  const onSubmit = (data) => {
    console.log('Formulardaten:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <ValidatedInput
        label="Adresse"
        name="address"
        placeholder="z.B. Bahnhofstrasse 12"
        validator={validateSwissAddress}
        registerProps={register('address')}
        error={errors.address}
        showValidationIcon={true}
      />

      <ValidatedInput
        label="PLZ"
        name="zip"
        placeholder="PLZ"
        validator={validateSwissZip}
        registerProps={register('zip')}
        error={errors.zip}
        maxLength={4}
      />

      <CityAutocomplete
        label="Ort"
        name="city"
        zip={zipValue}
        registerProps={register('city')}
        error={errors.city}
      />

      <ValidatedInput
        label="Website"
        name="url"
        type="url"
        placeholder="www.firma.ch"
        validator={validateUrl}
        registerProps={register('url')}
        error={errors.url}
        optional={true}
      />

      <button type="submit">Speichern</button>
    </form>
  );
}
```

---

## Feedback & Support

Bei Fragen oder Problemen:
1. Konsultiere diese Dokumentation
2. Prüfe Browser-Konsole für Fehler
3. Teste mit einfachen Werten (z.B. "Zürich" für Ort)
