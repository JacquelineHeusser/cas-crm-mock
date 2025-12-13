# LLM-Integration mit OpenAI und Together.ai: Implementierungsanleitung

Diese Anleitung beschreibt detailliert, wie LLM-APIs (OpenAI und Together.ai) für Sprachtranskription, Chat-Completions und Dokumentenextraktion in das CRM-System integriert werden.

> **⚠️ Wichtiger Hinweis für das ausführende LLM:**
> Bevor Du mit der Implementierung beginnst, lies zwingend:
> 1. Die **globalen Regeln** (sofern im System vorhanden)
> 2. Die **lokalen Regeln** im Ordner `.windsurf/rules/` (alle Dateien lesen)
>
> Diese Regeln definieren Code-Style, Architektur-Patterns und Projekt-Konventionen, die bei der Implementierung beachtet werden müssen.

> **💡 Hinweis zu den Use Cases:**
> Die hier implementierten Features dienen als **Referenzimplementierung** für weitere LLM-basierte Features:
> - **Use Case 1: Sprachtranskription** mit OpenAI Whisper und Together.ai
> - **Use Case 2: Event-Zusammenfassung** mit Chat Completions (GPT-5.1, Llama, etc.)
> - **Use Case 3: Lebenslauf-Extraktion** mit PDF-Parsing und strukturierter Datenextraktion
>
> Nutze diese als Vorlagen für weitere LLM-Features nach demselben Muster.

## 📋 Inhaltsverzeichnis

