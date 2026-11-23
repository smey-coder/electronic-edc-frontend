import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../api/authApi';

/* ------------------------------------------------------------------ */
/* Form structure (Ordered: 1. About you -> 2. Sign-in -> 3. Teacher)  */
/* ------------------------------------------------------------------ */
const SECTIONS = [
  {
    step: 1,
    shortTitle: 'About you',
    title: 'About you',
    hint: 'Only your full name is required.',
    fields: [
      { name: 'full_name', label: 'Full name', required: true, autoComplete: 'name', span: 2 },
      { name: 'gender', label: 'Gender', type: 'select' },
      { name: 'date_of_birth', label: 'Date of birth', type: 'date', autoComplete: 'bday' },
      { name: 'department', label: 'Department' },
      { name: 'major', label: 'Major' },
      { name: 'academic_year', label: 'Academic year' },
      { name: 'class_name', label: 'Class' },
      { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel' },
      { name: 'address', label: 'Address', autoComplete: 'street-address', span: 2 },
    ],
  },
  {
    step: 2,
    shortTitle: 'Sign-in details',
    title: 'Sign-in details',
    hint: 'You will use these to log in.',
    fields: [
      { name: 'username', label: 'Username', required: true, minLength: 3, autoComplete: 'username', span: 2 },
      { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email', span: 2 },
      { name: 'password', label: 'Password', type: 'password', required: true, minLength: 6, autoComplete: 'new-password', span: 2, help: 'At least 6 characters.' },
    ],
  },
  {
    step: 3,
    shortTitle: 'Activation',
    title: 'From your teacher',
    hint: 'Your teacher gives you a student ID and a license key.',
    fields: [
      { name: 'student_id', label: 'Student ID', required: true, autoComplete: 'off' },
      { name: 'raw_key', label: 'License key', required: true, autoComplete: 'off', mono: true },
    ],
  },
];

const INITIAL_FORM = {
  username: '', email: '', password: '', raw_key: '', student_id: '', full_name: '',
  gender: '', date_of_birth: '', department: '', major: '', academic_year: '',
  class_name: '', phone: '', address: '',
};

const inputClass =
  'mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-slate-900 ' +
  'placeholder:text-slate-400 outline-none transition duration-150 ' +
  'hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15';

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */
function Bolt({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M13.5 2 5 13.2h5.6L9.8 22 19 10.4h-5.8L13.5 2Z" />
    </svg>
  );
}

function Stepper({ currentStep, onStepClick }) {
  return (
    <nav aria-label="Registration progress" className="mt-6">
      <ol className="grid grid-cols-3 gap-2 sm:gap-4">
        {SECTIONS.map((sec, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;
          const canJump = idx < currentStep;

          return (
            <li key={sec.title} className="flex flex-col">
              <button
                type="button"
                disabled={!canJump}
                onClick={() => canJump && onStepClick(idx)}
                className={`group flex flex-col text-left focus:outline-none ${canJump ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-600/15'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isCompleted ? (
                      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4.5 10.5l3.5 3.5 7.5-8" />
                      </svg>
                    ) : (
                      sec.step
                    )}
                  </span>
                  <span
                    className={`truncate text-xs font-semibold sm:text-sm ${
                      isCurrent ? 'text-slate-900' : isCompleted ? 'text-emerald-700 group-hover:underline' : 'text-slate-400'
                    }`}
                  >
                    {sec.shortTitle}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCompleted ? 'w-full bg-emerald-500' : isCurrent ? 'w-full bg-blue-600' : 'w-0'
                    }`}
                  />
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Field({ config, value, onChange, showPassword, onTogglePassword }) {
  const { name, label, type = 'text', required, minLength, autoComplete, mono, help } = config;
  const isPassword = type === 'password';

  return (
    <div className={config.span === 2 ? 'sm:col-span-2' : ''}>
      <label htmlFor={name} className="flex items-baseline justify-between text-sm font-medium text-slate-700">
        <span>{label}</span>
        {!required && <span className="text-xs font-normal text-slate-400">Optional</span>}
      </label>

      {type === 'select' ? (
        <select id={name} name={name} value={value} onChange={onChange} required={required} className={inputClass}>
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      ) : (
        <div className="relative">
          <input
            id={name}
            name={name}
            type={isPassword && showPassword ? 'text' : type}
            value={value}
            onChange={onChange}
            required={required}
            minLength={minLength}
            autoComplete={autoComplete}
            spellCheck={false}
            className={`${inputClass} ${mono ? 'edc-mono tracking-wide' : ''} ${isPassword ? 'pr-11' : ''}`}
          />
          {isPassword && (
            <button
              type="button"
              onClick={onTogglePassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-1.5 top-[calc(50%+3px)] -translate-y-1/2 rounded-md p-2 text-slate-400 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 3l18 18M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 8.5 4 9.5 6a13 13 0 0 1-2.4 3.2M6.5 7.6A13 13 0 0 0 2.5 12c1 2 4.5 6 9.5 6 1.5 0 2.8-.4 4-.9M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2.5 12C3.5 10 7 6 12 6s8.5 4 9.5 6c-1 2-4.5 6-9.5 6s-8.5-4-9.5-6Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
        </div>
      )}

      {help && <p className="mt-1.5 text-xs text-slate-500">{help}</p>}
    </div>
  );
}

/* The one memorable element: current flowing around a simple RC loop. */
function CircuitLoop() {
  return (
    <svg viewBox="0 0 400 300" className="h-auto w-full max-w-[420px]" role="img" aria-label="Animated circuit with a source, a resistor and a capacitor">
      {/* wire */}
      <path d="M60 150V60H340V240H60V150" fill="none" stroke="#35557C" strokeWidth="2" strokeLinejoin="round" />
      {/* current */}
      <path className="edc-flow" d="M60 150V60H340V240H60V150" fill="none" stroke="#FFB629" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* masks so components sit on the wire */}
      <rect x="160" y="48" width="80" height="24" fill="#0F2438" />
      <rect x="48" y="132" width="24" height="36" fill="#0F2438" />
      <rect x="328" y="132" width="24" height="36" fill="#0F2438" />
      <rect x="148" y="228" width="104" height="24" fill="#0F2438" />

      {/* resistor */}
      <polyline points="160,60 172,60 178,48 190,72 202,48 214,72 226,48 232,60 240,60" fill="none" stroke="#B9CBE3" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {/* source */}
      <g stroke="#B9CBE3" strokeLinecap="round">
        <line x1="42" y1="140" x2="78" y2="140" strokeWidth="3" />
        <line x1="50" y1="160" x2="70" y2="160" strokeWidth="3" />
      </g>
      {/* capacitor */}
      <g stroke="#B9CBE3" strokeWidth="3" strokeLinecap="round">
        <line x1="322" y1="142" x2="358" y2="142" />
        <line x1="322" y1="158" x2="358" y2="158" />
      </g>
      {/* switch */}
      <g stroke="#B9CBE3" strokeWidth="2.5" strokeLinecap="round">
        <line x1="160" y1="240" x2="184" y2="240" />
        <line x1="184" y1="240" x2="214" y2="226" />
        <line x1="226" y1="240" x2="240" y2="240" />
      </g>
      <circle cx="184" cy="240" r="3.5" fill="#B9CBE3" />
      <circle cx="226" cy="240" r="3.5" fill="#B9CBE3" />

      {/* values */}
      <g fill="#8FA9C9" fontSize="13" className="edc-mono">
        <text x="190" y="38" textAnchor="middle">R</text>
        <text x="30" y="154" textAnchor="end">V</text>
        <text x="370" y="154">C</text>
      </g>
      {/* nodes */}
      <g fill="#FFB629">
        <circle cx="60" cy="60" r="4.5" />
        <circle cx="340" cy="60" r="4.5" />
        <circle cx="340" cy="240" r="4.5" />
        <circle cx="60" cy="240" r="4.5" />
      </g>
    </svg>
  );
}

const REDIRECT_MS = 3000;

function SuccessCard({ name, onContinue }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="edc-enter rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0_10px_40px_-12px_rgba(15,36,56,.15)] sm:p-12"
    >
      <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/60">
        <svg viewBox="0 0 52 52" className="h-11 w-11" fill="none" stroke="#059669" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle className="edc-draw-circle" cx="26" cy="26" r="22" />
          <path className="edc-draw-check" d="M15 27l8 8 14-16" />
        </svg>
      </span>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">Account created</h1>
      <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-slate-600">
        {name ? `Welcome, ${name}. ` : ''}You can now sign in with your username and password.
      </p>

      <div className="mx-auto mt-8 h-1.5 max-w-xs overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
        <div className="edc-bar h-full rounded-full bg-emerald-500" style={{ animationDuration: `${REDIRECT_MS}ms` }} />
      </div>
      <p className="mt-3 text-sm text-slate-500">Taking you to sign in…</p>

      <button
        type="button"
        onClick={onContinue}
        className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 text-[15px] font-semibold text-white shadow-sm transition duration-150 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 active:scale-[.99]"
      >
        Sign in now
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function StudentSignupPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const formRef = useRef(null);
  const navigate = useNavigate();

  const activeSection = SECTIONS[currentStep];
  const isLastStep = currentStep === SECTIONS.length - 1;

  // After a successful registration, show the message, then go to the login page.
  useEffect(() => {
    if (!success) return undefined;
    const timer = setTimeout(() => navigate('/login', { replace: true }), REDIRECT_MS);
    return () => clearTimeout(timer);
  }, [success, navigate]);

  const handleNextStep = () => {
    // ប្រើ Browser Native Validation សម្រាប់ពិនិត្យ Inputs ក្នុងជំហានបច្ចុប្បន្ន
    if (formRef.current && !formRef.current.reportValidity()) {
      return;
    }
    setError('');
    setCurrentStep((prev) => Math.min(prev + 1, SECTIONS.length - 1));
  };

  const handlePrevStep = () => {
    setError('');
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    // ប្រសិនបើមិនទាន់ដល់ជំហានចុងក្រោយទេ ការចុច Enter នឹងរុញទៅ Step បន្ទាប់
    if (!isLastStep) {
      handleNextStep();
      return;
    }

    setError('');
    setLoading(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(form)
          .filter(([, value]) => value.trim() !== '')
          .map(([key, value]) => [key, value.trim()]),
      );
      await authService.register(payload);
      setSuccess(true);
    } catch (requestError) {
      const detail = requestError.response?.data?.detail;
      setError(
        (Array.isArray(detail) ? detail.map((item) => item.msg).join(', ') : detail) ||
          requestError.response?.data?.message ||
          'Unable to create the account.',
      );
    } finally {
      setLoading(false);
    }
  };

  const updateField = (event) =>
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  return (
    <div className="edc-root min-h-screen bg-slate-50 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

        .edc-root { font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif; }
        .edc-mono { font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace; }

        .edc-grid {
          background-color: #0F2438;
          background-image:
            linear-gradient(rgba(143,169,201,.09) 1px, transparent 1px),
            linear-gradient(90deg, rgba(143,169,201,.09) 1px, transparent 1px);
          background-size: 32px 32px;
        }

        @keyframes edc-flow  { to { stroke-dashoffset: -80; } }
        @keyframes edc-enter { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes edc-step  { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: none; } }
        @keyframes edc-shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(2px); } }
        @keyframes edc-spin  { to { transform: rotate(360deg); } }
        @keyframes edc-pop   { from { opacity: 0; transform: scale(.98); } to { opacity: 1; transform: none; } }

        @keyframes edc-draw { to { stroke-dashoffset: 0; } }
        @keyframes edc-bar  { from { width: 0; } to { width: 100%; } }

        .edc-draw-circle { stroke-dasharray: 140; stroke-dashoffset: 140; animation: edc-draw .6s ease-out .1s forwards; }
        .edc-draw-check  { stroke-dasharray: 40;  stroke-dashoffset: 40;  animation: edc-draw .4s ease-out .6s forwards; }
        .edc-bar { width: 0; animation-name: edc-bar; animation-timing-function: linear; animation-fill-mode: forwards; }

        .edc-flow  { stroke-dasharray: 6 34; animation: edc-flow 2.4s linear infinite; }
        .edc-enter { opacity: 0; animation: edc-enter .6s cubic-bezier(.2,.7,.2,1) forwards; }
        .edc-step  { animation: edc-step .28s cubic-bezier(.2,.7,.2,1) forwards; }
        .edc-shake { animation: edc-shake .4s ease-in-out, edc-pop .2s ease-out; }
        .edc-spin  { animation: edc-spin .7s linear infinite; }

        @media (prefers-reduced-motion: reduce) {
          .edc-flow  { animation: none; stroke-dasharray: none; }
          .edc-enter { animation: none; opacity: 1; }
          .edc-step, .edc-shake, .edc-spin { animation: none; }
          .edc-draw-circle, .edc-draw-check { animation: none; stroke-dashoffset: 0; }
          .edc-bar { animation: none; width: 100%; }
        }
      `}</style>

      {/* ---------- Brand panel (desktop) ---------- */}
      <aside className="edc-grid relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex lg:sticky lg:top-0 lg:h-screen">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFB629] text-[#0F2438]">
            <Bolt />
          </span>
          <span className="text-lg font-semibold tracking-tight">Electronic EDC</span>
        </div>

        <div className="flex flex-col items-center gap-10">
          <CircuitLoop />
          <p className="edc-mono text-3xl text-[#B9CBE3]">V = I × R</p>
        </div>

        <div className="max-w-sm">
          <h2 className="text-2xl font-semibold leading-snug">Enter your values. See the circuit and its graph.</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#8FA9C9]">
            Type numbers, upload an Excel file, or draw the wires. Your account unlocks the calculator.
          </p>
        </div>
      </aside>

      {/* ---------- Form ---------- */}
      <main className="flex items-start justify-center px-4 py-10 sm:px-8 lg:py-16">
        <div className="w-full max-w-xl">
          {/* mobile brand */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F2438] text-[#FFB629]">
              <Bolt />
            </span>
            <span className="text-lg font-semibold tracking-tight text-slate-900">Electronic EDC</span>
          </div>

          {success ? (
            <SuccessCard
              name={form.full_name.trim()}
              onContinue={() => navigate('/login', { replace: true })}
            />
          ) : (
            <form
              ref={formRef}
              onSubmit={handleFormSubmit}
              className="edc-enter rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_40px_-12px_rgba(15,36,56,.15)] sm:p-10"
            >
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Create student account</h1>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Step {currentStep + 1} of {SECTIONS.length}
                </span>
              </div>

              {/* Stepper Progress Bar */}
              <Stepper currentStep={currentStep} onStepClick={setCurrentStep} />

              {error && (
                <div
                  key={error}
                  role="alert"
                  className="edc-shake mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-800"
                >
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7.5v5M12 16.2v.1" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Active Step Fields */}
              <fieldset
                key={activeSection.title}
                className="edc-step mt-8 min-w-0 border-0 p-0"
              >
                <legend className="w-full border-b border-slate-200 pb-3">
                  <span className="block text-base font-semibold text-slate-900">
                    {activeSection.step}. {activeSection.title}
                  </span>
                  <span className="mt-0.5 block text-sm font-normal text-slate-500">
                    {activeSection.hint}
                  </span>
                </legend>

                <div className="mt-5 grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
                  {activeSection.fields.map((field) => (
                    <Field
                      key={field.name}
                      config={field}
                      value={form[field.name]}
                      onChange={updateField}
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword((current) => !current)}
                    />
                  ))}
                </div>
              </fieldset>

              {/* Navigation Buttons */}
              <div className="mt-9 flex items-center gap-3">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={loading}
                    className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-[15px] font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300/50 disabled:opacity-60"
                  >
                    Back
                  </button>
                )}

                {!isLastStep ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="ml-auto flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-[15px] font-semibold text-white shadow-sm transition duration-150 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 active:scale-[.99]"
                  >
                    <span>Next: {SECTIONS[currentStep + 1].shortTitle}</span>
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 10h12m-5-5 5 5-5 5" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="ml-auto flex flex-1 items-center justify-center gap-2.5 rounded-lg bg-blue-600 px-5 py-3 text-[15px] font-semibold text-white shadow-sm transition duration-150 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading && <span className="edc-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
                    {loading ? 'Creating account…' : 'Create account'}
                  </button>
                )}
              </div>

              <p className="mt-6 text-center text-sm text-slate-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="rounded font-semibold text-blue-600 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}