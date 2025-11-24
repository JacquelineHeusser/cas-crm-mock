/**
 * app/lib/prisma.ts - Prisma Client Singleton mit Connection Management
 * 
 * Best Practices für Supabase + Next.js:
 * - Singleton Pattern verhindert mehrere Client-Instanzen (Development)
 * - Connection Pool Limits über DATABASE_URL gesteuert
 * - Graceful Shutdown beim Beenden (nur lokal, nicht Serverless)
 * - Development Logging für Query-Debugging
 * - Vercel-optimiert: Kein Singleton in Production (Serverless)
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Environment Detection
const isDevelopment = process.env.NODE_ENV === "development";
const isVercel = process.env.VERCEL === "1";

/**
 * Prisma Client mit umgebungsspezifischen Einstellungen
 * 
 * Development: Singleton + ausführliches Logging
 * Production/Vercel: Neue Instanz pro Serverless Function
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isDevelopment ? ["query", "error", "warn"] : ["error"],
  });

// Singleton nur in Development (nicht auf Vercel)
// Vercel Serverless Functions brauchen keine Singleton-Instanz
if (!isVercel && isDevelopment) {
  globalForPrisma.prisma = prisma;
}

/**
 * Graceful Shutdown: Connections ordentlich schließen beim Beenden
 * 
 * Wichtig für:
 * - Development: Dev-Server-Restarts (Ctrl+C)
 * - Production (nicht Serverless): Docker/K8s Deployments
 * 
 * NICHT für Vercel Serverless:
 * - Functions werden hart beendet (kein SIGTERM)
 * - Connections werden automatisch vom Pooler geschlossen
 */
if (!isVercel) {
  const cleanup = async () => {
    console.log("\n🔌 Schließe Datenbank-Verbindungen...");
    await prisma.$disconnect();
    console.log("✅ Datenbank-Verbindungen geschlossen");
    process.exit(0);
  };

  // Shutdown-Events abfangen
  process.on("SIGINT", cleanup);  // Ctrl+C (Development)
  process.on("SIGTERM", cleanup); // Docker/Kubernetes Stop
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}
