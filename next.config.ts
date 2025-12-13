// next.config.ts
import type { NextConfig } from "next";

// Direkt die Umgebungsvariablen laden
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY müssen in .env gesetzt sein');
}

const config: NextConfig = {
  // Setze die Umgebungsvariablen für den Build-Prozess
  env: {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
  },
  
  webpack: (config) => {
    // Fügt Umgebungsvariablen zum Client-Bundle hinzu
    config.plugins.push(
      new (require('webpack').DefinePlugin)({
        'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(supabaseUrl),
        'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
      })
    );
    return config;
  },
  
  // Externe Pakete für Server Components
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // Für Middleware in Edge-Funktionen
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['localhost:3000', '127.0.0.1:51566', '*'],
    },
  },
  
  // Konfiguration für Turbopack
  turbopack: {
    root: __dirname,
  },
};

export default config;
