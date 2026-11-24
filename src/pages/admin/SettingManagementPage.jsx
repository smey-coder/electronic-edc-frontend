import { useEffect, useState } from 'react';
import { settingsService } from '../../api/settingsApi';
import { getErrorMessage } from '../../api/studentApi';
import ProfileForm from '../../components/forms/settings/ProfileForm';
import AccountForm from '../../components/forms/settings/AccountForm';
import PasswordForm from '../../components/forms/settings/PasswordForm';
import { GeneralForm, SystemForm, NotificationForm } from '../../components/forms/settings/LocalSettingsForms';

/* ------------------------------------------------------------------ */
/* Tabs និង icons                                                      */
/* ------------------------------------------------------------------ */
const TABS = [
  { key: 'general', label: 'General', icon: 'sliders', title: 'General preferences', text: 'Language, time zone and how dates are shown.' },
  { key: 'profile', label: 'Profile', icon: 'user', title: 'Your profile', text: 'Keep your personal and contact details up to date.' },
  { key: 'security', label: 'Security', icon: 'shield', title: 'Password and security', text: 'Change your password to keep your account safe.' },
  { key: 'system', label: 'System', icon: 'monitor', title: 'System appearance', text: 'Theme, table size and spacing.' },
  { key: 'notifications', label: 'Notification', icon: 'bell', title: 'Notifications', text: 'Choose which updates you want to receive.' },
];

const ICONS = {
  sliders: 'M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1M15 4v4M9 10v4M17 16v4',
  user: 'M20 21v-1.5a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4V21M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  shield: 'M12 2l9 4v6c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V6l9-4zM9 12l2 2 4-4',
  monitor: 'M3 5h18v11H3zM8 20h8M12 16v4',
  bell: 'M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  refresh: 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z',
};

