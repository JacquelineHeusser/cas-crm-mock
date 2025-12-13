# Test-Anleitung: Echtzeit-Validierung

## Vorbereitung

1. ✅ **Server läuft bereits** auf http://localhost:3000
2. ✅ Browser Preview ist aktiv

## Test-Schritte

### Schritt 1: Zum Offerten-Wizard navigieren

1. Öffne http://localhost:3000/login
2. Melde dich an mit einem Test-Account (z.B. `underwriter@zurich.ch` / `test1234`)
3. Klicke auf **Dashboard** oder navigiere zu `/quotes/new`
4. Du solltest jetzt bei **"Unternehmensdaten"** (Schritt 1) sein

### Schritt 2: Firmenname testen

**Was zu testen:**
- Gib **"A"** ein → ❌ Fehler: "zu kurz"
- Gib **"Test AG"** ein → ⏳ Loading → ✅ "Gültiger Firmenname"
- Lösche alles → ❌ "Pflichtfeld"

**Erwartetes Verhalten:**
- Validierung erfolgt nach 500ms (Debouncing)
- Icon rechts im Feld zeigt Status
- Feedback unterhalb des Feldes

### Schritt 3: Adresse testen

**Gültige Eingaben:**
- "Bahnhofstrasse 12" → ✅ "Gültige Adresse"
- "Hauptstr. 5a" → ✅ 
- "Rue de la Gare 23" → ✅

**Ungültige Eingaben:**
- "Bahnhofstrasse" (ohne Nummer) → ❌ Format falsch
- "12 Bahnhofstrasse" (verkehrte Reihenfolge) → ❌
- "Str" (zu kurz) → ❌

**Erwartetes Verhalten:**
- Hilfetext: "Bitte geben Sie Strasse und Hausnummer ein"
- Vorschläge bei Fehler: "Format: Strassenname + Hausnummer"

### Schritt 4: PLZ testen

**Gültige Eingaben:**
- "8000" → ✅ "Gültige PLZ" + 💡 "Ort: Zürich"
- "3000" → ✅ "Gültige PLZ" + 💡 "Ort: Bern"
- "4000" → ✅ "Gültige PLZ" + 💡 "Ort: Basel"
- "1200" → ✅ "Gültige PLZ" + 💡 "Ort: Genève"

**Ungültige Eingaben:**
- "123" (zu kurz) → ❌ "PLZ muss 4-stellig sein"
- "12345" (zu lang) → ❌
- "0999" (ausserhalb Bereich) → ❌ "Ungültige Schweizer PLZ"
- "9999" (nicht in DB) → ❌ "PLZ nicht in Datenbank" (wird trotzdem akzeptiert)

**Erwartetes Verhalten:**
- Zeigt passende Orte als Vorschlag
- Maximal 4 Zeichen möglich

### Schritt 5: Ort mit Auto-Complete testen

**WICHTIG: Zuerst PLZ eingeben!**

**Szenario A: PLZ-basierte Vorschläge**
1. Gib PLZ "8000" ein
2. Klicke ins Ort-Feld
3. **Dropdown erscheint** mit "Orte für PLZ 8000"
4. Klicke auf "Zürich"
5. → ✅ "Ort und PLZ passen zusammen"

**Szenario B: Keyboard Navigation**
1. PLZ "8000" eingegeben
2. Ort-Feld fokussieren
3. Tippe "Z"
4. Dropdown zeigt "Zürich"
5. Drücke ↓ (Pfeil runter) → Eintrag wird markiert
6. Drücke Enter → Ort wird übernommen

**Szenario C: Falscher Ort**
1. PLZ "8000" eingegeben
2. Gib "Basel" ein
3. → ❌ "Ort passt nicht zu PLZ 8000"
4. → 💡 "Vorschläge: Zürich"

**Szenario D: Fuzzy Search**
1. Keine PLZ oder ungültige PLZ
2. Gib "Zur" ein
3. → Dropdown zeigt "Zürich (8000)"
4. Klicke darauf

**Erwartetes Verhalten:**
- Dropdown erscheint automatisch bei PLZ-Match
- Keyboard-steuerbar (↑ ↓ Enter Escape)
- Click-outside schliesst Dropdown
- Zeigt PLZ in Klammern bei Fuzzy Search

### Schritt 6: URL testen (optional)

