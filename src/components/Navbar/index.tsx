import { NavLink } from 'react-router-dom';
import {
  FaCalendarAlt,
  FaHome,
  FaSignInAlt,
  FaSignOutAlt,
  FaUserPlus,
  FaUsers,
  FaUserShield,
  FaSlidersH,
  FaExchangeAlt,
} from 'react-icons/fa';
import guitarIcon from '../../assets/guitar-svgrepo-com.svg';
import { useAuth } from '../../context/useAuth';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isSuperAdmin, logout } = useAuth();
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
      isActive
        ? 'bg-slate-950 text-white'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
    }`;

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <img src={guitarIcon} alt="" className="h-10 w-10 rounded-md bg-amber-50 p-2" />
          <div>
            <p className="text-base font-bold text-slate-950">TLLCC Worship</p>
            <p className="text-xs font-medium text-slate-500">Schedule tracker</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <NavLink to="/" className={linkClass}>
            <FaHome />
            Home
          </NavLink>
          <NavLink to="/calendar" className={linkClass}>
            <FaCalendarAlt />
            Calendar
          </NavLink>
          <NavLink to="/workers" className={linkClass}>
            <FaUsers />
            Workers
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/requests" className={linkClass}>
              <FaExchangeAlt />
              Requests
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/services" className={linkClass}>
              <FaSlidersH />
              Services
            </NavLink>
          )}
          {isSuperAdmin && (
            <NavLink to="/users" className={linkClass}>
              <FaUserShield />
              Users
            </NavLink>
          )}
          {isAuthenticated ? (
            <>
              <span className="inline-flex items-center rounded-md bg-amber-50 px-3 py-2 text-sm font-bold capitalize text-amber-700">
                {formatRole(user?.role)}
              </span>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                <FaSignInAlt />
                Login
              </NavLink>
              <NavLink to="/signup" className={linkClass}>
                <FaUserPlus />
                Signup
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const formatRole = (role?: string) => {
  if (role === 'super_admin') {
    return 'Super admin';
  }

  return role ?? '';
};

export default Navbar;
