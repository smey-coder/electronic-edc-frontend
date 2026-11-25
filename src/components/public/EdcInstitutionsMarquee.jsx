import { useState } from 'react';
import usePublicSettings from '../../hooks/usePublicSettings';
import imageEdc from '../../assets/University_Image/Edc_logo_khmer.png';
import imageEac from '../../assets/University_Image/EAC.png';
import imageMme from '../../assets/University_Image/MME.png';
import imageIct from '../../assets/University_Image/ICT.png';
import imageNtti from '../../assets/University_Image/NTTI.png';
import imageNu from '../../assets/University_Image/Nu.png';
const EDC_AGENCIES = [
  { short: 'EDC', en: 'Electricité du Cambodge', km: 'អគ្គិសនីកម្ពុជា', logo: imageEdc },
  { short: 'EAC', en: 'Electricity Authority of Cambodia', km: 'អាជ្ញាធរអគ្គិសនីកម្ពុជា', logo: imageEac },
  { short: 'MME', en: 'Ministry of Mines and Energy', km: 'ក្រសួងរ៉ែ និងថាមពល', logo:  imageMme},
  { short: 'ITC', en: 'Institute of Technology of Cambodia', km: 'វិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា', logo:  imageIct},
  { short: 'NTTI', en: 'National Technical Training Institute', km: 'វិទ្យាស្ថានជាតិបណ្តុះបណ្តាលបច្ចេកទេស', logo:  imageNtti},
  { short: 'NU', en: 'Norton University (Engineering & IT)', km: 'សាកលវិទ្យាល័យ ន័រតុន', logo:  imageNu},
];

export default function EdcInstitutionsMarquee() {
  const { t, language } = usePublicSettings();
  const [paused, setPaused] = useState(false);

  return (
    <section id="partners" className="pub-section border-y border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 py-16 transition-colors">
      {/* Self-contained Animation Style to guarantee it runs */}
      <style>{`
        @keyframes edcMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .edc-marquee-track {
          display: flex;
          width: max-content;
          animation: edcMarquee 25s linear infinite;
        }
        .edc-marquee-track:hover,
        .edc-marquee-paused {
          animation-play-state: paused !important;
        }
      `}</style>

      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
          {t('partners.badge')}
        </span>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#0F2438] dark:text-white sm:text-3xl">
          {t('partners.title')}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-base text-slate-600 dark:text-slate-400">
          {t('partners.subtitle')}
        </p>
      </div>

      {/* Marquee Track Container */}
      <div className="relative mt-10 overflow-hidden px-4">
        <div className={`edc-marquee-track flex gap-6 ${paused ? 'edc-marquee-paused' : ''}`}>
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 gap-6" aria-hidden={copy === 1}>
              {EDC_AGENCIES.map((agency) => {
                const displayName = language === 'km' ? agency.km : agency.en;
                return (
                  <div
                    key={`${copy}-${agency.short}`}
                    title={`${displayName} — ${agency.en}`}
                    className="flex w-64 shrink-0 flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-center shadow-sm transition hover:border-blue-300 dark:hover:border-blue-700"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 p-2">
                      <img
                        src={agency.logo}
                        alt={agency.short}
                        loading="lazy"
                        draggable="false"
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling.style.display = 'flex';
                        }}
                      />
                      <span className="hidden h-full w-full items-center justify-center text-[#0F2438] dark:text-[#FFB629]">
                        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
                          <path d="M13.5 2 5 13.2h5.6L9.8 22 19 10.4h-5.8L13.5 2Z" />
                        </svg>
                      </span>
                    </div>
                    <strong className="mt-3 text-base font-bold text-[#0F2438] dark:text-white">
                      {agency.short}
                    </strong>
                    <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      {displayName}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Pause / Play Control */}
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => setPaused((prev) => !prev)}
          aria-pressed={paused}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-100 dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          {paused ? (
            <>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current"><path d="M8 5v14l11-7z" /></svg>
              <span>Play</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              <span>Pause</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}