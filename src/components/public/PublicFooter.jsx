import { Link } from 'react-router-dom';
import usePublicSettings from '../../hooks/usePublicSettings';
import LanguageSwitcher from './LanguageSwitcher';

function Bolt({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M13.5 2 5 13.2h5.6L9.8 22 19 10.4h-5.8L13.5 2Z" />
    </svg>
  );
}

export default function PublicFooter() {
  const { t } = usePublicSettings();
  const linkClass =
    'rounded text-[15px] text-[#B9CBE3] dark:text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB629]';

  return (
    <footer className="bg-[#0F2438] dark:bg-slate-950 dark:border-t dark:border-slate-800 text-white transition-colors duration-200">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFB629] text-[#0F2438]">
              <Bolt />
            </span>
            <span className="font-semibold tracking-tight">{t('brand.name')}</span>
          </div>
          <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-[#8FA9C9] dark:text-slate-400">{t('footer.tagline')}</p>
        </div>

        <nav aria-label={t('footer.explore')}>
          <p className="text-sm font-semibold text-white">{t('footer.explore')}</p>
          <ul className="mt-3 space-y-2.5">
            <li><a href="#features" className={linkClass}>{t('nav.features')}</a></li>
            <li><a href="#how" className={linkClass}>{t('nav.how')}</a></li>
          </ul>
        </nav>

        <nav aria-label={t('footer.account')}>
          <p className="text-sm font-semibold text-white">{t('footer.account')}</p>
          <ul className="mt-3 space-y-2.5">
            <li><Link to="/login" className={linkClass}>{t('nav.login')}</Link></li>
            <li><Link to="/signup" className={linkClass}>{t('nav.signup')}</Link></li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <p className="text-sm text-[#8FA9C9] dark:text-slate-400">{t('footer.rights', { year: new Date().getFullYear() })}</p>
          <LanguageSwitcher variant="segmented" tone="dark" />
        </div>
      </div>
    </footer>
  );
}