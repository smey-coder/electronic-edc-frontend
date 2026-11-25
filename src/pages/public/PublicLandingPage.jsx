import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import usePublicSettings from '../../hooks/usePublicSettings';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';
import AboutSlideshow from '../../components/public/AboutSlideshow';
import EdcInstitutionsMarquee from '../../components/public/EdcInstitutionsMarquee';
import heroImage from '../../assets/public/image1.png';

// One icon for each item of `features.items`, in the same order.
const FEATURE_ICONS = [
  'M17 4H7l6 8-6 8h10', // formulas
  'M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2', // steps
  'M12 2l9 4v6c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V6l9-4z', // roles
  'M12.5 11.5L21 3M17 7l3 3M14.5 9.5l2 2M9 20a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z', // key
  'M12 16V4M7 9l5-5 5 5M4 20h16', // import
  'M3 5h18v11H3zM8 20h8M12 16v4', // devices
];

function Icon({ path, className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

/** Fades its content in the first time it scrolls into view. */
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    if (shown) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [shown]);

  return (
    <div ref={ref} className={`${shown ? 'pub-rise' : 'opacity-0'} ${className}`} style={shown ? { animationDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}

const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-[15px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(37,99,235,.7)] transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 active:scale-[.98]';
const secondaryButton =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-3 text-[15px] font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300/50 active:scale-[.98]';

export default function PublicLandingPage() {
  const { t, language } = usePublicSettings();
  const features = t('features.items');
  const steps = t('how.steps');

  return (
    <div className="pub-root min-h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <PublicNavbar />

      {/* key = the language, so the page fades in again when the language changes */}
      <main key={language} className="pub-fade">
        {/* ---------- Hero / Home ---------- */}
        <section id="home" className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 transition-colors">
          <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-100/60 dark:bg-blue-900/20 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-amber-100/60 dark:bg-amber-900/10 blur-3xl" aria-hidden="true" />

          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-24">
            <div>
              <p className="pub-rise inline-flex items-center gap-2 rounded-full border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-1 text-sm font-medium text-blue-700 dark:text-blue-300">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FFB629]" />
                {t('hero.badge')}
              </p>
              <h1 className="pub-rise mt-5 text-4xl font-bold leading-tight tracking-tight text-[#0F2438] dark:text-white sm:text-5xl" style={{ animationDelay: '80ms' }}>
                {t('hero.title')}
              </h1>
              <p className="pub-rise mt-5 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300" style={{ animationDelay: '160ms' }}>
                {t('hero.subtitle')}
              </p>

              <div className="pub-rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: '240ms' }}>
                <Link to="/signup" className={primaryButton}>
                  {t('hero.primary')}
                  <Icon path="M5 12h14M13 6l6 6-6 6" className="h-4 w-4" />
                </Link>
                <Link to="/login" className={secondaryButton}>{t('hero.secondary')}</Link>
              </div>

              <p className="pub-rise mt-5 flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400" style={{ animationDelay: '320ms' }}>
                <Icon path="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 8v5M12 16.5v.1" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                {t('hero.note')}
              </p>
            </div>

            <div className="pub-rise relative mx-auto w-full max-w-lg" style={{ animationDelay: '200ms' }}>
              <div className="relative overflow-hidden rounded-3xl bg-[#0F2438] dark:bg-slate-800 p-2 shadow-[0_30px_60px_-24px_rgba(15,36,56,.55)] border border-slate-700/50">
                <img src={heroImage} alt={t('hero.imageAlt')} className="aspect-[4/3] w-full rounded-2xl object-cover" />
                <svg viewBox="0 0 200 8" preserveAspectRatio="none" className="absolute inset-x-6 bottom-3 h-2 w-[calc(100%-3rem)]" aria-hidden="true">
                  <path className="pub-flow" pathLength="100" d="M0 4H200" stroke="#FFB629" strokeWidth="3" strokeLinecap="round" fill="none" />
                </svg>
              </div>

              <div className="pub-float absolute -left-3 top-8 rounded-xl bg-white dark:bg-slate-800 px-4 py-2.5 shadow-lg ring-1 ring-slate-100 dark:ring-slate-700 sm:-left-8">
                <span className="font-mono text-lg font-bold text-[#0F2438] dark:text-[#FFB629]">V = I × R</span>
              </div>
              <div className="pub-float pub-float-late absolute -right-3 bottom-14 rounded-xl bg-[#FFB629] px-4 py-2.5 shadow-lg sm:-right-8">
                <span className="font-mono text-lg font-bold text-[#0F2438]">P = V × I</span>
              </div>
              <div className="absolute -bottom-4 left-8 flex items-center gap-2 rounded-full bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 shadow-lg ring-1 ring-slate-100 dark:ring-slate-700">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                  <Icon path="M5 12.5l4.5 4.5L19 7.5" className="h-3 w-3" />
                </span>
                {t('hero.chipSteps')}
              </div>
            </div>
          </div>
        </section>

        {/* ---------- About & Slideshow ---------- */}
        <AboutSlideshow />

        {/* ---------- Features ---------- */}
        <section id="features" className="pub-section mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[#0F2438] dark:text-white sm:text-4xl">{t('features.title')}</h2>
            <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">{t('features.subtitle')}</p>
          </Reveal>

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((item, index) => (
              <li key={item.title}>
                <Reveal delay={(index % 3) * 90} className="h-full">
                  <article className="group h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-[0_18px_40px_-18px_rgba(15,36,56,.3)]">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F2438] dark:bg-slate-800 text-[#FFB629] transition-transform duration-200 group-hover:scale-110">
                      <Icon path={FEATURE_ICONS[index % FEATURE_ICONS.length]} />
                    </span>
                    <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                    <p className="mt-1.5 leading-relaxed text-slate-600 dark:text-slate-300">{item.text}</p>
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- How it works ---------- */}
        <section id="how" className="pub-section bg-slate-50 dark:bg-slate-950/50 py-16 lg:py-24 transition-colors">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-[#0F2438] dark:text-white sm:text-4xl">{t('how.title')}</h2>
            </Reveal>

            <ol className="relative mt-12 grid gap-8 md:grid-cols-3">
              <span className="pointer-events-none absolute left-[16.7%] right-[16.7%] top-6 hidden h-0.5 bg-gradient-to-r from-[#FFB629]/0 via-[#FFB629]/70 to-[#FFB629]/0 md:block" aria-hidden="true" />
              {steps.map((step, index) => (
                <li key={step.title}>
                  <Reveal delay={index * 120} className="h-full">
                    <div className="relative flex h-full flex-col items-center text-center">
                      <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#0F2438] dark:bg-slate-800 text-lg font-bold text-[#FFB629] ring-8 ring-slate-50 dark:ring-slate-950">
                        {index + 1}
                      </span>
                      <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                      <p className="mt-1.5 max-w-xs leading-relaxed text-slate-600 dark:text-slate-300">{step.text}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Partners / Institutions Marquee ---------- */}
        <EdcInstitutionsMarquee />

        {/* ---------- Call to action ---------- */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-[#0F2438] dark:bg-slate-800 border border-slate-700/50 px-6 py-14 text-center text-white sm:px-12">
              <svg viewBox="0 0 400 200" className="pointer-events-none absolute inset-0 h-full w-full opacity-40" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M0 40H90L110 60V120H180" stroke="#2A4A70" strokeWidth="1.5" />
                  <path d="M400 160H310L290 140V90H230" stroke="#2A4A70" strokeWidth="1.5" />
                  <path className="pub-flow" pathLength="100" d="M0 40H90L110 60V120H180" stroke="#FFB629" strokeWidth="2" />
                  <path className="pub-flow" pathLength="100" d="M400 160H310L290 140V90H230" stroke="#FFB629" strokeWidth="2" style={{ animationDelay: '-.9s' }} />
                </g>
              </svg>
              <div className="relative">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('cta.title')}</h2>
                <p className="mx-auto mt-3 max-w-md text-lg text-[#B9CBE3] dark:text-slate-300">{t('cta.text')}</p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link to="/signup" className="inline-flex items-center justify-center rounded-xl bg-[#FFB629] px-6 py-3 text-[15px] font-semibold text-[#0F2438] shadow-sm transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB629]/40 active:scale-[.98]">
                    {t('cta.primary')}
                  </Link>
                  <Link to="/login" className="inline-flex items-center justify-center rounded-xl border border-white/25 px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20">
                    {t('cta.secondary')}
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}