**Gültige Eingaben:**
- "www.google.ch" → ✅ "Gültiges URL-Format"
- "https://example.com" → ✅
- "firma.ch" → ✅ (https:// wird automatisch ergänzt)

**Ungültige Eingaben:**
- "nicht-gueltig" (ohne TLD) → ❌ "URL benötigt gültige Domain"
- "ht://falsch" → ❌

**Leeres Feld:**
- Kein Fehler (URL ist optional)
- Hilfetext: "Optional: Website Ihrer Firma"

### Schritt 7: Formular absenden

1. Fülle alle Pflichtfelder aus:
   - Firmenname: "Test AG"
   - Adresse: "Bahnhofstrasse 12"
   - PLZ: "8000"
   - Ort: "Zürich"
   - URL: (leer lassen oder gültige URL)

2. Klicke **"Weiter"**

3. **Erwartetes Verhalten:**
   - Formular wird abgesendet
   - Du kommst zu Schritt 2 (Cyber Risikoprofil)
   - Keine Fehler in der Browser-Konsole

---

## Zu überprüfende Features

### ✅ Debouncing
- [ ] Validierung erfolgt NICHT bei jedem Tastendruck
- [ ] Validierung erfolgt nach ~500ms Pause

### ✅ Loading States
- [ ] Spinner (⏳) wird während Validierung angezeigt
- [ ] Icon wechselt zu ✅ oder ❌ nach Validierung

### ✅ Visuelles Feedback
- [ ] Grünes Häkchen bei gültiger Eingabe
- [ ] Rotes X bei ungültiger Eingabe
- [ ] Hilfreiche Fehlermeldungen
- [ ] Vorschläge/Hints werden angezeigt

### ✅ Auto-Complete (Ort)
- [ ] Dropdown erscheint bei PLZ-Match
- [ ] Keyboard Navigation funktioniert
- [ ] Click-outside schliesst Dropdown
- [ ] Auswahl übernimmt Wert

### ✅ PLZ-Ort-Verknüpfung
- [ ] PLZ zeigt passende Orte
- [ ] Falscher Ort wird erkannt
- [ ] Vorschläge werden gemacht

### ✅ Performance
- [ ] Keine spürbaren Verzögerungen
- [ ] Smooth Transitions
- [ ] Kein Flackern beim Validieren

---

## Browser-Konsole prüfen

Öffne die **Developer Tools** (F12) und prüfe:

### Console Tab
- [ ] Keine Fehler (rot)
- [ ] Nur Warnungen erlaubt (gelb)

### Network Tab
- [ ] Keine unnötigen API-Calls
- [ ] Debouncing funktioniert (nicht bei jedem Keystroke)

---

## Bekannte Einschränkungen

1. **URL-Erreichbarkeit** wird NICHT geprüft (nur Format)
   - Server Action vorhanden, aber nicht integriert
   - Kann in Phase 5 hinzugefügt werden

2. **PLZ-Datenbank** ist nicht vollständig
   - 200+ Einträge (wichtigste Orte)
   - Seltene PLZ werden als "nicht in Datenbank" angezeigt
   - Werden trotzdem akzeptiert

3. **Duplikaten-Check** bei Firmenname nicht implementiert
   - Alle Namen werden akzeptiert
   - Kann später ergänzt werden

---

## Probleme melden

Falls etwas nicht funktioniert:

1. **Browser-Konsole öffnen** (F12)
2. **Screenshot** von Fehler machen
3. **Reproduktionsschritte** notieren:
   - Welches Feld?
   - Welche Eingabe?
   - Was ist das erwartete Verhalten?
   - Was passiert stattdessen?

---

## Test-Checkliste

- [ ] Server läuft
- [ ] Login erfolgreich
- [ ] Wizard-Seite lädt
- [ ] Firmenname validiert
- [ ] Adresse validiert
- [ ] PLZ validiert + zeigt Orte
- [ ] Ort Auto-Complete funktioniert
- [ ] PLZ-Ort-Match funktioniert
- [ ] URL validiert (optional)
- [ ] Formular kann abgesendet werden
- [ ] Keine Fehler in Konsole

---

## Erfolg! 🎉

Wenn alle Tests funktionieren:
- Feature ist einsatzbereit
- Kann in weitere Wizard-Schritte integriert werden
- Bereit für Commit

Bei Problemen:
- Screenshots und Fehlermeldungen sammeln
- Zurück zum Entwickler für Fixes
