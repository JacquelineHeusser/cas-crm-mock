/**
 * Next.js Middleware für Auth-Schutz
 * Schützt Routes vor unauthentifizierten Zugriffen
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { type CookieOptions } from '@supabase/ssr';

// Lade Umgebungsvariablen aus der next.config.ts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Diese Überprüfung erfolgt bereits in next.config.ts, aber zur Sicherheit hier nochmal
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Fehler: Supabase URL oder Anon Key fehlen');
  throw new Error('Konfigurationsfehler: Supabase-Zugangsdaten fehlen');
}

// TypeScript weiß jetzt, dass diese Werte nicht mehr undefined sind
const SUPABASE_URL = supabaseUrl as string;
const SUPABASE_ANON_KEY = supabaseAnonKey as string;

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          
          supabaseResponse = NextResponse.next({
            request,
          });
          
          cookiesToSet.forEach(({ name, value, options }) => {
            if (options) {
              supabaseResponse.cookies.set(name, value, options);
            } else {
              supabaseResponse.cookies.set(name, value);
            }
          });
        },
      },
    }
  );

  // Session abrufen
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Geschützte Routes
  const protectedRoutes = ['/dashboard', '/quotes', '/underwriting'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Wenn geschützte Route und nicht eingeloggt → Redirect zu Login
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Wenn auf Login-Page und bereits eingeloggt → Redirect zu Dashboard
  if (request.nextUrl.pathname === '/login' && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
