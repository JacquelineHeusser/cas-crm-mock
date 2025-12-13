# Feature: Echtzeit-Validierung im Offertenprozess

## Übersicht

Automatische und sofortige Validierung von Eingabefeldern während der Eingabe (onBlur/onChange) im mehrstufigen Cyber-Offerten-Wizard.

## Aktuelle Situation

### Was bereits vorhanden ist:
- ✅ React Hook Form mit Zod-Integration
- ✅ Basis-Validierung bei Submit
- ✅ 7-stufiger Wizard mit verschiedenen Datentypen
- ✅ Validierungs-Schemas in `/lib/validation/quote-schema.ts`

### Felder, die erweiterte Validierung benötigen:
1. **Adresse** (address) - Prüfung auf gültige Schweizer Adresse
2. **PLZ** (zip) - bereits Regex vorhanden, kann erweitert werden
3. **Ort** (city) - Abgleich mit PLZ-Datenbank
4. **URL** (url) - Validierung auf gültige und erreichbare URL
5. **Firmenname** (companyName) - Optional: Duplikaten-Check

---

## Ablaufplan

### Phase 1: Vorbereitung & Setup (Schritt 1)
**Ziel:** Infrastruktur für Echtzeit-Validierung aufbauen

#### 1.1 Validierungs-Utilities erstellen
- [ ] Neue Datei: `/lib/validation/realtime-validators.ts`
- [ ] Funktionen implementieren:
  - `validateSwissAddress(address: string): Promise<ValidationResult>`
  - `validateSwissZip(zip: string): Promise<ValidationResult>`
  - `validateCity(city: string, zip: string): Promise<ValidationResult>`
  - `validateUrl(url: string): Promise<ValidationResult>`
  - `validateCompanyName(name: string): Promise<ValidationResult>`

#### 1.2 Schweizer PLZ-Datenbank einbinden
- [ ] PLZ/Orts-Datei erstellen: `/lib/data/swiss-zip-codes.ts`
- [ ] Option A: Statische Liste der wichtigsten PLZ/Orte
- [ ] Option B: API-Integration (z.B. Swiss Post API)
- [ ] Hilfsfunktion: `getValidCitiesForZip(zip: string): string[]`

#### 1.3 URL-Validierung vorbereiten
- [ ] Server Action erstellen: `/app/actions/validation.ts`
- [ ] Funktion: `checkUrlReachability(url: string)` 
  - DNS-Lookup
  - Optional: HEAD-Request zum Prüfen der Erreichbarkeit
  - Timeout: 5 Sekunden

---

### Phase 2: React Hook Form Integration (Schritt 2)
**Ziel:** Echtzeit-Validierung in bestehende Forms einbauen

#### 2.1 Custom Hook erstellen
- [ ] Neue Datei: `/hooks/useRealtimeValidation.ts`
- [ ] Features:
  - Debouncing (500ms) für Eingaben
  - Loading States während Validierung
  - Error/Success States
  - Cache für bereits validierte Werte

```typescript
// Beispiel-Struktur
const useRealtimeValidation = (fieldName: string, validator: Function) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  
  // Implementierung mit useDebouncedValue
  // ...
}
```

#### 2.2 Zod Schema erweitern
- [ ] Datei: `/lib/validation/quote-schema.ts` anpassen
- [ ] `companyDataSchema` erweitern:
  - URL mit besserer Validierung (z.B. `.url()` statt `.string()`)
  - Custom Zod refinements für Adresse
  - Async Validierung für URL-Erreichbarkeit

---

### Phase 3: UI-Komponenten (Schritt 3)
**Ziel:** Visuelles Feedback für Benutzer

#### 3.1 Validierungs-Feedback-Komponente
- [ ] Neue Datei: `/components/forms/ValidationFeedback.tsx`
- [ ] States anzeigen:
  - ⏳ Wird validiert... (Spinner)
  - ✅ Gültig (grünes Häkchen)
  - ❌ Ungültig (rote Fehlermeldung)
  - 💡 Vorschläge (z.B. "Meinten Sie 'Zürich'?")

#### 3.2 Input-Wrapper-Komponente
- [ ] Neue Datei: `/components/forms/ValidatedInput.tsx`
- [ ] Features:
  - Integriert ValidationFeedback
  - Zeigt Icon rechts im Input
  - Unterstützt verschiedene Validierungs-Typen
  - Responsive & barrierefrei

```typescript
<ValidatedInput
  name="url"
  label="Website"
  type="url"
  validator={validateUrl}
  register={register}
  error={errors.url}
/>
```

---

### Phase 4: Integration in Wizard (Schritt 4)
**Ziel:** Validierung in bestehenden Offerten-Wizard einbauen

