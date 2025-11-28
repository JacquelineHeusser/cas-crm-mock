/**
 * User Menu Component
 * Dropdown mit User-Info und Logout
 */

import { logout } from '@/app/actions/auth';
import { UserRole } from '@prisma/client';

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    role: UserRole;
  };
}

export default function UserMenu({ user }: UserMenuProps) {
  const roleName = getRoleName(user.role);

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder">
        <div className="bg-neutral text-neutral-content rounded-full w-10">
          <span className="text-xl">{user.name.charAt(0).toUpperCase()}</span>
        </div>
      </label>
      <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
      >
        <li className="menu-title">
          <span>{user.name}</span>
        </li>
        <li className="disabled">
          <span className="text-xs">{user.email}</span>
        </li>
        <li className="disabled">
          <span className="text-xs badge badge-sm badge-ghost">{roleName}</span>
        </li>
        <div className="divider my-1"></div>
        <li>
          <a>Profil</a>
        </li>
        <li>
          <a>Einstellungen</a>
        </li>
        <div className="divider my-1"></div>
        <li>
          <form action={logout}>
            <button type="submit" className="w-full text-left">
              Abmelden
            </button>
          </form>
        </li>
      </ul>
    </div>
  );
}

/**
 * Gibt deutschen Rollennamen zurück
 */
function getRoleName(role: UserRole): string {
  switch (role) {
    case UserRole.CUSTOMER:
      return 'Firmenkunde';
    case UserRole.BROKER:
      return 'Vermittler';
    case UserRole.UNDERWRITER:
      return 'Underwriter';
    default:
      return role;
  }
}
