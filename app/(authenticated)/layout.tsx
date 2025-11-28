/**
 * Authenticated Layout - Zurich One Design
 * Sidebar links, TopBar oben, Content rechts
 */

import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar links */}
      <Sidebar user={user} />

      {/* Content Bereich rechts */}
      <div className="flex-1 flex flex-col">
        {/* TopBar */}
        <TopBar user={user} />

        {/* Main Content */}
        <main className="flex-1 bg-[#F5F7FA]">
          {children}
        </main>
      </div>
    </div>
  );
}
