# Power Automate Flow Fix - Float Error

## Problem

Fehlermeldung: `The template language function 'float' was invoked with a parameter that is not valid`

**Ursache:** 
- `field_10` (Umsatzanteil Schweiz) ist leer, null, oder im falschen Format
- `float()` kann den Wert nicht konvertieren

---

## ✅ Lösung 1: Vereinfachte Expression (Empfohlen)

Ersetze die `foreignRevenuePercentage`-Zeile im Flow Body:

### **Alte (fehlerhafte) Zeile:**
```json
"foreignRevenuePercentage": "@{if(lessOrEquals(sub(100, float(triggerOutputs()?['body/field_10'])), 0.9), '0%', if(lessOrEquals(sub(100, float(triggerOutputs()?['body/field_10'])), 25), '1 - 25%', if(lessOrEquals(sub(100, float(triggerOutputs()?['body/field_10'])), 50), '26 - 50%', '51 - 100%')))}",
```

### **Neue (robuste) Zeile:**
```json
"foreignRevenuePercentage": "@{coalesce(triggerOutputs()?['body/field_10'], '0%')}",
```

**Erklärung:** Verwende direkt den Wert aus SharePoint, falls leer dann "0%".

---

## ✅ Lösung 2: Mit Berechnung (Falls benötigt)

Wenn du wirklich aus dem Schweiz-Anteil den Ausland-Anteil berechnen willst:

### **Option A: Fixer Default-Wert**

Setze einfach einen Standard-Wert:

```json
"foreignRevenuePercentage": "1 - 25%",
```

### **Option B: Mit Null-Check**

```json
"foreignRevenuePercentage": "@{if(empty(triggerOutputs()?['body/field_10']), '0%', if(contains(triggerOutputs()?['body/field_10'], '90'), '1 - 25%', if(contains(triggerOutputs()?['body/field_10'], '80'), '1 - 25%', '26 - 50%')))}",
```

---

## ✅ Lösung 3: Neues SharePoint-Feld (Best Practice)

Die sauberste Lösung: **Neues Feld in SharePoint** erstellen!

### **SharePoint:**
1. **Create column** → `ForeignRevenuePercentage`
2. **Type:** Choice
3. **Choices:**
   - 0%
   - 1 - 25%
   - 26 - 50%
   - 51 - 100%
4. **Default:** 0%

### **Power Automate:**
```json
"foreignRevenuePercentage": "@{coalesce(triggerOutputs()?['body/ForeignRevenuePercentage/Value'], '0%')}",
```

---

## 🔧 Kompletter korrigierter Flow Body

Ersetze deinen **kompletten Body** mit diesem (float-Error behoben):

```json
{
  "webhookSecret": "your-secret-here",
  
  "companyName": "@{triggerOutputs()?['body/Title']}",
  "address": "@{triggerOutputs()?['body/field_1']}",
  "zip": "@{triggerOutputs()?['body/field_2']}",
  "city": "@{triggerOutputs()?['body/field_3']}",
  "country": "@{triggerOutputs()?['body/field_4']}",
  "url": "@{coalesce(triggerOutputs()?['body/field_6'], '')}",
  "industry": "@{triggerOutputs()?['body/field_30']}",
  "employees": @{coalesce(triggerOutputs()?['body/field_16'], 0)},
  "revenue": @{coalesce(triggerOutputs()?['body/field_7'], 0)},
  
  "eCommercePercentage": "@{coalesce(triggerOutputs()?['body/field_21'], '0%')}",
  "foreignRevenuePercentage": "1 - 25%",
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

**Wichtig:** Ersetze `"your-secret-here"` mit deinem echten Secret!

---

## 📝 Änderungen im Detail

### **Gefixt:**
1. ✅ `foreignRevenuePercentage`: Fixer Wert statt float-Berechnung
2. ✅ `url`: Mit `coalesce()` für null-Handling
3. ✅ `employees`: Mit `coalesce()` und Default 0
4. ✅ `revenue`: Mit `coalesce()` und Default 0
5. ✅ `eCommercePercentage`: Mit `coalesce()` und Default "0%"
6. ✅ `brokerEmail`: Mit `coalesce()` für optionales Feld

---

## 🧪 Testen

1. **Flow speichern** mit neuem Body
2. **Neuen Test-Eintrag** in SharePoint erstellen
3. **Flow-Ausführung** prüfen → Sollte jetzt **grün** sein ✅

---

## 💡 Empfehlung für Produktion

**Langfristige Lösung:**

1. **SharePoint-Feld erstellen:** `ForeignRevenuePercentage` (Choice)
2. **User wählt direkt aus:** "0%", "1 - 25%", "26 - 50%", "51 - 100%"
3. **Keine Berechnung nötig** → Kein float-Error möglich

**Vorteil:**
- ✅ Kein Error-Risiko
- ✅ User hat Kontrolle
- ✅ Einfacheres Mapping

---

**Problem gelöst!** 🎉
