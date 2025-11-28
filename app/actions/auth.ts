/**
 * Server Actions für Authentifizierung
 * Login, Logout und User-Registrierung
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Login mit E-Mail und Passwort
 */
export async function login(email: string, password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/dashboard');
}

/**
 * Logout
 */
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

/**
 * Sign Up - Erstellt Supabase Auth User UND Datenbank-Eintrag
 */
export async function signUp(data: {
  email: string;
  password: string;
  name: string;
  role: 'CUSTOMER' | 'BROKER' | 'UNDERWRITER';
  companyId?: string;
}) {
  const supabase = await createClient();

  // 1. Supabase Auth User erstellen
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: 'User konnte nicht erstellt werden' };
  }

  // 2. Datenbank-Eintrag erstellen
  try {
    await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
        companyId: data.companyId,
      },
    });
  } catch (error) {
    // Rollback: Supabase User löschen wenn DB-Insert fehlschlägt
    await supabase.auth.admin.deleteUser(authData.user.id);
    return { error: 'Fehler beim Erstellen des Benutzers' };
  }

  return { success: true };
}
