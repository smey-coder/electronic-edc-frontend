import { useContext } from 'react';
import { PublicSettingsContext } from '../context/PublicSettingsContext';

/**
 * const { t, language, setLanguage, languages, current } = usePublicSettings();
 *   t('hero.title')                         → the text in the chosen language
 *   t('footer.rights', { year: 2026 })      → fills in {year}
 *   t('features.items')                     → a whole list
 */
export default function usePublicSettings() {
  const context = useContext(PublicSettingsContext);
  if (!context) {
    throw new Error('usePublicSettings must be used inside <PublicSettingsProvider>.');
  }
  return context;
}