# 📘 Product Requirements Document (PRD)  
## ZurichOne – Firmenkundenportal (Cyberversicherung End-to-End)

---

## 1. Vision & Zielsetzung

Das neue **ZurichOne Firmenkundenportal für Firmenkunden (KMU)** ermöglicht einen vollständig digitalisierten End-to-End-Prozess für Cyberversicherungen – von der Datenerfassung über die Risikoanalyse und Underwriting-Entscheidung bis zur Policierung direkt im Portal.

**Strategische Ziele:**

- Maximale **Kundenexzellenz** durch Self-Service und Transparenz  
- Minimale **manuelle Arbeit** und Medienbrüche für Vermittler  
- Effizientes, **regelbasiertes Underwriting** mit klaren Triggern (Risiko-Score)  
- Volldigitale **Dokumentenbereitstellung** (Offerten, Policen, Rechnungen, AVB etc.)  

---

## 2. Nutzergruppen

### 2.1 Primäre Nutzer

- **Firmenkunden (KMU mit 1–250 Mitarbeitenden)**  
- **Versicherungsvermittler**
  - Externe Broker (z. B. Swiss Quality Broker)  
  - Interne Zurich-Versicherungsvermittler  

### 2.2 Sekundäre Nutzer

- **Underwriter** (Market Facing Underwriter, Senior UW, Head Cyber)  
- **Backoffice / Policierungsstellen**  
- **Interne Admins / Support** (Usermanagement, Supportfälle)  

---

## 3. Problemstellung (Ist-Situation)

Basierend auf den bereitgestellten Customer Journeys (Kunde, Vermittler, Underwriter):

### 3.1 Firmenkunden

- Lange Offertprozesse (teilweise Tage bis Wochen)  
- Medienbrüche: Telefon, E-Mail, PDF-Fragebogen, Webrechner, Post  
- Keine zentrale, digitale Übersicht über Offerten, Policen und Rechnungen  
- Geringe Transparenz über Prozessstatus (z. B. bei Underwriting-Prüfungen)  

### 3.2 Vermittler

- Manuelle, fehleranfällige Datenerfassung:
  - PDF-Fragebogen an Kunden
  - Informationen zurück per E-Mail
  - Manuelle Übertragung der Daten in den Webrechner  
- Keine einheitlichen Risikofragen zwischen PDF und Webrechner  
- Keine Statusupdates bei Underwriting-Fällen (UW prüft in PEGA / anderen Systemen)  
- Doppelarbeit: Offerte wird erstellt, unterschrieben, dann nochmals manuell policiert  
- Dokumente (Police, Rechnungen) nur per Post an Kunden  

### 3.3 Underwriter

- Kein optimierter Prozess für reine Risikoprüfungen (PEGA-Fall ist auf Offertenerstellung ausgelegt)  
- Doppelerfassung von Daten:
  - Daten aus Webrechner → Risiko-Score-App → PEGA  
- Medienbrüche zwischen Tools (Webrechner, Risiko-Score-App, PEGA, E-Mail)  
- Keine direkte, strukturierte Kommunikation im System mit Vermittlern/Kunden (nur E-Mail)  
- Manuelles Verarbeiten von Dokumenten und fehlende Automatisierung  

---

## 4. Ziele & Erfolgsindikatoren (KPIs)

### 4.1 Aus Sicht Firmenkunde

- **70 %** der Cyber-Offerten werden im Self-Service durch KMU oder deren Vermittler erstellt.  
- **< 10 Minuten** von Start der Datenerfassung bis zur verbindlichen Offerte bei Risiko-Score **A–B**.  
- **≥ 90 %** der relevanten Dokumente (Offerte, Police, Rechnungen, AVB, Factsheets) stehen digital im Portal zur Verfügung.  

### 4.2 Aus Sicht Vermittler

- **80 % Reduktion** der manuellen Dateneingabe (kein Copy/Paste aus PDF in Webrechner).  
- **100 % Status-Transparenz** bei Underwriting-Fällen (Score C–E).  
- **Offertbearbeitungszeit < 5 Minuten** (ohne Underwriting-Beteiligung).  

### 4.3 Aus Sicht Underwriting

- **0 % Doppelerfassung** von kunden- und risikorelevanten Daten (alle Daten kommen aus ZurichOne).  
- **< 24 Stunden** durchschnittliche Entscheidungszeit für Fälle mit Risiko-Score **C–E**.  
- **Hohe Konsistenz** der Entscheidungen durch standardisierte Risiko-Score-Logik und strukturierte Daten.  

