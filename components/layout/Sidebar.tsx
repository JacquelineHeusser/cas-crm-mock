/**
 * Sidebar Component - Zurich One Design
 * Linke Navigation-Sidebar in Zurich Blau
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, AlertCircle, Phone, Calculator, BarChart3 } from 'lucide-react';
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
                    flex items-center gap-3 px-6 py-3 text-white hover:bg-white/10 transition-colors
                    ${isActive ? 'bg-[#001E5F]' : ''}
                  `}
                >
                  <Icon size={18} />
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
    { href: '/offerten', label: 'Meine Offerten', icon: Calculator },
    { href: '/claims/new', label: 'Meine Schäden', icon: AlertCircle },
    { href: '/contact', label: 'Kontakt', icon: Phone },
  ];

  // Broker und Underwriter haben gleiche Navigation
  const brokerUnderwriterItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/quotes/new', label: 'Neue Offerte', icon: Calculator },
    { href: '/broker-offerten', label: 'Alle Offerten', icon: Calculator },
    { href: '/broker-policen', label: 'Alle Policen', icon: FileText },
    { href: '/risikopruefungen', label: 'Risikoprüfungen', icon: AlertCircle },
    { href: '/contact', label: 'Kontakt', icon: Phone },
  ];

  // BI-Navigation für MFU-Teamleiter und Head Cyber Underwriting (inkl. BI-Cockpit)
  const headMfuItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/bi', label: 'BI', icon: BarChart3 },
    { href: '/broker-offerten', label: 'Alle Offerten', icon: Calculator },
    { href: '/broker-policen', label: 'Alle Policen', icon: FileText },
    { href: '/risikopruefungen', label: 'Risikoprüfungen', icon: AlertCircle },
    { href: '/contact', label: 'Kontakt', icon: Phone },
  ];

  // Head & MFU bekommen spezielle BI-Navigation
  if (role === UserRole.MFU_TEAMLEITER || role === UserRole.HEAD_CYBER_UNDERWRITING) {
    return headMfuItems;
  }

  // Broker & Underwriter behalten die bekannte Navigation
  if (role === UserRole.BROKER || role === UserRole.UNDERWRITER) {
    return brokerUnderwriterItems;
  }

  return customerItems;
}
