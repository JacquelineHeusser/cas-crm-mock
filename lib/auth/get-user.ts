/**
 * Helper-Funktion um aktuellen User aus Session zu holen
 */

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

/**
 * Holt den aktuellen User aus der Supabase Session
 * und verknüpft ihn mit dem Prisma User
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  
  const { data: { user: authUser }, error } = await supabase.auth.getUser();
  
  if (error || !authUser) {
    return null;
  }
  
  // Hole User aus Prisma DB
  const dbUser = await prisma.user.findUnique({
    where: { email: authUser.email! },
    include: {
      company: true,
    },
  });
  
  return dbUser;
}

/**
 * Holt nur die User ID aus der Session
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}
