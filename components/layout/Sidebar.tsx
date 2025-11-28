/**
 * Sidebar Component - Zurich One Design
 * Linke Navigation-Sidebar in Zurich Blau
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, AlertCircle, Phone } from 'lucide-react';
import { UserRole } from '@prisma/client';

interface SidebarProps {
  user: {
    role: UserRole;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const navItems = getNavItems(user.role);

  return (
    <aside className="w-[200px] bg-[#0032A0] min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 pb-8">
        <Link href="/dashboard">
          <div className="text-white text-xl font-light tracking-wide">
            Zurich One
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-6 py-3 text-white hover:bg-white/10 transition-colors relative
                    ${isActive ? 'bg-[#001E5F]' : ''}
                  `}
                >
                  {isActive && (
                    <span className="absolute left-4 w-2 h-2 bg-white rounded-full"></span>
                  )}
                  <Icon size={18} className={isActive ? 'ml-4' : ''} />
                  <span className="text-sm font-light">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Illustration am Bottom */}
      <div className="p-6">
        <svg className="w-full h-32 opacity-30" viewBox="0 0 120 120" fill="none">
          {/* Abstrakte Illustration - vereinfacht */}
          <circle cx="30" cy="70" r="20" fill="currentColor" className="text-white/20" />
          <circle cx="70" cy="90" r="15" fill="currentColor" className="text-white/30" />
          <circle cx="50" cy="50" r="25" fill="currentColor" className="text-white/15" />
        </svg>
      </div>
    </aside>
  );
}

/**
 * Gibt rollenspezifische Navigation zurück
 */
function getNavItems(role: UserRole) {
  const customerItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/policen', label: 'Meine Policen', icon: FileText },
    { href: '/schaden', label: 'Meine Schäden', icon: AlertCircle },
    { href: '/kontakt', label: 'Kontakt', icon: Phone },
  ];

  const underwriterItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/underwriting', label: 'Underwriting', icon: FileText },
    { href: '/quotes', label: 'Alle Offerten', icon: FileText },
    { href: '/kontakt', label: 'Kontakt', icon: Phone },
  ];

  return role === UserRole.UNDERWRITER ? underwriterItems : customerItems;
}
