import { useEffect, useState } from 'react';
import usePublicSettings from '../../hooks/usePublicSettings';
import slide1 from '../../assets/public/image1.png';
import slide2 from '../../assets/public/image2.png';
import slide3 from '../../assets/public/image3.png';

// អាចបន្ថែមរូបភាពផ្សេងៗទៀតនៅទីនេះ եើសសិនមាន (ឧ. slide2, slide3)
const SLIDE_IMAGES = [slide1, slide2, slide3];

export default function AboutSlideshow() {
  const { t } = usePublicSettings();
  const slides = t('about.slides') || [];
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-play slideshow every 4.5 seconds
  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prevSlide = () => setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setActiveIndex((prev) => (prev + 1) % slides.length);

  return (
    <section id="about" className="pub-section mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        {/* Left Text & Interactive Selector */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-1 text-sm font-medium text-blue-700 dark:text-blue-300">
            {t('about.badge')}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#0F2438] dark:text-white sm:text-4xl">
            {t('about.title')}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            {t('about.subtitle')}
          </p>

          <div className="mt-8 space-y-3">
            {slides.map((slide, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`w-full rounded-xl border p-4 text-left transition-all ${
                    isActive
                      ? 'border-blue-600 bg-blue-50/70 dark:border-blue-500 dark:bg-blue-950/40 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <p className={`font-semibold ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>
                    {idx + 1}. {slide.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{slide.caption}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Image Slideshow */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-[#0F2438] p-2 shadow-xl">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
            {slides.map((slide, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={slide.title}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <img
                    src={SLIDE_IMAGES[idx % SLIDE_IMAGES.length]}
                    alt={slide.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0F2438]/95 via-[#0F2438]/60 to-transparent p-6 text-white">
                    <p className="text-lg font-bold">{slide.title}</p>
                    <p className="mt-1 text-sm text-slate-200">{slide.caption}</p>
                  </div>
                </div>
              );
            })}

            {/* Prev / Next Arrows */}
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/70 focus:outline-none"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/70 focus:outline-none"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>

          {/* Indicators Dots */}
          <div className="mt-3 flex justify-center gap-2 pb-1">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all ${
                  idx === activeIndex ? 'w-6 bg-[#FFB629]' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}