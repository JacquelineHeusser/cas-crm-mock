/**
 * TopBar Component - Zurich One Design
 * Header-Leiste mit Begrüssung und User-Avatar
 */

'use client';

import { logout } from '@/app/actions/auth';
import { UserRole } from '@prisma/client';
import { ChevronRight } from 'lucide-react';
import ZurichLogo from './ZurichLogo';
import Link from 'next/link';

interface TopBarProps {
  user: {
    name: string;
    email: string;
    role: UserRole;
  };
}

export default function TopBar({ user }: TopBarProps) {
  // Extrahiere Vor- und Nachname
  const nameParts = user.name.split(' ');
  const firstName = nameParts[0];
  const surname = nameParts.slice(1).join(' ');

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-3">
      <div className="flex justify-between items-center">
        {/* Zurich Logo links */}
        <Link href="/dashboard">
          <ZurichLogo height={28} />
        </Link>
        {/* User Avatar & Dropdown */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-sm gap-2 hover:bg-transparent">
            {/* Avatar Circle */}
            <div className="avatar placeholder">
              <div className="bg-[#CADB2D] text-[#0032A0] rounded-full w-8 h-8 flex items-center justify-center">
                <span className="text-sm font-semibold">
                  {firstName.charAt(0)}{surname.charAt(0)}
                </span>
              </div>
            </div>
            {/* User Name */}
            <span className="text-[#0032A0] font-normal">
              {firstName} <span className="font-semibold">{surname}</span>
            </span>
            <ChevronRight size={16} className="text-[#0032A0]" />
          </label>

          {/* Dropdown Menu */}
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 shadow-lg bg-white rounded-md w-56 mt-2 border border-gray-200"
          >
            <li className="menu-title px-4 py-2">
              <span className="text-[#0032A0] font-semibold">{user.name}</span>
            </li>
            <li className="px-4 py-1">
              <span className="text-xs text-gray-600">{user.email}</span>
            </li>
            <div className="divider my-1"></div>
            <li>
              <Link href="/profil" className="text-[#0032A0] hover:bg-gray-100">
                Profil
              </Link>
            </li>
            <li>
              <Link href="/profil/einstellungen" className="text-[#0032A0] hover:bg-gray-100">
                Einstellungen
              </Link>
            </li>
            <div className="divider my-1"></div>
            <li>
              <form action={logout}>
                <button 
                  type="submit" 
                  className="w-full text-left text-[#0032A0] hover:bg-gray-100"
                >
                  Abmelden
                </button>
              </form>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
