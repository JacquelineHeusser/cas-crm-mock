# Risk-Score-System

## Übersicht

Das Risk-Score-System bewertet die Cyber-Sicherheit eines Unternehmens basierend auf den Antworten in der Sektion "Cyber-Sicherheit". Der Score bestimmt, ob ein Direktabschluss möglich ist oder ob ein Underwriting erforderlich ist.

## Scoring-Kategorien

| Score | Prozentbereich | Positive Antworten | Abschluss |
|-------|---------------|-------------------|-----------|
| **A** | 100% - 90% | ≥ 90% | ✅ Direkter Abschluss |
| **B** | 89% - 70% | 70-89% | ✅ Direkter Abschluss |
| **C** | 69% - 60% | 60-69% | ⚠️ Underwriting erforderlich |
| **D** | 59% - 50% | 50-59% | ⚠️ Underwriting erforderlich |
| **E** | < 50% | < 50% | ⚠️ Underwriting erforderlich |

## Bewertungslogik

### Punktesystem

Jede Frage wird mit folgenden Punkten bewertet:

- **Ja** (bei positivem Kontext): 1 Punkt
- **Teilweise**: 0.5 Punkte
- **Nein** (bei positivem Kontext): 0 Punkte

Bei Fragen, wo "Nein" besser ist (z.B. "Hatten Sie Cybervorfälle?"), wird die Bewertung umgekehrt.

### Bewertete Fragen

#### Basis-Fragen (alle Unternehmen)

1. **Cybervorfälle in letzten 3 Jahren** (Nein = positiv)
   - Bei "Ja": Zusätzliche Bewertung von:
     - Mehrere Vorfälle (Nein = positiv)
     - Ausfall > 72 Stunden (Nein = positiv)
     - Finanzieller Schaden (Nein = positiv)
     - Haftpflichtansprüche (Nein = positiv)
     - Business Continuity interne IT (längere Dauer = besser)

2. **End-of-Life Systeme** (Nein = positiv)

#### Erweiterte Fragen (Umsatz > CHF 5 Mio.)

Alle folgenden Antworten mit "Ja" sind positiv:
- MFA für Fernzugriff
- IT-Notfallplan vorhanden
- Wöchentliche Backups
- Verschlüsselte Backups
- Offline/getrennte Backups
- E-Mail-Sicherheitslösung
- Automatische Updates
- Antiviren-Software
- Starke Passwort-Richtlinien
- Jährliche Security-Schulungen

**Bei Nutzung von OT-Systemen zusätzlich:**
- OT: MFA für Fernzugriff
- OT: Firewall-Trennung

#### Umfassende Fragen (Umsatz > CHF 10 Mio.)

- **Business Continuity externe IT** (längere Dauer = besser)
- **Wechseldatenträger** (Nein = positiv)

Alle folgenden Antworten mit "Ja" oder "Teilweise" sind positiv:
- Separate Admin-Konten
- Isolierte Backup-Zugriffe
- Einzigartige Passwörter
- Firewalls/IDS/IPS
- Patch-Management (30 Tage)
- Kritische Patches (3 Tage)
- Phishing-Simulationen
- Security Operation Center (SOC)

**Bei Nutzung von OT-Systemen zusätzlich:**
- OT-Inventarliste
- OT-Standort-Trennung
- OT-Internet-Trennung
- OT-Schwachstellenscans
- OT-Regelmässige Backups

**Compliance-Fragen:**
- PCI-Zertifizierung
- Medizinischer Datenschutz (GDPR)
- Biometrischer Datenschutz

## Business Continuity Bewertung

Für Business Continuity Fragen gilt:

| Antwort | Punkte |
|---------|--------|
| "Alle/Die meisten Geschäftsprozesse können eine Woche fortgesetzt werden" | 1.0 |
| "Die meisten Geschäftsprozesse können mindestens einen Tag, aber weniger als eine Woche fortgesetzt werden" | 0.5 |
| "Die meisten Geschäftsprozesse können weniger als einen Tag fortgesetzt werden oder kommen sofort zum Erliegen" | 0.0 |

## Berechnung

```typescript
Prozentsatz = (Erreichte Punkte / Maximale Punkte) × 100%
```

### Beispiel

Ein Unternehmen mit Umsatz CHF 8 Mio. beantwortet:
- **Basis-Fragen**: 2 von 2 Punkten (100%)
- **Erweiterte Fragen**: 10 von 12 Punkten (83%)

**Gesamt**: 12 von 14 Punkten = **85.7%** → **Score B** → ✅ Direkter Abschluss möglich

## Implementierung

Die Risk-Score-Berechnung erfolgt automatisch beim Speichern der Cyber-Sicherheitsfragen im Formular (Step 3). Der Score wird zusammen mit einer Begründung in der Datenbank gespeichert.

### Code-Referenz

- **Berechnung**: `lib/risk-score/calculate.ts`
- **Integration**: `app/actions/quote.ts` (Funktion `saveQuoteStep`)
- **Datenbank**: Felder `riskScore` und `riskScoreReason` in der `Quote`-Tabelle

## Wichtige Hinweise

1. **Nur Cyber-Sicherheitsfragen** werden für den Risk Score verwendet
2. **Nicht beantwortete Fragen** werden nicht bewertet (zählen nicht zu max. Punkten)
3. **Umsatzabhängige Fragen** werden nur bei entsprechendem Umsatz berücksichtigt
4. **OT-Fragen** werden nur bei Nutzung von OT-Systemen berücksichtigt
5. Der Score wird **bei jeder Änderung** der Cyber-Sicherheitsfragen **neu berechnet**
