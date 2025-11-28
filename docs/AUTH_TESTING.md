# Auth Testing - Anleitung

## 1. Supabase API Keys holen

1. Gehe zu [supabase.com](https://supabase.com)
2. Öffne dein Projekt: **bkfwogbsfhoqphvrmwxu**
3. Navigiere zu: **Settings** → **API**
4. Kopiere folgende Keys:
   - **URL**: `https://bkfwogbsfhoqphvrmwxu.supabase.co` (bereits in .env)
   - **anon public**: Den Key kopieren
   - **service_role**: Den Key kopieren (⚠️ **geheim!**)

## 2. .env Datei aktualisieren

Ersetze in `.env`:

```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY="dein-anon-key-hier"
```

mit dem tatsächlichen **anon public** Key.

Füge hinzu:

```bash
SUPABASE_SERVICE_ROLE_KEY="dein-service-role-key-hier"
```

## 3. Test-Users erstellen

Es gibt **zwei Möglichkeiten**:

### Option A: Via Script (empfohlen)

```bash
tsx scripts/create-test-users.ts
```

Das Script erstellt automatisch alle 4 Test-Users mit Passwort `test1234`.

### Option B: Manuell in Supabase Dashboard

1. Gehe zu: **Authentication** → **Users**
2. Klicke auf **Add user** → **Create new user**
3. Erstelle diese Users:

| E-Mail | Passwort | Rolle |
|--------|----------|-------|
| kontakt@swisstech.ch | test1234 | CUSTOMER |
| info@bauag.ch | test1234 | CUSTOMER |
| broker@swissquality.ch | test1234 | BROKER |
| underwriter@zurich.ch | test1234 | UNDERWRITER |

⚠️ **Wichtig**: Setze bei jedem User "Auto Confirm Email" auf **ON**

## 4. Dev-Server starten

```bash
npm run dev
```

## 5. Login testen

1. Öffne: http://localhost:3000/login
2. Teste einen der Test-Users:
   - **E-Mail**: `kontakt@swisstech.ch`
   - **Passwort**: `test1234`
3. Bei erfolgreichem Login wirst du zu `/dashboard` weitergeleitet
4. Das Dashboard zeigt rollenspezifische Inhalte

## 6. Verschiedene Rollen testen

Logge dich mit verschiedenen Test-Accounts ein, um die unterschiedlichen Dashboards zu sehen:

- **CUSTOMER** (Firmenkunde): Sieht "Ihre Cyberversicherung"
- **BROKER** (Vermittler): Sieht "Vermittler-Bereich"
- **UNDERWRITER**: Sieht "Underwriting-Bereich"

## Troubleshooting

### "Invalid API key"
→ Prüfe, ob `NEXT_PUBLIC_SUPABASE_ANON_KEY` korrekt in `.env` steht
→ Dev-Server neu starten nach .env-Änderungen

### "User not found"
→ Der User existiert in Supabase Auth, aber nicht in der Datenbank
→ Führe `npx prisma db seed` nochmal aus

### "Not authorized"
→ Die E-Mail-Adresse des Auth-Users stimmt nicht mit der Datenbank überein
→ Prüfe, dass beide identisch sind

## Next Steps

Nach erfolgreichem Auth-Test:
→ **Schritt 3: Risk Score Engine** implementieren
