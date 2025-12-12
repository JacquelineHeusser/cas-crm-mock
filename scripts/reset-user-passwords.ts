/**
 * Reset User Passwords Script
 * Setzt alle User-Passwörter auf Test123! zurück
 * 
 * Verwendung: npx tsx scripts/reset-user-passwords.ts
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Fehler: NEXT_PUBLIC_SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY nicht gesetzt');
  process.exit(1);
}

// Admin Client mit Service Role Key
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const TEST_PASSWORD = 'Test123!';

const testEmails = [
  'kontakt@swisstech.ch',
  'info@bauag.ch',
  'broker@swissquality.ch',
  'underwriter@zurich.ch',
  'mfu.teamleiter@zurich.ch',
  'head.cyber@zurich.ch',
];

async function resetPasswords() {
  console.log('🔄 Setze alle User-Passwörter zurück...\n');

  // Hole alle User
  const { data: usersData } = await supabase.auth.admin.listUsers();
  const users = usersData?.users || [];

  for (const email of testEmails) {
    console.log(`🔐 Setze Passwort für: ${email}`);
    
    try {
      // Finde User
      const user = users.find(u => u.email === email);
      
      if (!user) {
        console.log(`   ⚠️  User nicht gefunden, überspringe...`);
        continue;
      }

      // Setze neues Passwort
      const { error } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: TEST_PASSWORD }
      );

      if (error) {
        console.error(`   ❌ Fehler: ${error.message}`);
      } else {
        console.log(`   ✅ Passwort zurückgesetzt`);
      }
    } catch (error) {
      console.error(`   ❌ Fehler beim Zurücksetzen:`, error);
    }
  }

  console.log('\n✅ Passwort-Reset abgeschlossen!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 Alle User haben jetzt das Passwort: Test123!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('📋 Test-User:');
  console.log('   • kontakt@swisstech.ch');
  console.log('   • info@bauag.ch');
  console.log('   • broker@swissquality.ch');
  console.log('   • underwriter@zurich.ch');
  console.log('   • mfu.teamleiter@zurich.ch');
  console.log('   • head.cyber@zurich.ch');
}

// Script ausführen
resetPasswords()
  .catch((error) => {
    console.error('❌ Fataler Fehler:', error);
    process.exit(1);
  });
