/**
 * Script zum Erstellen der Test-Users in Supabase Auth
 * Nutzt die Admin API um Users ohne E-Mail-Bestätigung zu erstellen
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const testUsers = [
  {
    email: 'kontakt@swisstech.ch',
    password: 'test1234',
    name: 'Hans Meier',
    role: 'CUSTOMER',
  },
  {
    email: 'info@bauag.ch',
    password: 'test1234',
    name: 'Anna Bauer',
    role: 'CUSTOMER',
  },
  {
    email: 'broker@swissquality.ch',
    password: 'test1234',
    name: 'Peter Broker',
    role: 'BROKER',
  },
  {
    email: 'underwriter@zurich.ch',
    password: 'test1234',
    name: 'Sabine Underwriter',
    role: 'UNDERWRITER',
  },
];

async function createTestUsers() {
  console.log('🚀 Erstelle Test-Users in Supabase Auth...\n');

  for (const user of testUsers) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // E-Mail automatisch bestätigt
        user_metadata: {
          name: user.name,
          role: user.role,
        },
      });

      if (error) {
        console.error(`❌ Fehler bei ${user.email}:`, error.message);
      } else {
        console.log(`✅ User erstellt: ${user.email} (${user.role})`);
      }
    } catch (err) {
      console.error(`❌ Fehler bei ${user.email}:`, err);
    }
  }

  console.log('\n✨ Fertig!');
  console.log('\n📝 Test-Credentials:');
  testUsers.forEach((user) => {
    console.log(`   ${user.email} / test1234`);
  });
}

createTestUsers();