#### 4.1 Schritt 1: Unternehmensdaten
- [ ] Datei: `/app/(authenticated)/quotes/new/page.tsx`
- [ ] Felder mit Echtzeit-Validierung ausstatten:
  - **Adresse**: Prüfung auf gültige Schweizer Adresse-Struktur
  - **PLZ**: Echtzeit-Abgleich mit Datenbank
  - **Ort**: Automatische Vorschläge basierend auf PLZ
  - **URL**: Prüfung auf Gültigkeit und Erreichbarkeit

#### 4.2 Auto-Complete für Ort basierend auf PLZ
- [ ] Beim Eingeben der PLZ:
  - Automatisch passende Orte vorschlagen
  - Dropdown mit Optionen
  - Ort automatisch befüllen bei eindeutiger PLZ

---

### Phase 5: Performance-Optimierung (Schritt 5)
**Ziel:** Schnelle und effiziente Validierung

#### 5.1 Caching-Strategie
- [ ] Lokaler Cache für validierte Werte (Session Storage)
- [ ] TTL (Time To Live): 1 Stunde
- [ ] Cache-Keys: Hash von Input-Wert

#### 5.2 Debouncing & Throttling
- [ ] Debounce: 500ms für Text-Eingaben
- [ ] Throttle: API-Calls max. 1 pro Sekunde
- [ ] Abort-Controller für abgebrochene Requests

#### 5.3 Progressive Enhancement
- [ ] Funktioniert auch ohne JavaScript (Basis-Validierung)
- [ ] API-Fehler graceful handeln
- [ ] Fallback auf reine Zod-Validierung

---

### Phase 6: Testing & Refinement (Schritt 6)
**Ziel:** Robustheit und Benutzererfahrung sicherstellen

#### 6.1 Manuelle Tests
- [ ] Test mit gültigen Schweizer Adressen
- [ ] Test mit ungültigen Eingaben
- [ ] Test mit langsamer Verbindung (Network Throttling)
- [ ] Test der Auto-Complete-Funktionen

#### 6.2 Edge Cases abdecken
- [ ] Leere Felder
- [ ] Sehr lange Eingaben
- [ ] Sonderzeichen
- [ ] API-Timeouts
- [ ] Offline-Szenario

#### 6.3 UX-Feedback sammeln
- [ ] Loading States ausreichend sichtbar?
- [ ] Fehlermeldungen verständlich?
- [ ] Performance akzeptabel?

---

## Technischer Stack

### Neue Dependencies (falls benötigt)
```json
{
  "use-debounce": "^10.0.0",           // Debouncing für Inputs
  "validator": "^13.11.0",              // URL/String-Validierung
  "@tanstack/react-query": "^5.0.0"    // Caching & State Management (optional)
}
```

### API-Endpunkte (neu)
- `POST /api/validation/address` - Adress-Validierung
- `POST /api/validation/url` - URL-Erreichbarkeit prüfen
- `GET /api/validation/city?zip=8000` - Orte für PLZ abrufen

---

## Dateistruktur (neu/geändert)

```
/lib/validation/
  ├── realtime-validators.ts          (NEU)
  └── quote-schema.ts                 (ANPASSEN)

/lib/data/
  └── swiss-zip-codes.ts              (NEU)

/hooks/
  └── useRealtimeValidation.ts        (NEU)

/components/forms/
  ├── ValidationFeedback.tsx          (NEU)
  └── ValidatedInput.tsx              (NEU)

/app/actions/
  └── validation.ts                   (NEU)

/app/api/validation/
  ├── address/route.ts                (NEU)
  ├── url/route.ts                    (NEU)
  └── city/route.ts                   (NEU)

/app/(authenticated)/quotes/new/
  └── page.tsx                        (ANPASSEN)
```

---

## Zeitabschätzung

| Phase | Aufwand | Priorität |
|-------|---------|-----------|
| Phase 1: Vorbereitung | 2-3h | Hoch |
| Phase 2: Hook Integration | 1-2h | Hoch |
| Phase 3: UI-Komponenten | 2-3h | Hoch |
| Phase 4: Wizard-Integration | 2-3h | Mittel |
| Phase 5: Performance | 1-2h | Niedrig |
| Phase 6: Testing | 1-2h | Hoch |
| **Total** | **9-15h** | - |

---

## Nächster Schritt

**Womit möchtest du beginnen?**

1. **Option A (Empfohlen):** Phase 1 komplett durchführen → Fundament legen
2. **Option B:** Schneller Prototyp → Nur URL-Validierung als Proof of Concept
3. **Option C:** Diskussion → Welche Felder sind am wichtigsten?

Bitte entscheide dich für eine Option, dann starten wir mit der Umsetzung!
