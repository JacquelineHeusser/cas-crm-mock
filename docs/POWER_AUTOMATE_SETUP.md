# Power Automate Setup - Schritt für Schritt

## 🎯 Ziel

Automatische Synchronisation: **SharePoint-Liste → Supabase Quotes**

---

## 📋 Voraussetzungen

- [x] SharePoint-Liste existiert
- [ ] 2 zusätzliche Spalten in SharePoint erstellen (siehe unten)
- [ ] `SHAREPOINT_WEBHOOK_SECRET` in `.env.local` gesetzt
- [ ] App deployed auf Vercel

---

## 1️⃣ SharePoint-Liste ergänzen

### Fehlende Spalten hinzufügen:

1. **Gehe zu:** Deine SharePoint-Liste → **Settings** → **List settings** → **Create column**

2. **Spalte 1: CustomerEmail**
   - Column name: `CustomerEmail`
   - Type: **Single line of text**
   - Description: E-Mail-Adresse des Versicherungsnehmers
   - ✅ Require that this column contains information

3. **Spalte 2: BrokerEmail**
   - Column name: `BrokerEmail`
   - Type: **Single line of text**
   - Description: E-Mail-Adresse des Vermittlers (optional)
   - ❌ Nicht erforderlich

---

## 2️⃣ Power Automate Flow erstellen

### A) Neuen Flow anlegen

1. Gehe zu: https://make.powerautomate.com
2. **+ Create** → **Automated cloud flow**
3. Flow name: `SharePoint to Supabase - Cyber Quotes`
4. Trigger: **When an item is created** (SharePoint)
5. **Create**

### B) Trigger konfigurieren

**When an item is created**

- **Site Address:** `https://your-company.sharepoint.com/sites/your-site`
- **List Name:** Wähle deine Liste aus (z.B. "Cyber-Versicherungs-Offerten")

### C) Secret laden (optional, aber empfohlen)

**+ New step** → Suche: **Get secret**

Wenn du Azure Key Vault hast:
- **Action:** Get secret (Azure Key Vault)
- **Secret Name:** `SharePointWebhookSecret`

Sonst: Verwende Compose-Action mit hardcoded Secret (NUR für Testing!):
- **Action:** Compose
- **Inputs:** `your-webhook-secret-here`

### D) HTTP Request konfigurieren

**+ New step** → Suche: **HTTP**

**Action:** HTTP

#### Settings:

- **Method:** `POST`
- **URI:** `https://your-app.vercel.app/api/webhooks/sharepoint-quote`
- **Headers:**
  ```json
  {
    "Content-Type": "application/json"
  }
  ```

- **Body:** (siehe nächste Seite)

---

## 3️⃣ Request Body

Kopiere diesen JSON-Body in die **Body**-Feld des HTTP-Requests:

```json
{
  "webhookSecret": "@{outputs('Get_Secret')?['body/value']}",
  
  "companyName": "@{triggerOutputs()?['body/Title']}",
  "address": "@{triggerOutputs()?['body/field_1']}",
  "zip": "@{triggerOutputs()?['body/field_2']}",
  "city": "@{triggerOutputs()?['body/field_3']}",
  "country": "@{triggerOutputs()?['body/field_4']}",
  "url": "@{triggerOutputs()?['body/field_6']}",
  "industry": "@{triggerOutputs()?['body/field_30']}",
  "employees": @{triggerOutputs()?['body/field_16']},
  "revenue": @{triggerOutputs()?['body/field_7']},
  
  "eCommercePercentage": "@{triggerOutputs()?['body/field_21']}",
  "foreignRevenuePercentage": "@{if(lessOrEquals(sub(100, float(triggerOutputs()?['body/field_10'])), 0.9), '0%', if(lessOrEquals(sub(100, float(triggerOutputs()?['body/field_10'])), 25), '1 - 25%', if(lessOrEquals(sub(100, float(triggerOutputs()?['body/field_10'])), 50), '26 - 50%', '51 - 100%')))}",
  "noForeignSubsidiaries": "Trifft zu",
  "noRejectedInsurance": "Trifft zu",
  
  "hadCyberIncidents": "@{if(or(equals(triggerOutputs()?['body/field_41'], 'Ja'), equals(triggerOutputs()?['body/field_41'], 'True')), 'Ja', 'Nein')}",
  "personalDataCount": "@{coalesce(triggerOutputs()?['body/field_32'], 'Keine')}",
  "medicalDataCount": "@{coalesce(triggerOutputs()?['body/field_33'], 'Keine')}",
  "creditCardDataCount": "@{coalesce(triggerOutputs()?['body/field_34'], 'Keine oder durch einen externen Dienstleister verarbeitet')}",
  "hasEndOfLifeSystems": "@{if(or(equals(triggerOutputs()?['body/EndofLifeSysteme'], 'Ja'), equals(triggerOutputs()?['body/EndofLifeSysteme'], 'True')), 'Ja', 'Nein')}",
  
  "hasMFA": "@{if(or(equals(triggerOutputs()?['body/field_35'], 'True'), equals(triggerOutputs()?['body/field_35'], 'Ja')), 'Ja', 'Nein')}",
  "hasAntivirus": "@{if(or(equals(triggerOutputs()?['body/field_38'], 'True'), equals(triggerOutputs()?['body/field_38'], 'Ja')), 'Ja', 'Nein')}",
  "hasBackup": "@{if(or(equals(triggerOutputs()?['body/WeeklyBackups'], 'Ja'), equals(triggerOutputs()?['body/WeeklyBackups'], 'True')), 'Ja', 'Nein')}",
  "hasEncryption": "@{if(or(equals(triggerOutputs()?['body/Verschl_x00fc_sselteBackups'], 'Ja'), equals(triggerOutputs()?['body/Verschl_x00fc_sselteBackups'], 'True')), 'Ja', 'Nein')}",
  "hasIncidentResponsePlan": "@{if(or(equals(triggerOutputs()?['body/ITChecklists_x002f_Notfallplan'], 'Ja'), equals(triggerOutputs()?['body/ITChecklists_x002f_Notfallplan'], 'True')), 'Ja', 'Nein')}",
  "hasSecurityTraining": "@{if(or(equals(triggerOutputs()?['body/field_40'], 'True'), equals(triggerOutputs()?['body/field_40'], 'Ja')), 'Ja', 'Nein')}",
  "hasPatchManagement": "@{if(or(equals(triggerOutputs()?['body/field_37'], 'True'), equals(triggerOutputs()?['body/field_37'], 'Ja')), 'Ja', 'Nein')}",
  
  "customerEmail": "@{triggerOutputs()?['body/CustomerEmail']}",
  "brokerEmail": "@{coalesce(triggerOutputs()?['body/BrokerEmail'], '')}",
  "createdByEmail": "@{triggerOutputs()?['body/Author/Email']}"
}
```

