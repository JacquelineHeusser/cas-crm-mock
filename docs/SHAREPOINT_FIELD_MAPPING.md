# SharePoint → Supabase Field Mapping

## Übersicht

Dieses Dokument zeigt das **exakte Mapping** zwischen deiner bestehenden SharePoint-Liste und der Supabase Quote-Struktur.

---

## 📊 Field Mapping Tabelle

| SharePoint Feld | Internal Name | API Parameter | Typ | Erforderlich |
|----------------|---------------|---------------|-----|--------------|
| **Versicherungsnehmer** | `Title` | `companyName` | Text | ✅ |
| **Adresse** | `field_1` | `address` | Text | ✅ |
| **PLZ** | `field_2` | `zip` | Number | ✅ |
| **Ort** | `field_3` | `city` | Text | ✅ |
| **Land** | `field_4` | `country` | Text | ✅ |
| **Domain/URL** | `field_6` | `url` | Text | ❌ |
| **Branche** | `field_30` | `industry` | Text | ✅ |
| **Anzahl Mitarbeiter** | `field_16` | `employees` | Number | ✅ |
| **Umsatz - Vorjahr** | `field_7` | `revenue` | Number | ✅ |

### Cyber Risikoprofil

| SharePoint Feld | Internal Name | API Parameter | Werte | Erforderlich |
|----------------|---------------|---------------|-------|--------------|
| **Prozentualer Umsatzanteil E-Commerce** | `field_21` | `eCommercePercentage` | z.B. "15%" | ✅ |
| **Umsatzanteil Schweiz** | `field_10` | *(Berechnung für foreignRevenuePercentage)* | z.B. "90%" | ✅ |
| *(Ausland-Anteil)* | *(Berechnung)* | `foreignRevenuePercentage` | "0%", "1-25%", etc. | ✅ |
| *(Immer "Trifft zu")* | *(Fix)* | `noForeignSubsidiaries` | "Trifft zu" | ✅ |
| *(Immer "Trifft zu")* | *(Fix)* | `noRejectedInsurance` | "Trifft zu" | ✅ |

### Cyber-Sicherheit

| SharePoint Feld | Internal Name | API Parameter | Werte | Erforderlich |
|----------------|---------------|---------------|-------|--------------|
| **Ereignis bekannt** | `field_41` | `hadCyberIncidents` | "Ja" / "Nein" | ✅ |
| **Personen- und Kundendaten** | `field_32` | `personalDataCount` | "Bis 1'000", "Bis 10'000", etc. | ✅ |
| **Medizinal- und Gesundheitsdaten** | `field_33` | `medicalDataCount` | "Keine", "Nur Mitarbeitende", etc. | ✅ |
| **Kreditkartendaten** | `field_34` | `creditCardDataCount` | "Keine", "Nur Mitarbeitende", etc. | ✅ |
| **End of Life Systeme** | `EndofLifeSysteme` | `hasEndOfLifeSystems` | "Ja" / "Nein" | ✅ |

### Zusätzliche Sicherheitsmassnahmen (Optional)

| SharePoint Feld | Internal Name | API Parameter | Werte |
|----------------|---------------|---------------|-------|
| **MFA für Fernzugriffe** | `field_35` | `hasMFA` | "True" / "False" / "Ja" / "Nein" |
| **E-Mail Sicherheitslösung** | `field_36` | *(Email Security)* | "True" / "False" |
| **Patchmanagement** | `field_37` | `hasPatchManagement` | "True" / "False" |
| **Antivirensoftware** | `field_38` | `hasAntivirus` | "True" / "False" |
| **Starke Passwörter** | `field_39` | *(Password Policy)* | "True" / "False" |
| **Regelmässiges Sicherheitstraining** | `field_40` | `hasSecurityTraining` | "True" / "False" |
| **Weekly Backups** | `WeeklyBackups` | `hasBackup` | "Ja" / "Nein" |
| **Verschlüsselte Backups** | `Verschl_x00fc_sselteBackups` | `hasEncryption` | "Ja" / "Nein" |
| **IT Checklists / Notfallplan** | `ITChecklists_x002f_Notfallplan` | `hasIncidentResponsePlan` | "Ja" / "Nein" |

### Zuordnung (Neu - muss hinzugefügt werden)

Diese Felder **fehlen noch** in deiner SharePoint-Liste und müssen ergänzt werden:

| SharePoint Feld | Internal Name | API Parameter | Typ | Beschreibung |
|----------------|---------------|---------------|-----|--------------|
| **Kunden E-Mail** | `CustomerEmail` | `customerEmail` | Text | E-Mail des Versicherungsnehmers |
| **Vermittler E-Mail** | `BrokerEmail` | `brokerEmail` | Text | Optional: E-Mail des Vermittlers |
| **Ersteller E-Mail** | `CreatedByEmail` | `createdByEmail` | Text | Wird automatisch aus `Author/Email` genommen |

