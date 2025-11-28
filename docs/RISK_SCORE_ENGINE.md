# Risk Score Engine - Dokumentation

## Übersicht

Die Risk Score Engine berechnet automatisch den Risiko-Score (A-E) für Cyberversicherungs-Offerten basierend auf:
- IT-Struktur (End-of-Life Systeme, Cloud-Services)
- Sicherheitsmassnahmen (Firewall, MFA, Backup, etc.)
- Bisherige Cybervorfälle (Ransomware, Data Leaks)

## Score-Kategorien

| Score | Beschreibung | Prozent | Underwriting |
|-------|--------------|---------|--------------|
| **A** | Sehr gut | 100-90% | ❌ Nein |
| **B** | Gut | 89-70% | ❌ Nein |
| **C** | Mittel | 69-60% | ✅ Ja |
| **D** | Schlecht | 59-50% | ✅ Ja |
| **E** | Sehr schlecht | < 50% | ✅ Ja |

**Regel:** Score A-B = Direkter Abschluss | Score C-E = Underwriting-Prüfung nötig

## Bewertungssystem

Das System zählt **positive Antworten** und berechnet daraus einen Prozentsatz.

### 1. IT-Struktur (3 Kriterien)

✅ **Positive Bewertung wenn:**
- Keine End-of-Life Systeme (z.B. Windows XP, Server 2008)
- Cloud-Services vorhanden (Backup, Redundanz)
- Mindestens 3 Systeme (ausreichende IT-Infrastruktur)

### 2. Sicherheitsmassnahmen (8 Kriterien)

✅ **Positive Bewertung für jede vorhandene Massnahme:**
- Firewall
- Antivirus
- Backup
- Multi-Faktor-Authentifizierung (MFA)
- Verschlüsselung
- Incident Response Plan
- Sicherheitsschulungen
- Patch Management

### 3. Vorfälle (1 Kriterium)

✅ **Positive Bewertung nach Vorfällen:**
- Keine Vorfälle: **100%**
- 1-2 Kleinere Vorfälle: **60-80%**
- Datenleck: **30%**
- Ransomware-Angriff: **0%**

## Berechnung

**Gesamt = (Positive Antworten / Maximale Antworten) × 100**

Beispiel: 10 von 12 positiven Antworten = 83% → **Score B**

## Verwendung

```typescript
import { calculateRiskScore, getScoreDescription } from '@/lib/risk-score';

const result = calculateRiskScore({
  company: {
    employees: 25,
    industry: 'IT',
    revenue: 5000000n,
  },
  itStructure: {
    systems: ['Windows Server 2022'],
    endOfLifeSystems: [],
    cloudServices: ['Azure'],
  },
  securityMeasures: {
    firewall: true,
    antivirus: true,
    backup: true,
    mfa: true,
    encryption: true,
    incidentResponse: true,
    securityTraining: true,
    patchManagement: true,
  },
  incidents: {
    lastIncidents: [],
    incidentCount: 0,
    ransomwareAttack: false,
    dataLeak: false,
  },
});

console.log(result.score); // 'A'
console.log(result.points); // 0
console.log(result.needsUnderwriting); // false
console.log(result.recommendations); // []
```

## Testen

```bash
npm run test-risk-score
```

Führt 3 Test-Szenarien aus:
1. **Perfektes Unternehmen** → Score A
2. **Mittleres Risiko** → Score C/D
3. **Hohes Risiko** → Score E

## Anpassungen

Die Punktevergabe kann in `lib/risk-score/calculator.ts` angepasst werden:

- `evaluateITStructure()` - IT-Bewertung
- `evaluateSecurityMeasures()` - Sicherheits-Bewertung
- `evaluateIncidents()` - Vorfalls-Bewertung
- `assignScore()` - Score-Schwellenwerte

## Next Steps

Die Risk Score Engine wird verwendet von:
- **Offertrechner** (Schritt 6) - Automatische Berechnung während Formular
- **Underwriting-Workflow** (Schritt 9) - Entscheidung über Prüfungsbedarf
- **Direkter Abschluss** (Schritt 10) - Automatische Policierung bei Score A-B
