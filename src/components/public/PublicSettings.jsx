import React from "react";
import { usePublicSettings } from "../../contexts/PublicSettingsContext";

export default function PublicSettings() {
  const {
    language,
    setLanguage,
    theme,
    toggleTheme,
  } = usePublicSettings();

  const isDarkMode = theme === 'dark';

  return (
    <div className="flex items-center gap-2">

      {/* Language Switcher */}
      <div className="relative">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          aria-label="Select language"
          className="
            appearance-none cursor-pointer
            rounded-xl border
            border-slate-300 dark:border-slate-700
            bg-white dark:bg-slate-800
            text-slate-700 dark:text-slate-200
            py-2 pl-3 pr-8
            text-sm font-medium
            outline-none
            focus:ring-2 focus:ring-blue-500
            transition
          "
        >
          <option value="en">🇬🇧 English</option>
          <option value="fr">🇫🇷 Français</option>
          <option value="km">🇰🇭 ខ្មែរ</option>
        </select>

        <span className="
          pointer-events-none absolute right-2 top-1/2
          -translate-y-1/2 text-xs
          text-slate-500
        ">
          ▼
        </span>
      </div>

      {/* Dark / Light Mode */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={
          isDarkMode ? "Switch to light mode" : "Switch to dark mode"
        }
        title={
          isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
        }
        className="
          h-10 w-10 flex items-center justify-center
          rounded-xl border
          border-slate-300 dark:border-slate-700
          bg-white dark:bg-slate-800
          text-slate-700 dark:text-slate-200
          hover:bg-slate-100 dark:hover:bg-slate-700
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500
        "
      >
        {isDarkMode ? (
          // Sun icon
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
          </svg>
        ) : (
          // Moon icon
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6.5 6.5 0 0 0 8.268 8.268c.344-.215.825-.003.803.401Z" />
          </svg>
        )}
      </button>
    </div>
  );
}