function Icon({ name, className = 'h-[18px] w-[18px]' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Avatar: រូបថត ឬអក្សរដំបូង                                           */
/* ------------------------------------------------------------------ */
function Avatar({ profile, className = 'h-20 w-20 text-2xl' }) {
  const [broken, setBroken] = useState(false);
  const photo = profile.photo_url;
  const name = profile.full_name || profile.username || '?';
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  if (photo && !broken) {
    return <img src={photo} alt="" onError={() => setBroken(true)} className={`${className} shrink-0 rounded-full object-cover ring-4 ring-white/15`} />;
  }
  return (
    <span className={`${className} flex shrink-0 items-center justify-center rounded-full bg-[#FFB629] font-bold text-[#0F2438] ring-4 ring-white/15`}>
      {initials}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* រូបភាព: Gear វិល + ផ្កាយព្រិច                                       */
/* ------------------------------------------------------------------ */
function GearArt() {
  return (
    <svg viewBox="0 0 200 150" className="pointer-events-none absolute -right-4 -top-2 hidden h-48 w-auto sm:block" aria-hidden="true">
      <g className="set-float">
        <g className="set-spin" style={{ transformOrigin: '120px 78px' }}>
          <g transform="translate(66 24) scale(4.5)" fill="#162F4B" stroke="#3A5F8C" strokeWidth="0.45" strokeLinejoin="round">
            <path d={ICONS.gear} />
          </g>
        </g>
        <g className="set-spin-rev" style={{ transformOrigin: '42px 118px' }}>
          <g transform="translate(24 100) scale(1.5)" fill="none" stroke="#FFB629" strokeWidth="1.2" strokeLinejoin="round">
            <path d={ICONS.gear} />
          </g>
        </g>
      </g>
      <g fill="#FFB629">
        <circle className="set-twinkle" cx="28" cy="34" r="2.5" />
        <circle className="set-twinkle set-late" cx="184" cy="30" r="2" />
        <circle className="set-twinkle" cx="176" cy="132" r="1.8" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton ពេលកំពុងផ្ទុក                                              */
/* ------------------------------------------------------------------ */
function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-5 w-40 rounded bg-slate-100" />
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-11 rounded-xl bg-slate-100" />)}
      </div>
      <div className="h-11 w-32 rounded-lg bg-slate-100" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ទំព័រ                                                                */
/* ------------------------------------------------------------------ */
export default function SettingsPage() {
  const [tab, setTab] = useState('general');
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setError('');
    settingsService
      .getProfile()
      .then(setProfile)
      .catch((e) => setError(getErrorMessage(e, 'Unable to load your profile.')));
  };

  useEffect(load, []);

  // ក្រោយ Save Profile → ធ្វើឱ្យទិន្នន័យថ្មី ហើយប្រាប់ Layout (sidebar) ឱ្យថ្មីតាម
  const handleSaved = (data) => {
    setProfile(data);
    window.dispatchEvent(new CustomEvent('app-profile-updated', { detail: data }));
  };

  const activeIndex = TABS.findIndex((t) => t.key === tab);
  const active = TABS[activeIndex];
  const role = profile?.roles?.[0];

  return (
    <div className="mx-auto max-w-5xl pb-8 text-slate-800">
      <style>{`
        @keyframes set-rise   { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        @keyframes set-swap   { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: none; } }
        @keyframes set-float  { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes set-spin   { to { transform: rotate(360deg); } }
        @keyframes set-spinr  { to { transform: rotate(-360deg); } }
        @keyframes set-twinkle { 0%,100% { opacity: .25; } 50% { opacity: 1; } }
        .set-rise    { opacity: 0; animation: set-rise .45s cubic-bezier(.2,.7,.2,1) forwards; }
        .set-swap    { animation: set-swap .3s cubic-bezier(.2,.7,.2,1); }
        .set-float   { animation: set-float 4s ease-in-out infinite; }
        .set-spin    { animation: set-spin 28s linear infinite; }
        .set-spin-rev{ animation: set-spinr 14s linear infinite; }
        .set-twinkle { animation: set-twinkle 2.4s ease-in-out infinite; }
        .set-late    { animation-delay: -1.2s; }
        @media (prefers-reduced-motion: reduce) {
          .set-rise, .set-swap, .set-float, .set-spin, .set-spin-rev, .set-twinkle { animation: none; opacity: 1; }
        }
      `}</style>

      {/* ---------- Banner ---------- */}
      <section className="set-rise relative overflow-hidden rounded-2xl bg-[#0F2438] p-6 text-white shadow-[0_18px_40px_-20px_rgba(15,36,56,.6)] sm:p-8">
        <GearArt />
        <div className="relative flex flex-wrap items-center gap-5">
          {profile ? (
            <Avatar profile={profile} />
          ) : (
            <span className="h-20 w-20 animate-pulse rounded-full bg-white/10" />
          )}
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-semibold text-[#FFB629]">
              <Icon name="gear" className="h-3.5 w-3.5" /> Account
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
            <p className="mt-1 truncate text-[15px] text-[#B9CBE3]">
              {profile ? profile.full_name || profile.username : 'Loading your account…'}
            </p>
            {profile && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                {role && <span className="rounded-full bg-white/10 px-3 py-1 font-medium capitalize text-[#D7E3F3]">{role}</span>}
                {profile.student_id && (
                  <span className="rounded-md bg-white/10 px-2.5 py-1 font-mono text-[#FFB629]">ID {profile.student_id}</span>
                )}
                {profile.email && <span className="hidden truncate text-[#8FA9C9] sm:inline">{profile.email}</span>}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------- Tabs + ខ្លឹមសារ ---------- */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Tabs */}
        <nav
          role="tablist"
          aria-label="Settings sections"
          className="set-rise relative flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm lg:flex-col lg:self-start"
          style={{ animationDelay: '80ms' }}
        >
          {/* indicator រអិលតាម tab សកម្ម (desktop) */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-2 right-2 hidden h-11 rounded-xl bg-[#0F2438]/[0.06] transition-transform duration-300 ease-out motion-reduce:transition-none lg:block"
            style={{ transform: `translateY(${activeIndex * 48}px)` }}
          />
          {TABS.map((item) => {
            const isActive = tab === item.key;
            return (
              <button
                key={item.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setTab(item.key)}
                className={`group relative flex h-11 shrink-0 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:mb-1 lg:last:mb-0 ${
                  isActive ? 'text-[#0F2438]' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span
                  className={`absolute left-0 top-1/2 hidden h-5 w-1 -translate-y-1/2 rounded-r bg-[#FFB629] transition-opacity lg:block ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <Icon
                  name={item.icon}
                  className={`h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-[#FFB629]' : ''}`}
                />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* កាតខ្លឹមសារ */}
        <section
          className="set-rise min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          style={{ animationDelay: '140ms' }}
        >
          <header className="flex items-center gap-4 border-b border-slate-100 bg-slate-50/60 px-6 py-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0F2438] text-[#FFB629] shadow-sm">
              <Icon name={active.icon} className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold tracking-tight text-slate-900">{active.title}</h2>
              <p className="text-sm text-slate-500">{active.text}</p>
            </div>
          </header>

          {/* key={tab} ធ្វើឱ្យ animation ដំណើរការរាល់ពេលប្តូរ tab */}
          <div key={tab} className="set-swap p-6">
            {error && (
              <div role="alert" className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <span>{error}</span>
                <button type="button" onClick={load} className="flex items-center gap-1.5 font-semibold underline-offset-4 hover:underline">
                  <Icon name="refresh" className="h-4 w-4" /> Try again
                </button>
              </div>
            )}

            {!profile && !error && <Skeleton />}

            {profile && (
              <>
                {tab === 'general' && <GeneralForm userId={profile.user_id} />}
                {tab === 'profile' &&
                  (profile.is_student
                    ? <ProfileForm initial={profile} onSaved={handleSaved} />
                    : <AccountForm initial={profile} onSaved={handleSaved} />)}
                {tab === 'security' && <PasswordForm />}
                {tab === 'system' && <SystemForm userId={profile.user_id} />}
                {tab === 'notifications' && <NotificationForm userId={profile.user_id} />}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}