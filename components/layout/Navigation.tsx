/**
 * Navigation Component
 * Rollenspezifische Navigation Links
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole } from '@prisma/client';

interface NavigationProps {
  user: {
    role: UserRole;
  };
  mobile?: boolean;
}

export default function Navigation({ user, mobile = false }: NavigationProps) {
  const pathname = usePathname();

  const links = getNavigationLinks(user.role);

  const menuClasses = mobile
    ? 'menu-vertical'
    : 'menu menu-horizontal px-1';

  return (
    <ul className={`menu ${menuClasses}`}>
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              className={isActive ? 'active' : ''}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Gibt rollenspezifische Navigation-Links zurück
 */
function getNavigationLinks(role: UserRole) {
  const baseLinks = [
    { href: '/dashboard', label: 'Dashboard' },
  ];

  // Firmenkunden & Vermittler
  if (role === UserRole.CUSTOMER || role === UserRole.BROKER) {
    return [
      ...baseLinks,
      { href: '/quotes', label: 'Offerten' },
      { href: '/policies', label: 'Policen' },
    ];
  }

  // Underwriter
  if (role === UserRole.UNDERWRITER) {
    return [
      ...baseLinks,
      { href: '/underwriting', label: 'Underwriting' },
      { href: '/quotes', label: 'Alle Offerten' },
    ];
  }

  return baseLinks;
}