**Hinweis:** Wenn du **Compose** statt Key Vault verwendest, ersetze:
```json
"webhookSecret": "@{outputs('Compose')?['Outputs']}"
```

---

## 4️⃣ Flow speichern und testen

### A) Flow speichern

- Klicke **Save** oben rechts
- Flow aktivieren (Toggle auf **On**)

### B) Test vorbereiten

1. **Stelle sicher:**
   - `SHAREPOINT_WEBHOOK_SECRET` in `.env.local` ist gesetzt
   - App ist deployed auf Vercel
   - Health Check funktioniert:
     ```bash
     curl https://your-app.vercel.app/api/webhooks/sharepoint-quote
     ```

2. **Erstelle Test-User in Supabase:**
   - Customer: `test.kunde@example.com`
   - Broker (optional): `broker@swissquality.ch`

### C) Test-Eintrag erstellen

1. Gehe zu deiner SharePoint-Liste
2. Klicke **+ New**
3. Fülle alle Felder aus:
   - **Versicherungsnehmer:** "Test Firma AG"
   - **Adresse:** "Teststrasse 1"
   - **PLZ:** 8000
   - **Ort:** "Zürich"
   - **Land:** "Schweiz"
   - **Domain/URL:** "www.test.ch"
   - **Branche:** "Einzelhandel"
   - **Anzahl Mitarbeiter:** 5
   - **Umsatz - Vorjahr:** 500000
   - **Umsatzanteil Schweiz:** "90%"
   - **Prozentualer Umsatzanteil E-Commerce:** "10%"
   - **Personen- und Kundendaten:** "Bis 10'000"
   - **End of Life Systeme:** "Nein"
   - **CustomerEmail:** `test.kunde@example.com` ✅
   - **BrokerEmail:** `broker@swissquality.ch` (optional)
4. **Save**

### D) Flow-Ausführung prüfen

1. **Power Automate** → **My flows** → Dein Flow
2. **28-day run history** öffnen
3. Neusten Run anklicken
4. **Grüner Haken** = Erfolgreich ✅
5. **Rotes X** = Fehler → Details anschauen

### E) Supabase prüfen

```sql
-- Neuste Quote prüfen
SELECT 
  "quoteNumber",
  "companyData"->>'companyName' as firma,
  "riskScore",
  "createdAt"
FROM quotes 
WHERE "quoteNumber" LIKE 'SP-%'
ORDER BY "createdAt" DESC
LIMIT 1;
```

**Erwartetes Ergebnis:**
```
quoteNumber: SP-1734096000-A3F9
firma: Test Firma AG
riskScore: A oder B
createdAt: 2025-01-13 10:30:00
```

---

## 🐛 Troubleshooting

### "Invalid webhook secret"

**Lösung:**
- Prüfe `.env.local` → `SHAREPOINT_WEBHOOK_SECRET`
- Prüfe Flow → Secret im Body korrekt?
- App neu deployen nach `.env.local` Änderung

### "Creator user not found"

**Lösung:**
- Erstelle User mit E-Mail `Author/Email` in Supabase
- Oder: Ändere `createdByEmail` zu fixem existierenden User

### "Customer not found"

**Lösung:**
- Erstelle Customer-User in Supabase
- E-Mail muss mit `CustomerEmail`-Feld übereinstimmen
- User-Rolle muss `CUSTOMER` sein

### "Field not found" oder "null"

**Lösung:**
- Prüfe SharePoint-Liste: Feld vorhanden?
- Prüfe Internal Name: `field_1` vs `Title`
- Verwende `coalesce()` für optionale Felder

### Flow läuft nicht automatisch

**Lösung:**
- Flow eingeschaltet? (Toggle auf **On**)
- Trigger korrekt? **When an item is created**
- Liste korrekt ausgewählt?

---

## ✅ Checkliste

- [ ] SharePoint: Spalten `CustomerEmail` und `BrokerEmail` erstellt
- [ ] `.env.local`: `SHAREPOINT_WEBHOOK_SECRET` gesetzt
- [ ] Power Automate: Flow erstellt
- [ ] Power Automate: Trigger konfiguriert (When an item is created)
- [ ] Power Automate: HTTP POST Body eingefügt
- [ ] Power Automate: Flow gespeichert und aktiviert
- [ ] Supabase: Test-User erstellt (Customer + optional Broker)
- [ ] Test: Eintrag in SharePoint erstellt
- [ ] Test: Flow-Ausführung erfolgreich (grüner Haken)
- [ ] Test: Quote in Supabase vorhanden
- [ ] Test: Risk Score berechnet

---

**Bei Problemen:** Siehe `SHAREPOINT_FIELD_MAPPING.md` für detailliertes Mapping
