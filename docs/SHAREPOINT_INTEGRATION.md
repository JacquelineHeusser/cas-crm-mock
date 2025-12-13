# SharePoint → Supabase Integration

## Übersicht

Diese Integration synchronisiert automatisch neue Quote-Einträge aus einer SharePoint-Liste in die Supabase-Datenbank.

```
SharePoint Liste (neuer Eintrag)
    ↓
Power Automate Flow (Trigger)
    ↓
HTTP POST → /api/webhooks/sharepoint-quote
    ↓
Validierung & Risk Score Berechnung
    ↓
Quote in Supabase erstellen
```

---

## 📋 SharePoint Liste Struktur

### Erforderliche Spalten

| Spaltenname | Typ | Pflicht | Beschreibung |
|-------------|-----|---------|--------------|
| **Title** | Single line text | ✅ | Firmenname |
| **Address** | Single line text | ✅ | Adresse |
| **Zip** | Single line text | ✅ | Postleitzahl |
| **City** | Single line text | ✅ | Stadt |
| **Country** | Single line text | ✅ | Land |
| **URL** | Hyperlink | ❌ | Website |
| **Industry** | Choice | ✅ | Branche (siehe Liste unten) |
| **Employees** | Number | ✅ | Anzahl Mitarbeiter |
| **Revenue** | Number | ✅ | Umsatz in CHF |

### Cyber Risikoprofil

| Spaltenname | Typ | Pflicht | Beschreibung |
|-------------|-----|---------|--------------|
| **ECommercePercentage** | Choice | ✅ | 0%, 1-25%, 26-50%, etc. |
| **ForeignRevenuePercentage** | Choice | ✅ | 0%, 1-25%, 26-50%, etc. |
| **NoForeignSubsidiaries** | Choice | ✅ | Trifft zu / Trifft nicht zu |
| **NoRejectedInsurance** | Choice | ✅ | Trifft zu / Trifft nicht zu |

### Cyber-Sicherheit

| Spaltenname | Typ | Pflicht | Beschreibung |
|-------------|-----|---------|--------------|
| **HadCyberIncidents** | Choice | ✅ | Ja / Nein |
| **PersonalDataCount** | Choice | ✅ | Keine, Bis 10'000, etc. |
| **MedicalDataCount** | Choice | ✅ | Keine, Bis 10'000, etc. |
| **CreditCardDataCount** | Choice | ✅ | Keine, Nur von Mitarbeitenden, etc. |
| **HasEndOfLifeSystems** | Choice | ✅ | Ja / Nein |

### Zusätzliche Sicherheitsmassnahmen (Optional)

| Spaltenname | Typ | Pflicht | Beschreibung |
|-------------|-----|---------|--------------|
| **HasFirewall** | Choice | ❌ | Ja / Nein |
| **HasAntivirus** | Choice | ❌ | Ja / Nein |
| **HasBackup** | Choice | ❌ | Ja / Nein |
| **HasMFA** | Choice | ❌ | Ja / Nein |
| **HasEncryption** | Choice | ❌ | Ja / Nein |
| **HasIncidentResponsePlan** | Choice | ❌ | Ja / Nein |
| **HasSecurityTraining** | Choice | ❌ | Ja / Nein |
| **HasPatchManagement** | Choice | ❌ | Ja / Nein |

### Zuordnung

| Spaltenname | Typ | Pflicht | Beschreibung |
|-------------|-----|---------|--------------|
| **CustomerEmail** | Single line text | ✅ | E-Mail des Versicherungsnehmers |
| **BrokerEmail** | Single line text | ❌ | E-Mail des Vermittlers |
| **CreatedByEmail** | Single line text | ✅ | E-Mail des Erstellers |

---

## ⚙️ Setup

### 1. Umgebungsvariable setzen

Füge in `.env.local` hinzu:

```bash
SHAREPOINT_WEBHOOK_SECRET="dein-sicheres-secret-hier"
```

