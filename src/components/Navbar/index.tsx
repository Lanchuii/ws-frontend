import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  FaBars,
  FaCalendarAlt,
  FaExchangeAlt,
  FaHome,
  FaSignInAlt,
  FaSignOutAlt,
  FaSlidersH,
  FaTimes,
  FaUserPlus,
  FaUserShield,
  FaUsers,
} from 'react-icons/fa';
import guitarIcon from '../../assets/guitar-svgrepo-com.svg';
import NotificationInbox from '../Notifications/NotificationInbox';
import { useAuth } from '../../context/useAuth';

const mobileNavigationQuery = '(max-width: 1123px)';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isSuperAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileViewport, setMobileViewport] = useState(() =>
    window.matchMedia(mobileNavigationQuery).matches,
  );

  useEffect(() => {
    const query = window.matchMedia(mobileNavigationQuery);
    const updateViewport = () => setMobileViewport(query.matches);
    query.addEventListener('change', updateViewport);
    return () => query.removeEventListener('change', updateViewport);
  }, []);

  const linkClass = (
    { isActive }: { isActive: boolean },
    mobile = false,
  ) =>
    `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
      mobile ? 'w-full justify-start' : ''
    } ${
      isActive
        ? 'bg-slate-950 text-white'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
    }`;

  const navigationItems = (mobile = false) => {
    const getLinkClass = (state: { isActive: boolean }) =>
      linkClass(state, mobile);
    const closeMenu = () => {
      if (mobile) setMenuOpen(false);
    };

    return (
      <>
        <NavLink to="/" className={getLinkClass} onClick={closeMenu}>
          <FaHome />
          Home
        </NavLink>
        <NavLink to="/calendar" className={getLinkClass} onClick={closeMenu}>
          <FaCalendarAlt />
          Calendar
        </NavLink>
        <NavLink to="/workers" className={getLinkClass} onClick={closeMenu}>
          <FaUsers />
          Workers
        </NavLink>
        {isAuthenticated && (
          <NavLink to="/requests" className={getLinkClass} onClick={closeMenu}>
            <FaExchangeAlt />
            Requests
          </NavLink>
        )}
        {isAdmin && (
          <NavLink to="/services" className={getLinkClass} onClick={closeMenu}>
            <FaSlidersH />
            Services
          </NavLink>
        )}
        {isSuperAdmin && (
          <NavLink to="/users" className={getLinkClass} onClick={closeMenu}>
            <FaUserShield />
            Users
          </NavLink>
        )}
        {isAuthenticated ? (
          <>
            {!mobile && !mobileViewport && <NotificationInbox />}
            <span
              className={`inline-flex items-center rounded-md bg-amber-50 px-3 py-2 text-sm font-bold capitalize text-amber-700 ${
                mobile ? 'w-full' : ''
              }`}
            >
              {formatRole(user?.role)}
            </span>
            <button
              type="button"
              onClick={() => {
                logout();
                closeMenu();
              }}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 ${
                mobile ? 'w-full justify-start' : ''
              }`}
            >
              <FaSignOutAlt />
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={getLinkClass} onClick={closeMenu}>
              <FaSignInAlt />
              Login
            </NavLink>
            <NavLink to="/signup" className={getLinkClass} onClick={closeMenu}>
              <FaUserPlus />
              Signup
            </NavLink>
          </>
        )}
      </>
    );
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm sm:backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={guitarIcon}
              alt=""
              className="h-10 w-10 shrink-0 rounded-md bg-amber-50 p-2"
            />
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-slate-950">
                TLLCC Worship
              </p>
              <p className="truncate text-xs font-medium text-slate-500">
                Schedule tracker
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 lg:hidden">
            {isAuthenticated && mobileViewport && <NotificationInbox />}
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>

          <div className="hidden flex-wrap items-center justify-end gap-2 lg:flex">
            {navigationItems()}
          </div>
        </div>

        {menuOpen && (
          <div
            id="mobile-navigation"
            className="mt-3 grid gap-1 border-t border-slate-200 pt-3 lg:hidden"
          >
            {navigationItems(true)}
          </div>
        )}
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
