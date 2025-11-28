/**
 * Header Component
 * Zeigt Logo, Navigation und User-Menü
 */

import { getCurrentUser } from '@/lib/auth';
import Navigation from './Navigation';
import UserMenu from './UserMenu';
import Link from 'next/link';

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="navbar bg-base-100 border-b border-base-300">
      <div className="navbar-start">
        {/* Logo */}
        <Link href="/dashboard" className="btn btn-ghost text-xl">
          <span className="text-primary font-bold">Zurich</span>
          <span className="font-normal">One</span>
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        {user && <Navigation user={user} />}
      </div>

      <div className="navbar-end">
        {user && <UserMenu user={user} />}
      </div>

      {/* Mobile Menu */}
      {user && (
        <div className="dropdown dropdown-end lg:hidden ml-2">
          <label tabIndex={0} className="btn btn-ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <Navigation user={user} mobile />
          </ul>
        </div>
      )}
    </header>
  );
}
