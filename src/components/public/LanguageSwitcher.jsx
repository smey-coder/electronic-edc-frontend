import { useEffect, useRef, useState } from 'react';
import usePublicSettings from '../../hooks/usePublicSettings';

const GLOBE =
  'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9Z';

function Icon({ path, className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

/**
- variant="menu"       a button that opens a list of languages (for the top bar)
- variant="segmented"  three buttons side by side (for the mobile menu and the footer)
- tone="light" | "dark"  light = for white backgrounds, dark = for the navy footer
 */
export default function LanguageSwitcher({ variant = 'menu', tone = 'light', className = '' }) {
  const { language, setLanguage, languages, current, t } = usePublicSettings();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const itemRefs = useRef([]);

  // close on outside click and on Escape
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  // focus the chosen language when the menu opens
  useEffect(() => {
    if (open) itemRefs.current[languages.findIndex((item) => item.code === language)]?.focus();
  }, [open, language, languages]);

  const choose = (code) => {
    setLanguage(code);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const moveFocus = (event, index) => {
    const last = languages.length - 1;
    const next = event.key === 'ArrowDown' ? (index === last ? 0 : index + 1) : event.key === 'ArrowUp' ? (index === 0 ? last : index - 1) : null;
    if (next !== null) {
      event.preventDefault();
      itemRefs.current[next]?.focus();
    }
  };

  const dark = tone === 'dark';

  /* ---------------- segmented buttons ---------------- */
  if (variant === 'segmented') {
    return (
      <div
        role="radiogroup"
        aria-label={t('nav.language')}
        className={`inline-flex rounded-xl p-1 ${dark ? 'bg-white/10' : 'bg-slate-100 dark:bg-slate-800'} ${className}`}
      >
        {languages.map((item) => {
          const active = item.code === language;
          return (
            <button
              key={item.code}
              type="button"
              role="radio"
              aria-checked={active}
              lang={item.code}
              onClick={() => setLanguage(item.code)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB629] ${
                active
                  ? dark ? 'bg-[#FFB629] text-[#0F2438] shadow-sm' : 'bg-white dark:bg-slate-700 text-[#0F2438] dark:text-white shadow-sm'
                  : dark ? 'text-[#B9CBE3] hover:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    );
  }

  /* ---------------- dropdown menu ---------------- */
  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t('nav.language')}: ${current.label}`}
        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20 ${
          dark
            ? 'border-white/20 text-white hover:bg-white/10'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
      >
        <Icon path={GLOBE} />
        <span>{current.short}</span>
        <Icon path="M6 9l6 6 6-6" className={`h-3.5 w-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t('nav.language')}
          className="pub-pop absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 shadow-[0_16px_40px_-12px_rgba(15,36,56,.3)]"
        >
          {languages.map((item, index) => {
            const active = item.code === language;
            return (
              <button
                key={item.code}
                ref={(node) => { itemRefs.current[index] = node; }}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                lang={item.code}
                onClick={() => choose(item.code)}
                onKeyDown={(event) => moveFocus(event, index)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:bg-blue-50 dark:focus-visible:bg-slate-700 ${
                  active
                    ? 'bg-blue-50 dark:bg-blue-950/60 font-semibold text-[#0F2438] dark:text-blue-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                }`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${active ? 'bg-[#0F2438] dark:bg-blue-600 text-[#FFB629] dark:text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                  {item.short}
                </span>
                <span className="flex-1">{item.label}</span>
                {active && <Icon path="M5 12.5l4.5 4.5L19 7.5" className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}