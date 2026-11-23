import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import usePermission from '../hooks/usePermission';

const NAV_ITEMS = [
  { to: '/teacher/dashboard', label: 'Dashboard', icon: 'grid' },
  { to: '/teacher/students', label: 'My students', icon: 'students' },
  { to: '/teacher/calculations', label: 'EDC modules', icon: 'modules' },
  // Add `permission: 'student.read'` (or similar) to an item to hide it without that permission.
];

const ICONS = {
  grid: 'M4 4h7v7H4zM13 4h7v4h-7zM13 11h7v9h-7zM4 14h7v6H4z',
  students: 'M2 9l10-5 10 5-10 5L2 9ZM6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5M22 9v6',
  modules: 'M12 3l9 5-9 5-9-5 9-5ZM3 12.5l9 5 9-5M3 17l9 5 9-5',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  menu: 'M4 7h16M4 12h16M4 17h16',
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

export default function TeacherLayout() {
  const { user, logout } = useAuth();
  const { can } = usePermission();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Close the mobile menu after navigating, and when Escape is pressed.
  useEffect(() => setMenuOpen(false), [location.pathname]);
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => event.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const navItems = NAV_ITEMS.filter((item) => !item.permission || can(item.permission));
  const displayName = user?.full_name ?? user?.username ?? user?.email ?? 'Teacher';

  return (
    <div className="edc-root flex min-h-screen bg-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        .edc-root { font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif; }
      `}</style>

      {/* mobile overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 bg-[#0B2E2B]/50 lg:hidden" onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col justify-between bg-[#0F3D3A] p-5 text-white transition-transform duration-200 motion-reduce:transition-none lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center gap-2.5 px-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFB629] text-[#0F3D3A]">
              <Bolt />
            </span>
            <div className="leading-tight">
              <p className="font-semibold tracking-tight">Electronic EDC</p>
              <p className="text-xs text-[#8FC4BC]">Teacher portal</p>
            </div>
          </div>

          <nav className="mt-9 space-y-1" aria-label="Main">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB629] ${
                    isActive ? 'bg-white/10 text-white' : 'text-[#B5DAD4] hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-[#FFB629] transition-opacity ${
                        isActive ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                    <Icon name={item.icon} />
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFB629] text-xs font-bold text-[#0F3D3A]">
              {displayName.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium">{displayName}</p>
              <p className="truncate text-xs text-[#8FC4BC]">{user?.email ?? 'Teacher'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-[#B5DAD4] transition hover:border-red-400/60 hover:bg-red-500/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB629] disabled:opacity-60"
          >
            <Icon name="logout" className="h-4 w-4" />
            {loggingOut ? 'Signing out…' : 'Log out'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* mobile top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Icon name="menu" className="h-5 w-5" />
          </button>
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0F3D3A] text-[#FFB629]">
            <Bolt className="h-4 w-4" />
          </span>
          <span className="font-semibold tracking-tight text-slate-900">Electronic EDC</span>
        </header>

        <main className="flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}