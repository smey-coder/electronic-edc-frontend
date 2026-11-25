import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LANGUAGE, LANGUAGES, isSupportedLanguage, translate } from '../data/publicTranslations';

export const PublicSettingsContext = createContext(null);

const STORAGE_KEY = 'edc-public-language';
const THEME_STORAGE_KEY = 'edc-public-theme';
const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Noto+Sans+Khmer:wght@400;500;600;700&display=swap';

// Shared styles of the public pages (animations, fonts, and marquee). Khmer text gets its own font and a taller line.
const PUBLIC_CSS = `
  .pub-root { font-family: 'IBM Plex Sans', 'Noto Sans Khmer', ui-sans-serif, system-ui, sans-serif; }
  html[lang='km'] .pub-root { font-family: 'Noto Sans Khmer', 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif; line-height: 1.75; }
  .pub-section { scroll-margin-top: 5rem; }
  @media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth; } }

  @keyframes pub-rise  { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
  @keyframes pub-fade  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pub-pop   { from { opacity: 0; transform: translateY(-6px) scale(.98); } to { opacity: 1; transform: none; } }
  @keyframes pub-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  @keyframes pub-flow  { to { stroke-dashoffset: -25; } }
  @keyframes pub-zap   { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-10deg) scale(1.08); } 60% { transform: rotate(6deg); } }
  @keyframes pub-marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }

  .pub-rise  { opacity: 0; animation: pub-rise .6s cubic-bezier(.2,.7,.2,1) forwards; }
  .pub-fade  { animation: pub-fade .3s ease-out; }
  .pub-pop   { animation: pub-pop .16s ease-out; transform-origin: top right; }
  .pub-float { animation: pub-float 5s ease-in-out infinite; }
  .pub-float-late { animation-delay: -2.5s; }
  .pub-flow  { stroke-dasharray: 3 22; animation: pub-flow 1.8s linear infinite; }
  .pub-brand:hover .pub-bolt { animation: pub-zap .5s ease-in-out; }

  .pub-marquee-track {
    display: flex;
    width: max-content;
    animation: pub-marquee 30s linear infinite;
  }
  .pub-marquee-track:hover,
  .pub-marquee-paused {
    animation-play-state: paused;
  }

  @media (prefers-reduced-motion: reduce) {
    .pub-rise { animation: none; opacity: 1; }
    .pub-fade, .pub-pop, .pub-float, .pub-brand:hover .pub-bolt, .pub-marquee-track { animation: none; }
    .pub-flow { animation: none; stroke-dasharray: none; }
  }

  @keyframes pub-slideshow {
    0% { opacity: 0; transform: scale(1.03); }
    15% { opacity: 1; transform: scale(1); }
    85% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0.98); }
  }

  .pub-slide-animate {
    animation: pub-slideshow 4.5s ease-in-out infinite;
  }
`;

/** The saved language, otherwise the browser's language, otherwise English. */
function detectLanguage() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isSupportedLanguage(saved)) return saved;
  } catch {
    // storage can be blocked; ignore
  }
  const preferred = (typeof navigator !== 'undefined' ? navigator.languages ?? [navigator.language] : [])
    .map((code) => String(code).toLowerCase().slice(0, 2));
  return preferred.find(isSupportedLanguage) ?? DEFAULT_LANGUAGE;
}

/** Detect saved theme or system preference */
function detectTheme() {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch {
    // storage can be blocked; ignore
  }
  return 'light';
}

export function PublicSettingsProvider({ children }) {
  const [language, setLanguageState] = useState(detectLanguage);
  const [theme, setThemeState] = useState(detectTheme);

  const setLanguage = useCallback((code) => {
    if (!isSupportedLanguage(code)) return;
    setLanguageState(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // ignore
    }
  }, []);

  const setTheme = useCallback((newTheme) => {
    if (newTheme !== 'light' && newTheme !== 'dark') return;
    setThemeState(newTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  // Sync language attribute on html tag
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Sync dark class on html tag for Tailwind dark mode
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Load the fonts once
  useEffect(() => {
    if (document.getElementById('edc-public-fonts')) return;
    const link = document.createElement('link');
    link.id = 'edc-public-fonts';
    link.rel = 'stylesheet';
    link.href = FONTS_URL;
    document.head.appendChild(link);
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      languages: LANGUAGES,
      current: LANGUAGES.find((item) => item.code === language) ?? LANGUAGES[1],
      t: (path, values) => translate(language, path, values),
      theme,
      setTheme,
      toggleTheme,
    }),
    [language, setLanguage, theme, setTheme, toggleTheme],
  );

  return (
    <PublicSettingsContext.Provider value={value}>
      <style>{PUBLIC_CSS}</style>
      {children}
    </PublicSettingsContext.Provider>
  );
}