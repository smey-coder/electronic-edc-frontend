import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ICONS = {
  cpu: "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18",
  shield: "M12 2l9 4v6c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V6l9-4z",
  key: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78Zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  book: "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z",
  arrowRight: "M5 12h14m-7-7 7 7-7 7",
  check: "M5 12.5l4.5 4.5L19 7.5",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  database: "M21 5c0 1.66-4 3-9 3s-9-1.34-9-3m18 0c0-1.66-4-3-9-3s-9 1.34-9 3m18 0v5c0 1.66-4 3-9 3s-9-1.34-9-3V5m18 7c0 1.66-4 3-9 3s-9-1.34-9-3m18 7c0 1.66-4 3-9 3s-9-1.34-9-3v-5",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
};

function Icon({ name, className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name] || ICONS.cpu} />
    </svg>
  );
}

const SLIDES = [
  {
    title: "Electrical Engineering Calculations",
    subtitle: "Precision digital tools for real-time voltage, current, power, and circuit simulations.",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Secure License Key Management",
    subtitle: "Encrypted student batch onboarding and instant authorization key redemptions.",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Role-Based Access Control (RBAC)",
    subtitle: "Structured privileges for Admins, Teachers, and Students across all academic modules.",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function PublicLandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/30">
              EDC
            </div>
            <span className="text-lg font-bold tracking-tight text-white">Electronic-EDC</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#home" className="hover:text-blue-400 transition">Home</a>
            <a href="#importance" className="hover:text-blue-400 transition">Importance</a>
            <a href="#features" className="hover:text-blue-400 transition">Features</a>
            <a href="#about" className="hover:text-blue-400 transition">About</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition">
              Sign In
            </Link>
            <Link to="/login" className="px-4 py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section & Auto Slideshow */}
      <section id="home" className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 z-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" /> Next-Gen Learning Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
              Empowering Electrical <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Engineering Education</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-xl">
              An advanced digital ecosystem for accurate calculations, secure license activation, and comprehensive academic management.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/login" className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition">
                Access Platform <Icon name="arrowRight" className="h-4 w-4" />
              </Link>
              <a href="#importance" className="px-6 py-3.5 rounded-xl border border-slate-700 bg-slate-800/50 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition">
                Why It Matters
              </a>
            </div>
          </div>

          {/* Slideshow Card */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-1000" />
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-800 shadow-2xl aspect-video flex items-center justify-center">
              {SLIDES.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
                  }`}
                >
                  <img src={slide.image} alt={slide.title} className="w-full h-full object-cover opacity-40" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent flex flex-col justify-end p-8">
                    <h3 className="text-xl font-bold text-white mb-1">{slide.title}</h3>
                    <p className="text-sm text-slate-300">{slide.subtitle}</p>
                  </div>
                </div>
              ))}
              <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                {SLIDES.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide ? "w-6 bg-blue-500" : "w-2 bg-slate-600"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Importance of Electrical Engineering Calculations */}
      <section id="importance" className="py-20 border-t border-slate-800 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold uppercase">
              Core Significance
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Importance of Electrical Engineering Calculations
            </h2>
            <p className="text-slate-400">
              Precise calculation is the backbone of safe, efficient, and reliable electrical systems in modern infrastructure and digital learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Icon name="zap" className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">System Safety & Protection</h3>
              <p className="text-slate-400 text-sm">
                Accurate load and fault calculations prevent equipment overload, electrical fires, and circuit failures, ensuring absolute safety for learners and technicians.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Icon name="cpu" className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Design Efficiency</h3>
              <p className="text-slate-400 text-sm">
                Streamlines the sizing of components, voltage drops analysis, and power factor correction to optimize power transmission and circuit performance.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Icon name="book" className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Academic Mastery</h3>
              <p className="text-slate-400 text-sm">
                Bridges theoretical formulas with practical calculations, enabling students to grasp complex engineering theorems through instant digital feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* System Features */}
      <section id="features" className="py-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase">
              Platform Capabilities
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Powerful System Features
            </h2>
            <p className="text-slate-400">
              Built with robust full-stack architecture to provide full administrative control, secure licensing, and interactive tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">01</div>
              <h3 className="text-lg font-bold text-white">Electrical Calculation Engine</h3>
              <p className="text-xs text-slate-400">Instant computational models and dynamic graph generation for technical coursework.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">02</div>
              <h3 className="text-lg font-bold text-white">License Key Management</h3>
              <p className="text-xs text-slate-400">Secure SHA-256 hashed keys, max-uses tracking, expiration control, and redemption logs.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">03</div>
              <h3 className="text-lg font-bold text-white">Role-Based Access Control</h3>
              <p className="text-xs text-slate-400">Granular permissions (`Admin`, `Teacher`, `Student`) protecting sensitive endpoints and UI views.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">04</div>
              <h3 className="text-lg font-bold text-white">User & Role Administration</h3>
              <p className="text-xs text-slate-400">Full CRUD management for accounts, role assignments, and custom permission checkboxes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="border-t border-slate-800 py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Electronic-EDC Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#home" className="hover:text-slate-300 transition">Privacy</a>
            <a href="#home" className="hover:text-slate-300 transition">Terms</a>
            <a href="#home" className="hover:text-slate-300 transition">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}