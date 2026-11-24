import { useState } from 'react';

export const DEFAULTS = {
  general: { language: 'en', timezone: 'Asia/Phnom_Penh', date_format: 'DD/MM/YYYY' },
  system: { theme: 'light', rows_per_page: 10, compact_mode: false },
  notifications: { email_enabled: true, announcements: true, grades: true, security_alerts: true },
};

export const SETTINGS_EVENT = 'app-settings-changed';
const keyOf = (userId) => `app-settings:${userId}`;

function readAll(userId) {
  try {
    const raw = localStorage.getItem(keyOf(userId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function readSection(userId, section) {
  return { ...DEFAULTS[section], ...(readAll(userId)[section] || {}) };
}

// អនុវត្ត System settings លើ <html>
export function applySystemSettings(userId) {
  const { theme, compact_mode } = readSection(userId, 'system');
  const dark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.dataset.compact = compact_mode ? 'true' : 'false';
}

export default function useLocalSettings(userId, section) {
  const [values, setValues] = useState(() => readSection(userId, section));

  const save = (next) => {
    try {
      localStorage.setItem(keyOf(userId), JSON.stringify({ ...readAll(userId), [section]: next }));
      setValues(next);
      window.dispatchEvent(new Event(SETTINGS_EVENT)); // ឱ្យ Layout អនុវត្តភ្លាម
      return true;
    } catch {
      return false;
    }
  };

  return [values, save];
}