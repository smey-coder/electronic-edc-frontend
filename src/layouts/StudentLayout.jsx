import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/student/dashboard', label: 'Home', icon: 'home' },
  { to: '/student/calculator', label: 'EDC calculator', icon: 'calculator' },
];

const ICONS = {
  home: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
  calculator:
    'M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM8 7h8M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  chevron: 'M6 9l6 6 6-6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
};

function Icon({ name, className = 'h-[18px] w-[18px]' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

function Bolt({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M13.5 2 5 13.2h5.6L9.8 22 19 10.4h-5.8L13.5 2Z" />
    </svg>
  );
}

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // mobile links
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const userMenuRef = useRef(null);

  const displayName = user?.full_name ?? user?.username ?? user?.email ?? 'Student';
  const initials = displayName.slice(0, 2).toUpperCase();

  // Shadow under the header once the page is scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus when the page changes.
  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Close the user menu on outside click or Escape.
  useEffect(() => {
    if (!userMenuOpen) return undefined;
    const onPointerDown = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setUserMenuOpen(false);
    };
    const onKeyDown = (event) => event.key === 'Escape' && setUserMenuOpen(false);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [userMenuOpen]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="edc-root flex min-h-screen flex-col bg-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        .edc-root { font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif; }

        @keyframes edc-page { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes edc-drop { from { opacity: 0; transform: translateY(-6px) scale(.98); } to { opacity: 1; transform: none; } }
        @keyframes edc-zap  { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-10deg) scale(1.08); } 60% { transform: rotate(6deg); } }

        .edc-page { animation: edc-page .35s cubic-bezier(.2,.7,.2,1); }
        .edc-drop { animation: edc-drop .16s ease-out; transform-origin: top right; }
        .edc-brand:hover .edc-bolt { animation: edc-zap .5s ease-in-out; }

        @media (prefers-reduced-motion: reduce) {
          .edc-page, .edc-drop, .edc-brand:hover .edc-bolt { animation: none; }
        }
      `}</style>

      {/* ---------- Top navbar ---------- */}
      <header
        className={`sticky top-0 z-40 border-b bg-white/85 backdrop-blur transition-shadow duration-200 ${
          scrolled ? 'border-slate-200 shadow-[0_6px_24px_-12px_rgba(15,36,56,.25)]' : 'border-slate-200/70'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex h-full items-center gap-8">
            {/* brand */}
            <NavLink to="/student/dashboard" className="edc-brand flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
              <span className="edc-bolt flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F2438] text-[#FFB629]">
                <Bolt />
              </span>
              <span className="leading-tight">
                <span className="block font-semibold tracking-tight text-slate-900">Electronic EDC</span>
                <span className="block text-xs text-slate-500">Student portal</span>
              </span>
            </NavLink>

            {/* desktop links */}
            <nav className="hidden h-full items-center gap-1 md:flex" aria-label="Main">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `relative flex h-full items-center gap-2 px-3 text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ` +
                    `after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:origin-left after:rounded-t after:bg-[#FFB629] after:transition-transform after:duration-200 ` +
                    (isActive
                      ? 'text-[#0F2438] after:scale-x-100'
                      : 'text-slate-500 after:scale-x-0 hover:text-slate-900 hover:after:scale-x-100 hover:after:bg-slate-300')
                  }
                >
                  <Icon name={item.icon} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* user menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F2438] text-xs font-semibold text-white">
                  {initials}
                </span>
                <span className="hidden max-w-[140px] truncate text-sm font-medium text-slate-800 sm:block">{displayName}</span>
                <Icon name="chevron" className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div role="menu" className="edc-drop absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_16px_40px_-12px_rgba(15,36,56,.3)]">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                    {user?.email && <p className="truncate text-xs text-slate-500">{user.email}</p>}
                    <span className="mt-2 inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">Student</span>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-600 focus-visible:bg-red-50 focus-visible:outline-none disabled:opacity-60"
                  >
                    <Icon name="logout" className="h-4 w-4" />
                    {loggingOut ? 'Signing out…' : 'Log out'}
                  </button>
                </div>
              )}
            </div>

            {/* mobile menu button */}
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 md:hidden"
            >
              <Icon name={menuOpen ? 'close' : 'menu'} className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* mobile links */}
        {menuOpen && (
          <nav className="edc-drop border-t border-slate-100 bg-white px-4 py-3 md:hidden" aria-label="Main">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium transition-colors ${
                    isActive ? 'bg-blue-50 text-[#0F2438]' : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <Icon name={item.icon} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      {/* ---------- Page content (fades in on each page change) ---------- */}
      <main key={location.pathname} className="edc-page mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-400">
        Electronic EDC · Electrical engineering calculation system
      </footer>
    </div>
  );
}