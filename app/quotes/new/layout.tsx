/**
 * Layout für Offert-Erstellung
 * Überschreibt das authenticated Layout - zeigt nur TopBar ohne Sidebar
 */

import TopBar from '@/components/layout/TopBar';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function NewQuoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    // Überschreibt parent Layout komplett
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar user={user} />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
