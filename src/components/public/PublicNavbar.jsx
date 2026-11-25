import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import usePublicSettings from '../../hooks/usePublicSettings';
import { getRole, roleHome } from '../../utils/access';
import LanguageSwitcher from './LanguageSwitcher';

function Bolt({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M13.5 2 5 13.2h5.6L9.8 22 19 10.4h-5.8L13.5 2Z" />
    </svg>
  );
}

function SunIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function PublicNavbar() {
  const { t, theme, toggleTheme } = usePublicSettings();
  const auth = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // signed-in visitors get a shortcut to their own dashboard instead of the login buttons
  const authenticated = auth?.isAuthenticated ?? Boolean(auth?.user);
  const dashboard = authenticated ? roleHome(getRole(auth)) : null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => event.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const links = [
    { href: '#home', label: t('nav.home') || 'Home' },
    { href: '#about', label: t('nav.about') || 'About' },
    { href: '#features', label: t('nav.features') },
    { href: '#how', label: t('nav.how') },
    // { href: '#partners', label: t('nav.partners') || 'Partners' },
  ];

  const linkClass =
    'rounded-lg px-3 py-2 text-[15px] font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600';

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-white/85 dark:bg-slate-900/85 backdrop-blur transition-shadow duration-200 ${
        scrolled ? 'border-slate-200 dark:border-slate-800 shadow-[0_6px_24px_-12px_rgba(15,36,56,.25)]' : 'border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="pub-brand flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
          <span className="pub-bolt flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F2438] text-[#FFB629]">
            <Bolt />
          </span>
          <span className="font-semibold tracking-tight text-slate-900 dark:text-white">{t('brand.name')}</span>
        </Link>

        {/* desktop */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((link) => (
            <a key={link.href} href={link.href} className={linkClass}>{link.label}</a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Dark Mode"
            className="rounded-lg p-2 text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <LanguageSwitcher />
          {dashboard ? (
            <Link to={dashboard} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30">
              {t('nav.dashboard')}
            </Link>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                {t('nav.login')}
              </Link>
              <Link to="/signup" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30">
                {t('nav.signup')}
              </Link>
            </>
          )}
        </div>

        {/* mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Dark Mode"
            className="rounded-lg p-2 text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t('nav.closeMenu') : t('nav.menu')}
            className="rounded-lg p-2 text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d={menuOpen ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'} />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="pub-pop border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Main">
            {links.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className={`${linkClass} py-3`}>{link.label}</a>
            ))}
          </nav>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {dashboard ? (
              <Link to={dashboard} className="col-span-2 rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white">{t('nav.dashboard')}</Link>
            ) : (
              <>
                <Link to="/login" className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">{t('nav.login')}</Link>
                <Link to="/signup" className="rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white">{t('nav.signup')}</Link>
              </>
            )}
          </div>
          <div className="mt-4 flex justify-center">
            <LanguageSwitcher variant="segmented" />
          </div>
        </div>
      )}
    </header>
  );
}