1. [Architektur-Übersicht](#architektur-übersicht)
2. [Technologie-Stack](#technologie-stack)
3. [Dependencies](#dependencies)
4. [Dateistruktur](#dateistruktur)
5. [Implementierungs-Reihenfolge](#implementierungs-reihenfolge)
6. [Testing](#testing)

---

## Architektur-Übersicht

Die LLM-Integration basiert auf einem modularen Ansatz mit klarer Trennung von Frontend und Backend:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND KOMPONENTEN                              │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  MicrophoneButton (Sprachaufnahme)                             │ │
│  │  - MediaRecorder API                                           │ │
│  │  - Model-Auswahl (Whisper, GPT-5.1)                            │ │
│  │  - FormData Upload                                             │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  EventSummaryButton (LLM-Zusammenfassung)                      │ │
│  │  - Fetch Events                                                │ │
│  │  - Display Results                                             │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  CvUploadButton (Lebenslauf-Extraktion)                        │ │
│  │  - PDF Upload via FileUpload-Komponente                        │ │
│  │  - LLM-basierte Datenextraktion                                │ │
│  │  - CvViewer für Ergebnis-Anzeige                               │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ├────────────────────┬─────────────────────────┐
                       │                    │                         │
        ┌──────────────▼─────────┐  ┌───────▼──────────┐  ┌───────────▼────────┐
        │   API ROUTES           │  │  LLM SERVICE     │  │  DATABASE          │
        │                        │  │  (lib/ai.ts)     │  │  (Prisma)          │
        │ /api/transcribe        │  │                  │  │                    │
        │ /api/veranstaltungen/summarize  │  │ - OpenAI Client  │  │ - Event Queries    │
        │ /api/cv/extract        │  │ - Together.ai    │  │ - Contact.cv       │
        │                        │  │ - PDF Processing │  │                    │
        └────────────────────────┘  └──────────────────┘  └────────────────────┘
```

### Datenflüsse:

**Use Case 1: Sprachtranskription (Customer Notes)**
1. User klickt Mikrofon-Symbol → Audio-Aufnahme startet
2. User stoppt Aufnahme → Audio-Blob wird erstellt
3. FormData mit Audio-File wird an `/api/transcribe` gesendet
4. API ruft OpenAI/Together.ai Whisper API auf
5. Transkribierter Text wird zurückgegeben
6. Text wird in Notes-Feld eingefügt

**Use Case 2: Event-Zusammenfassung**
1. User klickt "Zusammenfassung"-Button
2. Frontend lädt zukünftige Events von API
3. Event-Daten werden formatiert und an `/api/veranstaltungen/summarize` gesendet
4. API erstellt Prompt mit Event-Daten
5. OpenAI oder Together.ai LLM generiert Zusammenfassung (je nach Konfiguration)
6. Text wird in aufklappendem Bereich angezeigt

**Use Case 3: Lebenslauf-Extraktion**
1. User klickt "Lebenslauf hochladen" in der Teilnehmerliste eines Events
2. PDF-Datei wird hochgeladen (via bestehende FileUpload-Komponente)
3. Button wechselt zu "Lebenslauf wird ausgelesen" (disabled)
4. PDF wird an `/api/cv/extract` gesendet mit Base64-kodiertem Inhalt
5. LLM extrahiert strukturierte Daten aus dem PDF
6. Extrahierte JSON-Daten werden im neuen `cv`-Feld des Contact-Models gespeichert
7. Button wechselt zu "Daten anschauen" (enabled)
8. Klick öffnet CV-Viewer-Seite mit extrahierten Daten und PDF-Anzeige

### Vorteile:

1. **Modularität**: Wiederverwendbare Komponenten (MicrophoneButton, FileUpload, PdfViewer)
2. **Flexibilität**: Mehrere LLM-Provider (OpenAI, Together.ai)
3. **Type-Safety**: TypeScript Ende-zu-Ende
4. **Skalierbarkeit**: Einfach erweiterbar für weitere Use Cases
5. **Kosteneffizienz**: Together.ai für kostengünstige Open-Source Modelle
6. **Wiederverwendung**: Bestehende File-Storage-Infrastruktur nutzen

---

## Technologie-Stack

### Backend
- **Next.js 16**: App Router mit API Routes
- **OpenAI SDK**: Offizielle Node.js Library für Whisper/GPT
- **Together.ai SDK**: Open-Source Modelle (Llama, Qwen, etc.)
- **Prisma**: ORM für Event-Queries und Contact-Updates
- **TypeScript**: Vollständige Type-Safety

### Frontend
- **React 19**: Client-Komponenten für UI
- **MediaRecorder API**: Native Browser-Audio-Aufnahme
- **FormData**: File-Upload für Audio und PDFs
- **fix-webm-duration**: WebM-Fixes für Safari/Chrome

### LLM-Provider
- **OpenAI**: Whisper (transcription), GPT-5.1 instant, GPT-5.1 thinking (chat)
- **Together.ai**: Whisper-large-v3, Llama, Qwen, DeepSeek (chat)

### File Storage (für CV-Upload)
- **Supabase Storage**: Bestehende Infrastruktur aus FILE_STORAGE_IMPLEMENTATION.md
- **react-pdf / pdfjs-dist**: PDF-Anzeige (bereits installiert)

---

## Dependencies

### Neue Dependencies installieren

```bash
npm install openai together-ai fix-webm-duration
```

### Nur hinzuzufügende Dependencies

Die folgenden Dependencies müssen zusätzlich zum bestehenden `package.json` installiert werden:

```json
{
  "dependencies": {
    "openai": "^6.9.1",
    "together-ai": "^0.30.0",
    "fix-webm-duration": "^1.0.5"
  }
}
```

> **Hinweis:** Alle anderen Dependencies (Prisma, Next.js, Supabase, react-pdf, pdfjs-dist, etc.) sind bereits im Projekt vorhanden und dürfen nicht verändert werden.

### Environment Variables (.env)

```bash
# ==================== LLM API KEYS ====================

# OpenAI API Key (für Whisper Transcription + GPT Chat)
OPENAI_API_KEY=sk-proj-...

# Together.ai API Key (für Whisper + Open-Source Chat Models)
TOGETHERAI_API_KEY=...

# ==================== PROVIDER AUSWAHL ====================

# Chat Completion Provider: 'openai' oder 'together'
LLM_PROVIDER=together

# ==================== MODEL DEFAULTS ====================

# Transcription Models (Server-side defaults)
OPENAI_TRANSCRIBE_MODEL=gpt-4o-mini-transcribe
TOGETHERAI_TRANSCRIBE_MODEL=openai/whisper-large-v3

# Chat Models (je nach LLM_PROVIDER wird das entsprechende verwendet)
OPENAI_CHAT_MODEL=gpt-5.1-instant
TOGETHERAI_CHAT_MODEL=meta-llama/Llama-3.3-70B-Instruct-Turbo

# ==================== CLIENT-SIDE EXPOSED ====================

# Verfügbare Transcription-Modelle (Dropdown im Frontend)
NEXT_PUBLIC_TRANSCRIBE_MODELS=openai/whisper-large-v3,gpt-4o-mini-transcribe,gpt-4o-transcribe

# Verfügbare Chat-Modelle (Dropdown im Frontend)
NEXT_PUBLIC_LLM_MODELS=gpt-5.1-instant,gpt-5.1-thinking,meta-llama/Llama-3.3-70B-Instruct-Turbo,openai/gpt-oss-20b
```

---

## Dateistruktur

```
project/
├── app/
│   ├── api/
│   │   ├── transcribe/
│   │   │   └── route.ts                 # POST - Audio Transcription
│   │   ├── veranstaltungen/
│   │   │   └── summarize/
│   │   │       └── route.ts             # POST - Event Summary (LLM)
│   │   └── cv/
│   │       └── extract/
│   │           └── route.ts             # POST - CV Extraction (LLM)
│   │
│   ├── kunden/
│   │   └── [id]/
│   │       └── page.tsx                 # Customer Detail mit Notes + Mikrofon
│   │
│   ├── veranstaltungen/
│   │   ├── page.tsx                     # Events Übersicht mit Summary-Button
│   │   └── [id]/
│   │       └── participants/
│   │           └── page.tsx             # Teilnehmerliste mit CV-Upload
│   │
│   ├── kontakte/
│   │   └── [id]/
│   │       └── cv/
│   │           └── page.tsx             # CV-Viewer Seite
│   │
│   └── lib/
│       └── ai.ts                        # AI Service Layer (OpenAI, Together.ai)
│
├── components/
│   ├── MicrophoneButton.tsx             # Wiederverwendbare Audio-Komponente
│   └── CvUploadButton.tsx               # CV-Upload mit Status-Anzeige
│
└── prisma/
    └── schema.prisma                    # Contact.cv Feld hinzufügen
```

---

## Implementierungs-Reihenfolge

### Mensch: Schritt 1: Environment Setup und API Keys

#### 1.1 API Keys beschaffen

**OpenAI API Key:**
1. Gehe zu https://platform.openai.com/
2. Registriere dich oder melde dich an
3. Navigiere zu **API Keys** (https://platform.openai.com/api-keys)
4. Klicke auf **"Create new secret key"**
5. Gib einen Namen ein (z.B. "CRM-LLM-Integration")
6. Kopiere den Key (beginnt mit `sk-proj-...`) - **er wird nur einmal angezeigt!**
7. Speichere den Key sicher (z.B. in Passwort-Manager)

**Together.ai API Key:**
1. Gehe zu https://api.together.ai/
2. Klicke auf **"Sign up"** (kostenlose Registrierung)
3. Bestätige deine E-Mail-Adresse
4. Nach Login: Navigiere zu **Settings → API Keys** (https://api.together.ai/settings/api-keys)
5. Klicke auf **"Create API Key"**
6. Gib einen Namen ein (z.B. "CRM-Integration")
7. Kopiere den generierten Key
8. Speichere den Key sicher

> **💡 Tipp:** Together.ai bietet im Free Tier $5 Gratis-Guthaben, danach Pay-as-you-go. OpenAI benötigt sofort Zahlungsinformationen.

#### 1.2 Environment-Datei erstellen

Erstelle/erweitere `.env` im Projekt-Root mit den oben genannten Environment Variables.

**Wichtig:**
- `.env` darf **NICHT** in Git committed werden!
- Prüfe ob `.env` in `.gitignore` enthalten ist
- Für Production: Umgebungsvariablen in Hosting-Platform (Vercel, Railway, etc.) setzen

---

### LLM: Schritt 2: Dependencies installieren

```bash
npm install openai together-ai fix-webm-duration
```

---

### LLM: Schritt 3: AI Service Layer erstellen

**Datei:** `app/lib/ai.ts`

**Zielsetzung:**
Zentraler Service-Layer für alle LLM-Interaktionen. Kapselt die Komplexität der verschiedenen Provider und bietet einheitliche Interfaces.

**Funktionalität im Detail:**

1. **`getOpenAIClient()`**
   - Factory-Funktion für OpenAI-Client-Instanzen
   - Liest API-Key aus Environment-Variablen
   - Wirft Fehler bei fehlendem Key mit klarer Fehlermeldung

2. **`getTogetherClient()`**
   - Factory-Funktion für Together.ai-Client-Instanzen
   - Analoges Verhalten zu OpenAI-Client

3. **`transcribeWithOpenAI(audioFile, model)`**
   - Nimmt Audio-File (Web API File) entgegen
   - Ruft OpenAI Whisper API auf
   - Konfiguriert Sprache auf Deutsch (`language: 'de'`)
   - Gibt transkribierten Text zurück

4. **`transcribeWithTogether(audioFile, model)`**
   - Analoges Verhalten für Together.ai Whisper
   - Unterstützt `openai/whisper-large-v3` Modell

5. **`AIMessage` Interface**
   - Definiert Struktur für Chat-Nachrichten: `role`, `content`
   - Rollen: `system`, `user`, `assistant`

6. **`ChatCompletionOptions` Interface**
   - `model`: Modell-Identifier (z.B. `gpt-5.1-instant`)
   - `messages`: Array von `AIMessage`
   - `maxTokens`: Optional, Default 2048
   - `temperature`: Optional, Default 0.7
   - `provider`: Optional, überschreibt Auto-Detection

7. **`createChatCompletionOpenAI(options)`**
   - Ruft OpenAI Chat Completions API auf
   - Extrahiert Antwort-Text aus Response

8. **`createChatCompletionTogether(options)`**
   - Ruft Together.ai Chat Completions API auf
   - Identisches Interface wie OpenAI-Variante

9. **`createChatCompletion(options)`**
   - Generische Funktion mit automatischer Provider-Erkennung
   - Priorität: 1. Explizit in `options.provider`, 2. `LLM_PROVIDER` Env-Variable, 3. Auto-Detection (gpt-* → OpenAI, sonst Together)
   - Delegiert an passende Provider-Funktion

---

### LLM: Schritt 4: Transcription API Route erstellen

**Datei:** `app/api/transcribe/route.ts`

**Zielsetzung:**
REST-Endpoint für Audio-Transkription. Nimmt Audio-Dateien via FormData entgegen und gibt transkribierten Text zurück.

**Funktionalität im Detail:**

1. **Request-Handling:**
   - Parst FormData aus Request
   - Extrahiert `file` (Audio-Blob) und `model` (String, Default: `gpt-4o-mini-transcribe`)

2. **Validierung:**
   - Prüft Vorhandensein der Audio-Datei
   - Prüft Dateigröße (max 25MB, OpenAI-Limit)
   - Prüft MIME-Type (unterstützt: webm, wav, mp3, mp4, mpeg, m4a, ogg)
   - Gibt HTTP 400 mit spezifischer Fehlermeldung bei Validierungsfehlern

3. **Provider-Routing:**
   - Modelle mit Prefix `openai/` → Together.ai
   - Modelle `gpt-4o-transcribe` oder `gpt-4o-mini-transcribe` → OpenAI
   - Fallback → Together.ai

4. **Response:**
   - Erfolg (200): `{ text, model, fileName, fileSize }`
   - Fehler (400/500): `{ error, details? }`

5. **Runtime-Konfiguration:**
   - `runtime = 'nodejs'` für Server-seitige Ausführung
   - `dynamic = 'force-dynamic'` für keine statische Optimierung

---

### LLM: Schritt 5: Event Summary API Route erstellen

**Datei:** `app/api/veranstaltungen/summarize/route.ts`

**Zielsetzung:**
Generiert KI-basierte Zusammenfassungen aller zukünftigen Events. Nutzt Prisma für Datenbankabfragen und LLM für Textgenerierung.

**Funktionalität im Detail:**

1. **Request-Parsing:**
   - Akzeptiert optionales `model` im JSON-Body
   - Bestimmt Default-Model basierend auf `LLM_PROVIDER` Environment-Variable
   - OpenAI-Default: `gpt-5.1-instant`
   - Together-Default: `meta-llama/Llama-3.3-70B-Instruct-Turbo`

2. **Datenbank-Abfrage:**
   - Lädt alle Events mit `startAt >= now()` und `status != 'ARCHIVED'`
   - Inkludiert Registrations (Status 'REGISTERED') für Teilnehmerzählung
   - Inkludiert Host-Customer für Veranstalter-Name
   - Sortiert nach Startdatum aufsteigend

3. **Daten-Aufbereitung:**
   - Extrahiert relevante Event-Infos: Titel, Datum, Zeit, Teilnehmer, Kapazität, Host, Kategorie, Online-Flag
   - Formatiert Datum deutsch (DD.MM.YYYY)
   - Berechnet Gesamt-Statistiken

4. **Prompt-Engineering:**
   - System-Prompt: Definiert Rolle als CRM-Assistent, Sprache Deutsch, professioneller Ton
   - User-Prompt: Strukturierte Event-Daten mit Kontext und Instruktionen für gewünschtes Output-Format
   - Fordert: Überblick, Kennzahlen, Highlights, Empfehlungen
   - Format: Fliesstext, 3-5 Absätze

5. **LLM-Aufruf:**
   - Nutzt `createChatCompletion` aus ai.ts
   - maxTokens: 1024, temperature: 0.7

6. **Response:**
   - Erfolg: `{ summary, eventCount, totalParticipants, totalCapacity, model, veranstaltungen }`
   - Bei 0 Events: Vorgefertigte Nachricht ohne LLM-Aufruf
   - Fehler: Zod-Validierungsfehler (400) oder Server-Fehler (500)

---

### LLM: Schritt 6: MicrophoneButton Komponente erstellen

**Datei:** `components/MicrophoneButton.tsx`

**Zielsetzung:**
Wiederverwendbare React-Komponente für Sprachaufnahme und Transkription. Kapselt MediaRecorder-Logik, Model-Auswahl und API-Kommunikation.

**Funktionalität im Detail:**

1. **Props-Interface:**
   - `onText(text)`: Callback für transkribierten Text
   - `onError(error)`: Callback für Fehler
   - `className`: Optionale CSS-Klassen
   - `compact`: Boolean für kompakte Darstellung (Default: true)
   - `initialModel`: Vorausgewähltes Modell
   - `modelOptions`: Array verfügbarer Modelle (sonst aus ENV)

2. **State-Management:**
   - `recording`: Boolean, Aufnahme läuft
   - `uploading`: Boolean, Transkription läuft
   - `error`: String oder null
   - `showCfg`: Boolean, Model-Dropdown sichtbar
   - `selectedModel`: Aktuell gewähltes Modell

3. **Refs:**
   - `recorderRef`: MediaRecorder-Instanz
   - `chunksRef`: Array für Audio-Chunks
   - `recordingStartTimeRef`: Startzeit für Dauer-Berechnung

4. **Kernfunktionen:**
   - `startRecording()`: Fordert Mikrofon-Zugriff, initialisiert MediaRecorder, startet Aufnahme
   - `stopRecording()`: Stoppt MediaRecorder, triggert ondataavailable und onstop
   - `cleanup()`: Stoppt alle Tracks, bereinigt State
   - `getSupportedMime()`: Ermittelt besten Audio-MIME-Type des Browsers
   - `sendForTranscription(blob)`: Erstellt FormData, sendet an API, ruft Callbacks

5. **WebM-Duration-Fix:**
   - Nutzt `fix-webm-duration` Library für korrektes Seeking
   - Wichtig für Safari/Chrome-Kompatibilität

6. **UI-Elemente:**
   - Mikrofon-Button: Mic-Icon im Ruhezustand, Stop-Icon während Aufnahme
   - Settings-Button: Zahnrad für Model-Dropdown (im compact-Modus)
   - Model-Dropdown: Absolut positioniert, schließt nach Auswahl
   - Status-Anzeigen: "Transkribiere..." und Fehler-Indikator

7. **Styling:**
   - Nutzt Tailwind-Klassen
   - Rot-Highlight während Aufnahme
   - Disabled-State während Upload

---

### LLM: Schritt 7: Customer Detail Page Integration

**Datei:** `app/kunden/[id]/page.tsx` (Erweiterung bestehender Datei)

**Zielsetzung:**
Integration des MicrophoneButtons in das Notes-Feld der Kunden-Detailseite.

**Funktionalität im Detail:**

1. **Import hinzufügen:**
   - MicrophoneButton-Komponente importieren

2. **State für Notes:**
   - `notes` State mit initialem Wert aus Customer-Daten

3. **Integration im UI:**
   - Positionierung des MicrophoneButtons absolut oben rechts im Textarea-Container
   - `onText`-Handler: Appended transkribierten Text an bestehende Notes
   - `onError`-Handler: Console-Log und Alert für Benutzer-Feedback

4. **Notes speichern:**
   - Button "Notizen speichern" 
   - PATCH-Request an `/api/kunden/{id}` mit `notes` im Body

---

### LLM: Schritt 8: Events Page mit Summary-Button

**Datei:** `app/veranstaltungen/page.tsx` (Erweiterung bestehender Datei)

**Zielsetzung:**
Integration eines LLM-Zusammenfassungs-Features in die Events-Übersichtsseite.

**Funktionalität im Detail:**

1. **State-Management:**
   - `showSummary`: Boolean für Anzeige des Summary-Bereichs
   - `summary`: Object mit summary, eventCount, totalParticipants, model
   - `loading`: Boolean während API-Aufruf
   - `error`: Fehlermeldung oder null
   - `selectedModel`: Gewähltes LLM-Modell

2. **Model-Auswahl:**
   - Dropdown mit verfügbaren Modellen aus `NEXT_PUBLIC_LLM_MODELS`
   - Fallback: Hartcodierte Default-Liste

3. **`generateSummary()` Funktion:**
   - Setzt Loading-State
   - POST-Request an `/api/veranstaltungen/summarize` mit gewähltem Model
   - Bei Erfolg: Summary-State setzen, Bereich anzeigen
   - Bei Fehler: Error-State setzen

4. **UI-Elemente:**
   - Header mit Titel "Veranstaltungen" und Controls rechts
   - Model-Dropdown (select Element)
   - Summary-Button mit Loader-Animation während Generierung
   - Error-Display: Rote Box mit Fehlermeldung
   - Summary-Display: Gradient-Box mit Zusammenfassung, X-Button zum Schließen, Kennzahlen-Footer

---

### LLM: Schritt 9: Prisma Schema für CV-Feld erweitern

**Datei:** `prisma/schema.prisma` (Erweiterung)

**Zielsetzung:**
Erweiterung des Contact-Models um ein `cv`-Feld zur Speicherung extrahierter Lebenslaufdaten.

**Änderung:**
- Neues Feld `cv` im Contact-Model
- Typ: `String?` (nullable)
- Speichert JSON-String mit extrahierten CV-Daten
- Kein separates Schema (flexible JSON-Struktur)

**Nach Schema-Änderung ausführen:**
```bash
npx prisma db push --force-reset
npx prisma db seed
```

---

### LLM: Schritt 10: CV Extraction API Route erstellen

**Datei:** `app/api/cv/extract/route.ts`

**Zielsetzung:**
REST-Endpoint für die Extraktion strukturierter Daten aus Lebenslauf-PDFs mittels LLM.

**Funktionalität im Detail:**

1. **Request-Format:**
   - POST mit JSON-Body
   - `contactId`: UUID des Contacts
   - `fileId`: UUID des hochgeladenen Files (aus File-Tabelle)
   - `pdfBase64`: Base64-encodierter PDF-Inhalt

2. **PDF-Verarbeitung:**
   - Dekodiert Base64 zu Buffer
   - Für Modelle mit Vision-Support: PDF-Seiten als Images übergeben
   - Für Text-Modelle: PDF-Text extrahieren (falls möglich)

3. **System-Prompt für Extraktion:**
   Der Prompt soll das LLM anweisen, folgende Daten als JSON zu extrahieren:
   ```
   Du bist ein Experte für die Analyse von Lebensläufen. Extrahiere die folgenden 
   Informationen aus dem übergebenen Lebenslauf-PDF und gib sie als valides JSON zurück.
   
   Gewünschtes JSON-Format:
   {
     "firstName": "Vorname",
     "lastName": "Nachname",
     "age": 35,
     "nativeLanguages": ["Deutsch", "Englisch"],
     "highestDegree": "Master of Science in Informatik",
     "workHistory": [
       {
         "from": "2020",
         "to": "2024",
         "employer": "Beispiel AG",
         "jobTitle": "Senior Software Engineer"
       },
       {
         "from": "2018",
         "to": "2020",
         "employer": "Startup GmbH",
         "jobTitle": "Software Developer"
       }
     ]
   }
   
   Wichtig:
   - workHistory muss nach Jahr absteigend sortiert sein (neueste zuerst)
   - Bei fehlenden Angaben: null verwenden
   - Alter berechnen falls Geburtsdatum angegeben
   - Gib NUR valides JSON zurück, keine Erklärungen
   ```

4. **LLM-Aufruf:**
   - Nutzt `createChatCompletion` mit hohem maxTokens (4096) für lange CVs
   - Temperature: 0.1 für konsistente strukturierte Ausgabe
   - Model: Aus Environment oder Request

5. **Response-Parsing:**
   - Extrahiert JSON aus LLM-Antwort
   - Validiert Grundstruktur
   - Fehlerbehandlung für ungültiges JSON

6. **Datenbank-Update:**
   - Speichert extrahiertes JSON als String im `cv`-Feld des Contacts
   - Prisma-Update mit `contactId`

7. **Response:**
   - Erfolg (200): `{ success: true, data: extractedCvData, contactId }`
   - Fehler (400/500): `{ error, details }`

---

### LLM: Schritt 11: CvUploadButton Komponente erstellen

**Datei:** `components/CvUploadButton.tsx`

**Zielsetzung:**
Button-Komponente mit drei Status-Zuständen für Lebenslauf-Upload und -Extraktion in der Teilnehmerliste.

**Funktionalität im Detail:**

1. **Props-Interface:**
   - `contactId`: UUID des Contacts
   - `eventId`: UUID des Events (für File-Zuordnung)
   - `existingCv`: Optionales bestehendes CV-JSON (aus Contact)
   - `existingFileId`: Optionale File-ID falls bereits hochgeladen
   - `onExtractionComplete`: Callback nach erfolgreicher Extraktion

2. **Status-Enum:**
   ```typescript
   type CvStatus = 'upload' | 'extracting' | 'view';
   ```

3. **State-Management:**
   - `status`: Aktueller CvStatus
   - `isUploading`: Boolean während File-Upload
   - `error`: Fehlermeldung oder null
   - `fileId`: ID des hochgeladenen Files

4. **Button-Darstellung je Status:**
   
   **Status 'upload' (Initial):**
   - Text: "Lebenslauf hochladen"
   - Icon: Upload-Icon (lucide-react)
   - Enabled, klickbar
   - Öffnet File-Dialog für PDF-Auswahl
   
   **Status 'extracting':**
   - Text: "Lebenslauf wird ausgelesen"
   - Icon: Spinner/Loader-Animation
   - Disabled, nicht klickbar
   - Grau/gedimmt dargestellt
   
   **Status 'view':**
   - Text: "Daten anschauen"
   - Icon: Eye-Icon oder Dokument-Icon
   - Enabled, klickbar
   - Navigiert zu CV-Viewer-Seite

5. **Upload-Flow:**
   - Nutzt bestehende FileUpload-Logik aus FILE_STORAGE_IMPLEMENTATION.md
   - EntityType: `contact`
   - EntityId: `contactId`
   - FileType: Neuer Enum-Wert `CV` (in FileType-Enum hinzufügen)
   - Nach erfolgreichem Upload: Status → 'extracting', Extraktion starten

6. **Extraktion-Flow:**
   - Lädt PDF-Bytes vom Storage
   - Konvertiert zu Base64
   - POST an `/api/cv/extract`
   - Bei Erfolg: Status → 'view', Callback aufrufen
   - Bei Fehler: Status → 'upload', Fehlermeldung anzeigen

7. **View-Navigation:**
   - Klick navigiert zu `/kontakte/{contactId}/cv`
   - Oder öffnet Modal (je nach UX-Entscheidung)

---

### LLM: Schritt 12: Teilnehmerliste um CV-Spalte erweitern

**Datei:** `app/veranstaltungen/[id]/participants/page.tsx` (oder entsprechende Komponente)

**Zielsetzung:**
Integration der CvUploadButton-Komponente in die Teilnehmerliste eines Events.

**Funktionalität im Detail:**

1. **Tabellen-Erweiterung:**
   - Neue Spalte "Lebenslauf" hinzufügen
   - Position: Nach anderen Kontakt-Spalten

2. **Daten-Loading:**
   - Teilnehmer-Query um Contact-Daten erweitern
   - Inkludiert `cv`-Feld und zugehörige Files (FileType: CV)

3. **Spalten-Rendering:**
   - Für jeden Teilnehmer: CvUploadButton rendern
   - Props: contactId, eventId, existingCv (aus Contact), existingFileId (aus Files)

4. **Status-Ermittlung:**
   - Wenn `contact.cv` vorhanden → Status 'view'
   - Wenn CV-File vorhanden aber kein `cv`-Feld → Status 'extracting' (inkonsistent, Retry)
   - Sonst → Status 'upload'

5. **Refresh nach Extraktion:**
   - `onExtractionComplete` Callback refresht Teilnehmerliste
   - Oder optimistisches UI-Update

---

### LLM: Schritt 13: CV-Viewer Seite erstellen

**Datei:** `app/kontakte/[id]/cv/page.tsx`

**Zielsetzung:**
Dedizierte Seite zur Anzeige extrahierter Lebenslauf-Daten mit PDF-Vorschau.

**Funktionalität im Detail:**

1. **Daten-Loading:**
   - Lädt Contact mit `cv`-Feld via Prisma
   - Lädt zugehörige CV-Files (EntityType: contact, FileType: CV)
   - Parsed `cv` JSON-String zu Object

2. **Layout (Zwei-Spalten):**
   
   **Linke Spalte: Extrahierte Daten**
   - Card/Box mit strukturierter Darstellung:
   - **Persönliche Daten:** Vorname, Nachname, Alter
   - **Sprachen:** Liste der Muttersprachen als Tags/Chips
   - **Bildung:** Höchster Abschluss
   - **Berufserfahrung:** Timeline-Darstellung der Work-History
     - Zeitraum (von-bis)
     - Arbeitgeber
     - Position/Funktion
   
   **Rechte Spalte: PDF-Viewer**
   - Nutzt bestehende `PdfViewer`-Komponente aus FILE_STORAGE_IMPLEMENTATION.md
   - URL aus Storage-Path generieren via `getFileUrl()`
   - Download-Button
   - Zoom und Navigation

3. **Empty-State:**
   - Falls kein CV vorhanden: Hinweis mit Link zurück zur Teilnehmerliste

4. **Aktionen:**
   - "Zurück zur Teilnehmerliste" oder Breadcrumb-Navigation
   - Optional: "Neu extrahieren" Button für Re-Analyse

5. **Styling:**
   - Responsive: Auf Mobile Spalten untereinander
   - Work-History als visuelle Timeline mit Linien/Punkten
   - Tags für Sprachen in Pill-Form

---

### LLM: Schritt 14: FileType-Enum erweitern

**Datei:** `prisma/schema.prisma` (Erweiterung)

**Änderung:**
```prisma
enum FileType {
  FLYER       // Veranstaltungsflyer (PDF)
  IMAGE       // Bild
  DOCUMENT    // Dokument
  CV          // Lebenslauf (NEU)
  OTHER       // Sonstiges
}
```

**Nach Schema-Änderung ausführen:**
```bash
npx prisma db push --force-reset
npx prisma db seed
```

---

### LLM: Schritt 15: Finale Validierung

> **⚠️ WICHTIG:** Dieser Schritt ist zwingend vor Abschluss der Implementierung durchzuführen!

**Prüfung 1: Development Server starten**
```bash
npm run dev
```
- Warte bis Server auf Port 3000 läuft
- Prüfe Console auf Fehler
- Bei Fehlern: Beheben und erneut prüfen

**Prüfung 2: Production Build**
```bash
npm run build
```
- Build muss erfolgreich durchlaufen (Exit-Code 0)
- Keine TypeScript-Fehler
- Keine Build-Warnungen die auf Fehler hindeuten
- Bei Fehlern: Beheben und erneut prüfen

**Erst wenn alle Prüfungen erfolgreich sind, ist die Implementierung abgeschlossen.**

---

## Testing

### Mensch: Test 1 - Sprachtranskription (Customer Notes)

#### Voraussetzungen:
- OPENAI_API_KEY oder TOGETHERAI_API_KEY in `.env`
- Mikrofon-Zugriff im Browser erlauben
- Customer mit gültiger ID

#### Test-Schritte:

1. **Navigiere zur Customer Detail Page:**
   ```
   http://localhost:3000/kunden/[CUSTOMER-ID]
   ```

2. **Mikrofon-Button testen:**
   - Klicke auf Mikrofon-Symbol neben Notes-Feld
   - Browser fragt nach Mikrofon-Berechtigung → Erlauben
   - Sprich einen Test-Satz (z.B. "Kunde möchte Angebot für neue Software")
   - Klicke erneut auf Button (jetzt Stop-Symbol) zum Beenden
   - Warte auf Transkription (ca. 2-5 Sekunden)

3. **Erwartetes Ergebnis:**
   - Transkribierter Text erscheint im Notes-Feld
   - Text kann editiert werden
   - "Notizen speichern" Button funktioniert

### Mensch: Test 2 - Event-Zusammenfassung (LLM)

#### Voraussetzungen:
- OPENAI_API_KEY oder TOGETHERAI_API_KEY in `.env` (je nach LLM_PROVIDER)
- Mindestens 1 zukünftiges Event in Datenbank

#### Test-Schritte:

1. **Navigiere zur Events Page:**
   ```
   http://localhost:3000/veranstaltungen
   ```

2. **Zusammenfassung generieren:**
   - Klicke auf "Zusammenfassung der geplanten Anlässe" Button
   - Warte auf LLM-Response (ca. 3-10 Sekunden)

3. **Erwartetes Ergebnis:**
   - Aufklappbarer Bereich mit Zusammenfassung erscheint
   - Text ist gut formatiert und auf Deutsch
   - Kennzahlen (Anzahl Events, Teilnehmende) sind korrekt

### Mensch: Test 3 - Lebenslauf-Upload und Extraktion

#### Voraussetzungen:
- OPENAI_API_KEY oder TOGETHERAI_API_KEY in `.env`
- Event mit mindestens einem registrierten Teilnehmer
- Test-PDF mit Lebenslauf (kann fiktiv sein)

#### Test-Schritte:

1. **Navigiere zur Teilnehmerliste eines Events:**
   ```
   http://localhost:3000/veranstaltungen/[EVENT-ID]
   ```

2. **Lebenslauf hochladen:**
   - Finde die neue Spalte "Lebenslauf"
   - Klicke auf "Lebenslauf hochladen" bei einem Teilnehmer
   - Wähle eine PDF-Datei aus

3. **Extraktion beobachten:**
   - Button wechselt zu "Lebenslauf wird ausgelesen" (disabled)
   - Warte auf Extraktion (ca. 5-15 Sekunden je nach PDF-Länge)
   - Button wechselt zu "Daten anschauen"

4. **Extrahierte Daten prüfen:**
   - Klicke auf "Daten anschauen"
   - CV-Viewer Seite öffnet sich
   - Prüfe ob extrahierte Daten korrekt sind
   - Prüfe PDF-Vorschau rechts

5. **Erwartetes Ergebnis:**
   - Persönliche Daten korrekt extrahiert
   - Berufserfahrung als Timeline dargestellt
   - PDF im Viewer ladbar und navigierbar