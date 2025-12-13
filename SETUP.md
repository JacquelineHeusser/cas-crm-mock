# Setup & Test-Anleitung

## Was bereits erledigt wurde

1. ✅ `.env`-Datei mit Supabase-Verbindungsdaten erstellt
2. ✅ Abhängigkeiten installiert (`npm install`)
3. ✅ Entwicklungsserver gestartet (läuft auf http://localhost:3000)
4. ✅ `middleware.ts` zu `proxy.ts` migriert (Next.js 16 Anforderung)
5. ✅ Server Actions Konfiguration angepasst

## Nächste Schritte

### Login testen

1. Öffne http://localhost:3000/login in deinem Browser (oder klicke auf "Open in Browser" im Browser Preview)
2. Melde dich mit deinem vorhandenen Supabase-Benutzer an
3. Nach erfolgreicher Anmeldung solltest du zum Dashboard weitergeleitet werden

## Bekannte Warnungen (können ignoriert werden)

- ⚠️ "Cross origin request detected" - Dies ist eine Warnung für die Entwicklungsumgebung und beeinträchtigt die Funktionalität nicht
- ⚠️ "middleware file convention is deprecated" - Wurde bereits behoben durch Umbenennung zu `proxy.ts`

## Troubleshooting

### Login funktioniert nicht
- Stelle sicher, dass dein Benutzer in Supabase Auth existiert
- Überprüfe, ob die E-Mail-Adresse und das Passwort korrekt sind
- Prüfe die Browser-Konsole (F12) und Terminal-Logs für Fehlermeldungen
- Stelle sicher, dass die Supabase-Verbindungsdaten in der `.env` korrekt sind

### Server startet nicht
- Stoppe den Server mit `Ctrl+C` und starte neu mit `npm run dev`
- Stelle sicher, dass Port 3000 nicht bereits belegt ist

### Änderungen werden nicht angezeigt
- Turbopack (Next.js 16) unterstützt Hot Reload - Änderungen sollten automatisch erscheinen
- Falls nicht: Browser neu laden (Cmd+R / Ctrl+R)