**Generiere ein sicheres Secret:**
```bash
openssl rand -hex 32
```

Oder online: https://generate-secret.now.sh/32

### 2. SharePoint Liste erstellen

1. **SharePoint Site** öffnen
2. **Neue Liste** erstellen: "Cyber-Versicherungs-Offerten"
3. **Spalten hinzufügen** gemäss obiger Struktur

**Tipp:** Verwende **Choice** Spalten für standardisierte Werte!

### 3. Power Automate Flow erstellen

#### Trigger: "When an item is created"

```json
{
  "site": "https://your-company.sharepoint.com/sites/your-site",
  "list": "Cyber-Versicherungs-Offerten"
}
```

#### Action: "HTTP - Send an HTTP request"

**Methode:** `POST`

**URL:**
```
https://your-app.vercel.app/api/webhooks/sharepoint-quote
```

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "webhookSecret": "@{outputs('GetSecret')}",
  "companyName": "@{triggerOutputs()?['body/Title']}",
  "address": "@{triggerOutputs()?['body/Address']}",
  "zip": "@{triggerOutputs()?['body/Zip']}",
  "city": "@{triggerOutputs()?['body/City']}",
  "country": "@{triggerOutputs()?['body/Country']}",
  "url": "@{triggerOutputs()?['body/URL']}",
  "industry": "@{triggerOutputs()?['body/Industry/Value']}",
  "employees": @{triggerOutputs()?['body/Employees']},
  "revenue": @{triggerOutputs()?['body/Revenue']},
  "eCommercePercentage": "@{triggerOutputs()?['body/ECommercePercentage/Value']}",
  "foreignRevenuePercentage": "@{triggerOutputs()?['body/ForeignRevenuePercentage/Value']}",
  "noForeignSubsidiaries": "@{triggerOutputs()?['body/NoForeignSubsidiaries/Value']}",
  "noRejectedInsurance": "@{triggerOutputs()?['body/NoRejectedInsurance/Value']}",
  "hadCyberIncidents": "@{triggerOutputs()?['body/HadCyberIncidents/Value']}",
  "personalDataCount": "@{triggerOutputs()?['body/PersonalDataCount/Value']}",
  "medicalDataCount": "@{triggerOutputs()?['body/MedicalDataCount/Value']}",
  "creditCardDataCount": "@{triggerOutputs()?['body/CreditCardDataCount/Value']}",
  "hasEndOfLifeSystems": "@{triggerOutputs()?['body/HasEndOfLifeSystems/Value']}",
  "customerEmail": "@{triggerOutputs()?['body/CustomerEmail']}",
  "brokerEmail": "@{triggerOutputs()?['body/BrokerEmail']}",
  "createdByEmail": "@{triggerOutputs()?['body/Author/Email']}"
}
```

**Tipp:** Für Choice-Felder verwende `/Value` um den Text-Wert zu erhalten!

---

## 🧪 Testing

### 1. Health Check

Teste ob der Endpoint erreichbar ist:

```bash
curl https://your-app.vercel.app/api/webhooks/sharepoint-quote
```

**Erwartete Antwort:**
```json
{
  "status": "ok",
  "endpoint": "SharePoint Quote Webhook",
  "timestamp": "2025-01-13T10:00:00.000Z"
}
```

### 2. Test mit Postman/Insomnia

**POST** `https://your-app.vercel.app/api/webhooks/sharepoint-quote`

**Body:**
```json
{
  "webhookSecret": "your-secret-here",
  "companyName": "Test AG",
  "address": "Teststrasse 1",
  "zip": "8000",
  "city": "Zürich",
  "country": "Schweiz",
  "url": "https://test.ch",
  "industry": "Information",
  "employees": 50,
  "revenue": 5000000,
  "eCommercePercentage": "1 - 25%",
  "foreignRevenuePercentage": "0%",
  "noForeignSubsidiaries": "Trifft zu",
  "noRejectedInsurance": "Trifft zu",
  "hadCyberIncidents": "Nein",
  "personalDataCount": "Bis 10'000",
  "medicalDataCount": "Keine",
  "creditCardDataCount": "Keine oder durch einen externen Dienstleister verarbeitet",
  "hasEndOfLifeSystems": "Nein",
  "customerEmail": "kontakt@swisstech.ch",
  "createdByEmail": "broker@swissquality.ch"
}
```

