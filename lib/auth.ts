/**
 * Auth Utilities
 * Hilfsfunktionen für Authentifizierung und rollenbasierte Zugriffskontrolle
 */

import { createClient } from '@/lib/supabase/server';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Gibt den aktuellen authentifizierten User zurück
 * Inklusive Rolle und Company-Daten aus der Datenbank
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  
  const { data: { user: authUser }, error } = await supabase.auth.getUser();
  
  if (error || !authUser) {
    return null;
  }

  // User-Daten aus Datenbank holen (inkl. Rolle)
  let dbUser = null;
  try {
    dbUser = await prisma.user.findUnique({
      where: { email: authUser.email! },
      include: {
        company: true,
      },
    });
  } catch (err) {
    console.error('Fehler beim Laden des DB-Users in getCurrentUser:', err);
    dbUser = null;
  }

  if (!dbUser) {
    return null;
  }

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    company: dbUser.company,
  };
}

/**
 * Prüft, ob der User eine bestimmte Rolle hat
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === role;
}

/**
 * Prüft, ob der User eine der angegebenen Rollen hat
 */
export async function hasAnyRole(roles: UserRole[]): Promise<boolean> {
  const user = await getCurrentUser();
  return user ? roles.includes(user.role) : false;
}

/**
 * Erfordert Authentifizierung - wirft Fehler wenn nicht eingeloggt
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Nicht autorisiert');
  }
  
  return user;
}

/**
 * Erfordert eine bestimmte Rolle - wirft Fehler wenn nicht erfüllt
 */
export async function requireRole(role: UserRole) {
  const user = await requireAuth();
  
  if (user.role !== role) {
    throw new Error('Keine Berechtigung');
  }
  
  return user;
}

/**
 * Erfordert eine der angegebenen Rollen - wirft Fehler wenn nicht erfüllt
 */
export async function requireAnyRole(roles: UserRole[]) {
  const user = await requireAuth();
  
  if (!roles.includes(user.role)) {
    throw new Error('Keine Berechtigung');
  }
  
  return user;
}
