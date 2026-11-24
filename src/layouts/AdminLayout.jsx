import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import usePermission from '../hooks/usePermission';
import { applySystemSettings, SETTINGS_EVENT } from '../hooks/useLocalSettings';
import { settingsService } from '../api/settingsApi';

/* ------------------------------------------------------------------ */
/* Navigation, split into groups                                       */
/* ------------------------------------------------------------------ */
// `permission` hides a link when the user does not have it.
// Groups with no visible links are hidden. `collapsible: false` keeps a group always open.
const NAV_GROUPS = [
  {
    id: 'overview',
    label: 'Overview',
    collapsible: false,
    items: [{ to: '/admin/dashboard', label: 'Dashboard', icon: 'grid' }],
  },
  {
    id: 'people',
    label: 'People',
    items: [{ to: '/admin/students', 
    label: 'Students', icon: 'students', permission: 'student.read' }],
  },
  {
    id: 'access',
    label: 'Access control',
    items: [
      { to: '/admin/users', label: 'Users', icon: 'users', permission: 'user.read' },
      // { to: '/admin/students', label: 'Students', icon: 'graduation', permission: 'student.read' },
      { to: '/admin/roles', label: 'Roles', icon: 'shield', permission: 'role.read' },
      { to: '/admin/permissions', label: 'Permissions', icon: 'lock', permission: 'permission.read' },
      { to: '/admin/licenses', label: 'License keys', icon: 'key', permission: 'license.read' },
    ],
  },
  {
    id: 'calculation',
    label: 'Calculation',
    items: [{ to: '/admin/formulas', label: 'Formulas', icon: 'formulas', permission: 'formula.read' }],
  },
  {
    id: 'account',
    label: 'Account',
    items: [{ to: '/admin/settings', label: 'Settings', icon: 'settings' }],
  },
];