**Erfolgreiche Antwort:**
```json
{
  "success": true,
  "quoteId": "clx123...",
  "quoteNumber": "SP-1734096000-A3F9",
  "riskScore": "A",
  "message": "Quote successfully created from SharePoint data"
}
```

### 3. SharePoint Test

1. Erstelle einen neuen Eintrag in der SharePoint-Liste
2. Warte ca. 1-2 Minuten
3. Prüfe in Power Automate: **Flow runs**
4. Prüfe in Supabase ob Quote erstellt wurde

---

## 🔍 Troubleshooting

### Fehler: "Invalid webhook secret"

- ✅ Secret in `.env.local` korrekt gesetzt?
- ✅ Secret in Power Automate Flow identisch?
- ✅ App neu gestartet nach `.env.local` Änderung?

### Fehler: "Creator user not found"

- ✅ User mit dieser E-Mail existiert in Supabase?
- ✅ `CreatedByEmail` korrekt gemappt in Flow?

### Fehler: "Customer not found"

- ✅ Kunde mit dieser E-Mail existiert in Supabase?
- ✅ `CustomerEmail` korrekt eingegeben?
- ✅ Tippfehler in E-Mail-Adresse?

### Power Automate Flow fails

1. **Flow runs** öffnen
2. Fehlgeschlagenen Run öffnen
3. **HTTP** Action anklicken
4. **Response** prüfen für Fehlerdetails

---

## 📊 Monitoring

### Logs prüfen

**Vercel:**
```bash
vercel logs --follow
```

**Local:**
Konsole zeigt:
```
✅ Quote created from SharePoint: SP-1734096000-A3F9
```

### Datenbank prüfen

```sql
-- Neuste SharePoint Quotes
SELECT * FROM quotes 
WHERE "quoteNumber" LIKE 'SP-%' 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

---

## 🔐 Sicherheit

### Best Practices

- ✅ **Secret rotieren:** Ändere Secret regelmässig
- ✅ **HTTPS only:** Verwende immer HTTPS URLs
- ✅ **IP Whitelist:** Optional in Firewall konfigurieren
- ✅ **Logging:** Überwache fehlgeschlagene Requests
- ✅ **Rate Limiting:** Implementiere bei Bedarf

### Webhook Secret Management

**Nie committen:**
```bash
# .gitignore
.env.local
.env.*.local
```

**Vercel Production:**
Settings → Environment Variables → `SHAREPOINT_WEBHOOK_SECRET`

---

## 📈 Erweiterungen

### Optional: Async Processing

Für grosse Volumen:
- Webhook speichert in Queue (z.B. Vercel KV)
- Cron-Job verarbeitet Queue
- Fehler-Handling & Retries

### Optional: Bidirektionale Sync

- Quote Status-Änderungen zurück zu SharePoint
- Webhook von Supabase → Power Automate
- SharePoint Spalte "SyncStatus" updaten

---

## 🎯 Checkliste

- [ ] `.env.local` mit `SHAREPOINT_WEBHOOK_SECRET` erstellt
- [ ] SharePoint-Liste mit allen Spalten erstellt
- [ ] Power Automate Flow konfiguriert
- [ ] Health Check erfolgreich
- [ ] Test mit Postman erfolgreich
- [ ] Test-Eintrag in SharePoint erstellt
- [ ] Quote in Supabase vorhanden
- [ ] Monitoring eingerichtet

---

**Bei Fragen:** Siehe API-Route Code in `app/api/webhooks/sharepoint-quote/route.ts`
