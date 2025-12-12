/**
 * Setup Script für Supabase Auth User
 * Legt alle Test-User in Supabase Authentication an
 * 
 * Verwendung: npx tsx scripts/setup-supabase-users.ts
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Fehler: NEXT_PUBLIC_SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY nicht gesetzt');
  console.error('Bitte stelle sicher, dass .env.local existiert und die Variablen enthält');
  process.exit(1);
}

// Admin Client mit Service Role Key
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test-User mit Standard-Passwort
const TEST_PASSWORD = 'Test123!';

const testUsers = [
  // Kunden
  {
    email: 'kontakt@swisstech.ch',
    password: TEST_PASSWORD,
    name: 'Hans Meier',
    role: 'CUSTOMER',
  },
  {
    email: 'info@bauag.ch',
    password: TEST_PASSWORD,
    name: 'Anna Bauer',
    role: 'CUSTOMER',
  },
  // Vermittler
  {
    email: 'broker@swissquality.ch',
    password: TEST_PASSWORD,
    name: 'Peter Broker',
    role: 'BROKER',
  },
  // Underwriter
  {
    email: 'underwriter@zurich.ch',
    password: TEST_PASSWORD,
    name: 'Sabine Underwriter',
    role: 'UNDERWRITER',
  },
  // MFU Teamleiter (NEU)
  {
    email: 'mfu.teamleiter@zurich.ch',
    password: TEST_PASSWORD,
    name: 'Thomas Müller',
    role: 'MFU_TEAMLEITER',
  },
  // Head Cyber Underwriting (NEU)
  {
    email: 'head.cyber@zurich.ch',
    password: TEST_PASSWORD,
    name: 'Dr. Sarah Schmidt',
    role: 'HEAD_CYBER_UNDERWRITING',
  },
];

async function setupUsers() {
  console.log('🚀 Starte Supabase Auth User Setup...\n');

  for (const user of testUsers) {
    console.log(`📧 Erstelle User: ${user.email} (${user.role})`);
    
    try {
      // Prüfe ob User bereits existiert
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users.find(u => u.email === user.email);

      if (existingUser) {
        console.log(`   ℹ️  User existiert bereits, überspringe...`);
        continue;
      }

      // Erstelle neuen User
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm für Testzwecke
        user_metadata: {
          name: user.name,
        },
      });

      if (error) {
        console.error(`   ❌ Fehler: ${error.message}`);
      } else {
        console.log(`   ✅ Erfolgreich erstellt`);
      }
    } catch (error) {
      console.error(`   ❌ Fehler beim Erstellen:`, error);
    }
  }

  console.log('\n✅ Setup abgeschlossen!\n');
  console.log('📋 Login-Informationen:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Alle User haben das Passwort: Test123!\n');
  
  console.log('👥 Kunden:');
  console.log('   • kontakt@swisstech.ch (Hans Meier)');
  console.log('   • info@bauag.ch (Anna Bauer)\n');
  
  console.log('🤝 Vermittler:');
  console.log('   • broker@swissquality.ch (Peter Broker)\n');
  
  console.log('🔍 Underwriter & Führungskräfte:');
  console.log('   • underwriter@zurich.ch (Sabine Underwriter)');
  console.log('   • mfu.teamleiter@zurich.ch (Thomas Müller) ⭐ NEU');
  console.log('   • head.cyber@zurich.ch (Dr. Sarah Schmidt) ⭐ NEU\n');
  
  console.log('🔐 Standard-Passwort für alle: Test123!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// Script ausführen
setupUsers()
  .catch((error) => {
    console.error('❌ Fataler Fehler:', error);
    process.exit(1);
  });