---

## 5. Scope

### 5.1 Im Scope

- Neubau eines **ZurichOne Firmenkundenportals** angelehnt an das bestehende Privatkundenportal.  
- Abbildung der **Cyberversicherung** als erstes voll-digitales Produkt (Offerte bis Policierung).  
- **Self-Service Offertrechner** mit allen erforderlichen Datenfeldern (gemäss „KMU Cyber Informationen.xlsx“).  
- **Automatische Risiko-Score-Berechnung (A–E)** auf Basis der Risikofragen.  
- **Score-Entscheidungslogik:**
  - **Score A–B:** automatisch delegiert, Abschluss ohne Underwriting.  
  - **Score C–E:** obligatorische Risikoprüfung durch Underwriting.  
- **Direkter Abschluss im Portal** (KEINE digitale Signatur via DocuSign mehr).  
- **Digitale Dokumentenerstellung und -bereitstellung**:
  - Offertdokument  
  - Policendokument  
  - Rechnungen  
  - AVB, Factsheets  
- **Underwriting-Workflow** für Score C–E inkl.:
  - Automatische Fallanlage  
  - Vollständige Vorbefüllung  
  - Referral-Workflow (PEGASUS WFMS)  
- **Portalzugänge** für:
  - Firmenkunden (KMU)  
  - Vermittler (Broker & Zurich-Vermittler)  
  - Underwriter  

### 5.2 Nicht im Scope (vorerst)

- Weitere Produkte ausser **Cyber** (z. B. Sach, Haftpflicht, Motorfahrzeug).  
- Schadenmeldungen und -prozesse im Portal.  
- Native Mobile App (fokus auf responsive Web-App).  
- White-Label-Versionen für einzelne Broker.  
- Vollständige Migration aller Altsysteme – bestehende Systeme können parallel weiterlaufen, werden aber ergänzt.  

---

## 6. Produktfunktionen im Detail

---

## 6.1 Funktionen für Firmenkunden (KMU)

### 6.1.1 Self-Service Cyber Offertrechner

Ein webbasiertes Formular im Portal, mit allen notwendigen Feldern zur Risiko- und Preisberechnung (gemäss Excel-Struktur „KMU Cyber Informationen.xlsx“).

**Beispielfelder (Auszug, da Datei nur teilweise sichtbar):**

- Versicherungsnehmer (Firmenname)  
- Adresse, PLZ, Ort, Land  
- Unternehmens-URL  
- Branche  
- Rechtsform  
- Umsatz  
- Anzahl Mitarbeitende  
- IT-Struktur & Systeme (inkl. „End-of-Life-Systeme“)  
- Bisherige Cybervorfälle  
- IT-Sicherheitsmassnahmen (Firewall, Antivirus, Backup, MFA etc.)  
- Gewünschte Versicherungssummen und Selbstbehalte  
- Deckungsvarianten / Pakete (z. B. Optimum-Paket inkl. Betriebsunterbruchdeckung)  

**Anforderungen:**

- Geführter, mehrstufiger Prozess mit klaren Sektionen (Unternehmen, IT, Sicherheit, Vorfälle, Deckung).  
- Hilfetexte und Erläuterungen zu Fachbegriffen (z. B. „End-of-Life-Systeme“).  
- Möglichkeit, dass der Kunde oder sein IT-Dienstleister die Risikofragen ausfüllt.  
- Validierungen (Pflichtfelder, Plausibilitäten).  

---

### 6.1.2 Risikofragen im Portal (statt PDF)

- Alle Risikofragen werden direkt im Portal abgebildet.  
- Keine PDF-Fragebögen mehr per E-Mail.  
- Möglichkeit, Fragen temporär zu speichern und später wieder aufzunehmen.  

---

### 6.1.3 Automatische Risiko-Score-Berechnung (A–E)

- Nach vollständiger Erfassung der relevanten Risikofragen:  
  - System berechnet einen Risiko-Score **A, B, C, D oder E**.  
- Der Score wird angezeigt, inkl. kurzer Erklärung (z. B. „Score B: gutes Risiko mit wenigen Schwächen in XYZ“).  

**Geschäftslogik:**

- **Score A–B**  
  - Risiko gilt als „gut“ bzw. „akzeptabel innerhalb Delegationsrahmen“.  
  - **Kein Underwriting** nötig.  
  - Offer