const ICONS = {
  grid: 'M4 4h7v7H4zM13 4h7v4h-7zM13 11h7v9h-7zM4 14h7v6H4z',
  users: 'M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM20 20v-1.5a3.5 3.5 0 0 0-2.5-3.35M15.5 4.2a3.5 3.5 0 0 1 0 6.6',
  shield: 'M12 2l9 4v6c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V6l9-4z',
  lock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  key: 'M12.5 11.5L21 3M17 7l3 3M14.5 9.5l2 2M9 20a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z',
  formulas: 'M17 4H7l6 8-6 8h10',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  menu: 'M4 7h16M4 12h16M4 17h16',
  chevron: 'M6 9l6 6 6-6',
  students: 'M2 9l10-5 10 5-10 5L2 9ZM6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5M22 9v6',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z',
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

/* Faint circuit drawing behind the brand, with a little current flowing along it. */
function CircuitDecoration() {
  return (
    <svg viewBox="0 0 200 130" className="pointer-events-none absolute right-0 top-0 h-32 w-48 opacity-70" aria-hidden="true">
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M200 28H152L134 46V86H96" stroke="#2A4A70" strokeWidth="1.5" />
        <path d="M200 70H176L166 80V112H128" stroke="#2A4A70" strokeWidth="1.5" />
        <path className="edc-flow" pathLength="100" d="M200 28H152L134 46V86H96" stroke="#FFB629" strokeWidth="2" />
        <path className="edc-flow edc-flow-late" pathLength="100" d="M200 70H176L166 80V112H128" stroke="#FFB629" strokeWidth="2" />
      </g>
      <g fill="#0F2438" stroke="#3A5F8C" strokeWidth="1.5">
        <circle cx="96" cy="86" r="3.5" />
        <circle cx="128" cy="112" r="3.5" />
      </g>
    </svg>
  );
}

function Avatar({ user, name, className = 'h-9 w-9 text-xs' }) {
  const [broken, setBroken] = useState(false);
  const src = user?.avatar_url ?? user?.avatar ?? user?.photo_url ?? null;

  if (src && !broken) {
    return <img src={src} alt="" onError={() => setBroken(true)} className={`${className} shrink-0 rounded-full object-cover`} />;
  }
  return (
    <span className={`${className} flex shrink-0 items-center justify-center rounded-full bg-[#FFB629] font-bold text-[#0F2438]`}>
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Logout confirmation                                                 */
/* ------------------------------------------------------------------ */
function LogoutDialog({ busy, onCancel, onConfirm }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus(); // the safe choice is focused first
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => event.key === 'Escape' && !busy && onCancel();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [busy, onCancel]);

  return (
    <div
      className="edc-fade fixed inset-0 z-[70] flex items-center justify-center bg-[#0F2438]/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="logout-title"
        aria-describedby="logout-text"
        className="edc-pop w-full max-w-sm rounded-2xl bg-white p-7 text-center shadow-2xl"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <Icon name="logout" className="h-6 w-6" />
        </span>
        <h2 id="logout-title" className="mt-5 text-xl font-bold tracking-tight text-slate-900">Log out?</h2>
        <p id="logout-text" className="mt-2 text-[15px] leading-relaxed text-slate-600">
          You will need to sign in again to use the admin portal.
        </p>
        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300/60 disabled:opacity-60"
          >
            Stay signed in
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-600/30 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy && <span className="edc-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
            {busy ? 'Signing out…' : 'Log out'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */
export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { can } = usePermission();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [closedGroups, setClosedGroups] = useState({});
  const [confirmLogout, setConfirmLogout] = useState(false);
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

  const groups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.permission || can(item.permission)),
  })).filter((group) => group.items.length > 0);

  const isActivePath = (to) => location.pathname === to || location.pathname.startsWith(`${to}/`);
  const currentGroup = groups.find((group) => group.items.some((item) => isActivePath(item.to)));
  const currentItem = currentGroup?.items.find((item) => isActivePath(item.to));

  const toggleGroup = (id) => setClosedGroups((current) => ({ ...current, [id]: !current[id] }));
  const displayName = user?.username ?? user?.email ?? 'Admin';

  let itemIndex = 0; // for the staggered entrance

  return (
    <div className="edc-root flex min-h-screen bg-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        .edc-root { font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif; }

        @keyframes edc-in    { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: none; } }
        @keyframes edc-page  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes edc-fade  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes edc-pop   { from { opacity: 0; transform: translateY(12px) scale(.97); } to { opacity: 1; transform: none; } }
        @keyframes edc-flow  { to { stroke-dashoffset: -25; } }
        @keyframes edc-spin  { to { transform: rotate(360deg); } }

        .edc-in    { opacity: 0; animation: edc-in .45s cubic-bezier(.2,.7,.2,1) forwards; }
        .edc-page  { animation: edc-page .35s cubic-bezier(.2,.7,.2,1); }
        .edc-fade  { animation: edc-fade .15s ease-out; }
        .edc-pop   { animation: edc-pop .22s cubic-bezier(.2,.7,.2,1); }
        .edc-spin  { animation: edc-spin .7s linear infinite; }
        .edc-flow  { stroke-dasharray: 3 22; animation: edc-flow 1.8s linear infinite; }
        .edc-flow-late { animation-delay: -.9s; }

        .edc-nav-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.18) transparent; }

        @media (prefers-reduced-motion: reduce) {
          .edc-in, .edc-page, .edc-fade, .edc-pop, .edc-spin { animation: none; opacity: 1; }
          .edc-flow { animation: none; stroke-dasharray: none; }
        }
      `}</style>

      {/* mobile overlay */}
      {menuOpen && (
        <div className="edc-fade fixed inset-0 z-30 bg-[#0F2438]/50 lg:hidden" onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}

      {/* ---------- Sidebar ---------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col overflow-hidden bg-[#0F2438] text-white transition-transform duration-200 motion-reduce:transition-none lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <CircuitDecoration />

        {/* brand */}
        <div className="relative flex items-center gap-2.5 px-5 pb-6 pt-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFB629] text-[#0F2438] shadow-[0_6px_18px_-6px_rgba(255,182,41,.6)]">
            <Bolt className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <p className="font-semibold tracking-tight">Electronic EDC</p>
            <p className="text-xs text-[#8FA9C9]">Admin portal</p>
          </div>
        </div>

        {/* grouped navigation */}
        <nav className="edc-nav-scroll relative flex-1 space-y-5 overflow-y-auto px-3 pb-4" aria-label="Main">
          {groups.map((group) => {
            const collapsible = group.collapsible !== false;
            const open = !collapsible || !closedGroups[group.id];
            const hasActive = group.items.some((item) => isActivePath(item.to));
            const panelId = `nav-group-${group.id}`;

            return (
              <div key={group.id}>
                {collapsible ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    aria-expanded={open}
                    aria-controls={panelId}
                    className="group flex w-full items-center justify-between rounded-md px-3 py-1.5 text-xs font-semibold text-[#7E9BC0] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB629]"
                  >
                    <span className="flex items-center gap-2">
                      {group.label}
                      {!open && hasActive && <span className="h-1.5 w-1.5 rounded-full bg-[#FFB629]" />}
                    </span>
                    <Icon name="chevron" className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? '' : '-rotate-90'}`} />
                  </button>
                ) : (
                  <p className="px-3 py-1.5 text-xs font-semibold text-[#7E9BC0]">{group.label}</p>
                )}

                {/* animated open / close */}
                <div
                  id={panelId}
                  className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="overflow-hidden">
                    <ul className="mt-1 space-y-0.5">
                      {group.items.map((item) => {
                        const delay = 80 + itemIndex++ * 45;
                        return (
                          <li key={item.to} className="edc-in" style={{ animationDelay: `${delay}ms` }}>
                            <NavLink
                              to={item.to}
                              tabIndex={open ? 0 : -1}
                              className={({ isActive }) =>
                                `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB629] ${
                                  isActive ? 'bg-white/10 text-white' : 'text-[#B9CBE3] hover:bg-white/5 hover:pl-4 hover:text-white'
                                }`
                              }
                            >
                              {({ isActive }) => (
                                <>
                                  <span className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-[#FFB629] transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                                  <Icon name={item.icon} className={`h-[18px] w-[18px] transition-colors ${isActive ? 'text-[#FFB629]' : 'text-[#8FA9C9] group-hover:text-white'}`} />
                                  {item.label}
                                </>
                              )}
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* account */}
        <div className="relative space-y-3 border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
            <div className="relative">
              <Avatar user={user} name={displayName} />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0F2438] bg-emerald-400" title="Signed in" />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium">{displayName}</p>
              <p className="truncate text-xs text-[#8FA9C9]">{user?.email ?? 'Administrator'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setConfirmLogout(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-[#B9CBE3] transition hover:border-red-400/60 hover:bg-red-500/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB629]"
          >
            <Icon name="logout" className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* ---------- Main ---------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur sm:px-8">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:hidden"
          >
            <Icon name="menu" className="h-5 w-5" />
          </button>

          <div className="min-w-0 leading-tight">
            {currentGroup && <p className="truncate text-xs text-slate-500">{currentGroup.label}</p>}
            <p className="truncate font-semibold tracking-tight text-slate-900">{currentItem?.label ?? 'Admin portal'}</p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden rounded-full bg-[#0F2438] px-3 py-1 text-xs font-medium text-white sm:inline-block">Admin</span>
            <Avatar user={user} name={displayName} className="h-8 w-8 text-xs" />
          </div>
        </header>

        <main key={location.pathname} className="edc-page flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>

      {confirmLogout && (
        <LogoutDialog busy={loggingOut} onCancel={() => setConfirmLogout(false)} onConfirm={handleLogout} />
      )}
    </div>
  );
}