---

## 🔄 Mapping-Logik

### 1. Einfache 1:1 Mappings

Direktes Mapping ohne Transformation:

```json
{
  "companyName": "@{triggerOutputs()?['body/Title']}",
  "address": "@{triggerOutputs()?['body/field_1']}",
  "zip": "@{triggerOutputs()?['body/field_2']}",
  "city": "@{triggerOutputs()?['body/field_3']}",
  "country": "@{triggerOutputs()?['body/field_4']}",
  "url": "@{triggerOutputs()?['body/field_6']}",
  "industry": "@{triggerOutputs()?['body/field_30']}",
  "employees": @{triggerOutputs()?['body/field_16']},
  "revenue": @{triggerOutputs()?['body/field_7']}
}
```

### 2. Boolean-Konvertierung (True/False → Ja/Nein)

SharePoint gibt manchmal "True"/"False" zurück, API erwartet "Ja"/"Nein":

```javascript
// In Power Automate: Condition
if(equals(triggerOutputs()?['body/EndofLifeSysteme'], 'Ja'), 'Ja', 'Nein')
```

Oder einfacher - verwende Expression:

```json
{
  "hasEndOfLifeSystems": "@{if(or(equals(triggerOutputs()?['body/EndofLifeSysteme'], 'Ja'), equals(triggerOutputs()?['body/EndofLifeSysteme'], 'True')), 'Ja', 'Nein')}"
}
```

### 3. Prozent-Formatierung

E-Commerce Prozentsatz muss evtl. normalisiert werden:

```javascript
// Wenn SharePoint "15%" liefert, ist es ok
// Wenn SharePoint "0.15" liefert, muss es konvertiert werden:
concat(mul(triggerOutputs()?['body/field_21'], 100), '%')
```

### 4. Foreign Revenue Percentage Berechnung

```javascript
// Wenn Schweiz-Anteil 90% ist, dann Ausland-Anteil = 10%
// Mapping zu Kategorien:
// 0-0.9% → "0%"
// 1-25% → "1 - 25%"
// 26-50% → "26 - 50%"
// etc.

if(lessOrEquals(sub(1, div(triggerOutputs()?['body/field_10'], 100)), 0.009), '0%',
  if(lessOrEquals(sub(1, div(triggerOutputs()?['body/field_10'], 100)), 0.25), '1 - 25%',
    if(lessOrEquals(sub(1, div(triggerOutputs()?['body/field_10'], 100)), 0.50), '26 - 50%', '51 - 100%')))
```

### 5. Fixe Werte

Für Felder die nicht in SharePoint existieren:

```json
{
  "noForeignSubsidiaries": "Trifft zu",
  "noRejectedInsurance": "Trifft zu"
}
```

---

## 📝 Power Automate Flow Body (Komplett)

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

---

## ✏️ SharePoint Liste anpassen

### Fehlende Spalten hinzufügen:

1. **CustomerEmail** (Single line of text)
   - Beschreibung: E-Mail-Adresse des Kunden (Versicherungsnehmer)
   - Erforderlich: Ja

2. **BrokerEmail** (Single line of text)
   - Beschreibung: E-Mail-Adresse des Vermittlers (optional)
   - Erforderlich: Nein

**Hinweis:** `CreatedByEmail` wird automatisch aus `Author/Email` genommen!

---

## 🧪 Test-Daten

Basierend auf deinen CSV-Beispielen:

### Beispiel: "Bikeshop M+J Rief"

```
Versicherungsnehmer: "Bikeshop M+J Rief"
Adresse: "Musterstrasse 759"
PLZ: 8344
Ort: "Bäretswil"
Land: "Schweiz"
URL: "www.bikeshop-rief.ch"
Branche: "Einzelhandel"
Mitarbeiter: 2
Umsatz: 50000
E-Commerce: "15%"
Schweiz-Anteil: "90%"

→ foreignRevenuePercentage = "1 - 25%" (10% Ausland)
→ Risk Score wird berechnet basierend auf Sicherheitsdaten
```

---

## 🔍 Validierung

Nach dem Flow-Setup prüfen:

```sql
-- In Supabase
SELECT 
  "quoteNumber",
  "companyData"->>'companyName' as firma,
  "riskScore",
  "createdAt"
FROM quotes 
WHERE "quoteNumber" LIKE 'SP-%'
ORDER BY "createdAt" DESC;
```

---

## 📌 Wichtige Hinweise

1. **Number vs Text:** SharePoint field_2 (PLZ) ist Number → direkt als `@{...}` ohne Anführungszeichen
2. **Choice Fields:** Boolean-Konvertierung mit `if()`-Expression
3. **Author/Email:** Automatisch verfügbar in SharePoint, kein Extra-Feld nötig
4. **Null-Handling:** Verwende `coalesce()` für optionale Felder

---

**Bei Fragen zum Mapping:** Vergleiche mit `docs/SharePoint_List.csv`
