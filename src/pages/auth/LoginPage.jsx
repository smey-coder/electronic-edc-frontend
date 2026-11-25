import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import usePublicSettings from "../../hooks/usePublicSettings";
import LanguageSwitcher from "../../components/public/LanguageSwitcher";
import { authService } from "../../api/authApi";

const inputClass =
  "mt-1.5 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-[15px] text-slate-900 dark:text-white " +
  "placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition duration-150 " +
  "hover:border-slate-400 dark:hover:border-slate-600 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-600/15";

function Bolt({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M13.5 2 5 13.2h5.6L9.8 22 19 10.4h-5.8L13.5 2Z" />
    </svg>
  );
}

function SunIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function CircuitLoop() {
  return (
    <svg
      viewBox="0 0 400 300"
      className="h-auto w-full max-w-[420px]"
      role="img"
      aria-label="Animated circuit with a source, a resistor and a capacitor"
    >
      <path
        d="M60 150V60H340V240H60V150"
        fill="none"
        stroke="#35557C"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        className="edc-flow"
        d="M60 150V60H340V240H60V150"
        fill="none"
        stroke="#FFB629"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <rect x="160" y="48" width="80" height="24" fill="#0F2438" />
      <rect x="48" y="132" width="24" height="36" fill="#0F2438" />
      <rect x="328" y="132" width="24" height="36" fill="#0F2438" />
      <rect x="148" y="228" width="104" height="24" fill="#0F2438" />

      <polyline
        points="160,60 172,60 178,48 190,72 202,48 214,72 226,48 232,60 240,60"
        fill="none"
        stroke="#B9CBE3"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <g stroke="#B9CBE3" strokeLinecap="round">
        <line x1="42" y1="140" x2="78" y2="140" strokeWidth="3" />
        <line x1="50" y1="160" x2="70" y2="160" strokeWidth="3" />
      </g>
      <g stroke="#B9CBE3" strokeWidth="3" strokeLinecap="round">
        <line x1="322" y1="142" x2="358" y2="142" />
        <line x1="322" y1="158" x2="358" y2="158" />
      </g>
      <g stroke="#B9CBE3" strokeWidth="2.5" strokeLinecap="round">
        <line x1="160" y1="240" x2="184" y2="240" />
        <line x1="184" y1="240" x2="214" y2="226" />
        <line x1="226" y1="240" x2="240" y2="240" />
      </g>
      <circle cx="184" cy="240" r="3.5" fill="#B9CBE3" />
      <circle cx="226" cy="240" r="3.5" fill="#B9CBE3" />

      <g fill="#8FA9C9" fontSize="13" className="edc-mono">
        <text x="190" y="38" textAnchor="middle">
          R
        </text>
        <text x="30" y="154" textAnchor="end">
          V
        </text>
        <text x="370" y="154">
          C
        </text>
      </g>
      <g fill="#FFB629">
        <circle cx="60" cy="60" r="4.5" />
        <circle cx="340" cy="60" r="4.5" />
        <circle cx="340" cy="240" r="4.5" />
        <circle cx="60" cy="240" r="4.5" />
      </g>
    </svg>
  );
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginStateUpdate } = useAuth();
  const { t, theme, toggleTheme, language } = usePublicSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = Boolean(location.state?.registered);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.login({ username, password });
      const response = await authService.getCurrentUser();
      const payload = response?.data ?? response;
      const user = payload?.user ?? payload?.data?.user;
      if (!user) {
        throw new Error("The login response did not include user information.");
      }

      const rawRole = user.role ?? payload?.roles?.[0] ?? user.roles?.[0];
      const role = typeof rawRole === "string" ? rawRole : rawRole?.name;
      if (!role) {
        throw new Error("Your account does not have a role assigned.");
      }

      loginStateUpdate(response);
      navigate(`/${role.toLowerCase()}/dashboard`, { replace: true });
    } catch (requestError) {
      const detail = requestError.response?.data?.detail;
      setError(
        (Array.isArray(detail)
          ? detail.map((item) => item.msg).join(", ")
          : detail) ||
          requestError.response?.data?.message ||
          requestError.message ||
          "Unable to sign in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      key={language}
      className="pub-root edc-root min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] transition-colors"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&family=IBM+Plex+Sans:wght@400;500;600;700&family=Noto+Sans+Khmer:wght@400;500;600;700&display=swap');

        .edc-root { font-family: 'IBM Plex Sans', 'Noto Sans Khmer', ui-sans-serif, system-ui, sans-serif; }
        html[lang='km'] .edc-root { font-family: 'Noto Sans Khmer', 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif; line-height: 1.75; }
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
        @keyframes edc-shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(2px); } }
        @keyframes edc-spin  { to { transform: rotate(360deg); } }
        @keyframes edc-pop   { from { opacity: 0; transform: scale(.98); } to { opacity: 1; transform: none; } }

        .edc-flow  { stroke-dasharray: 6 34; animation: edc-flow 2.4s linear infinite; }
        .edc-enter { opacity: 0; animation: edc-enter .6s cubic-bezier(.2,.7,.2,1) forwards; }
        .edc-shake { animation: edc-shake .4s ease-in-out, edc-pop .2s ease-out; }
        .edc-spin  { animation: edc-spin .7s linear infinite; }

        @media (prefers-reduced-motion: reduce) {
          .edc-flow  { animation: none; stroke-dasharray: none; }
          .edc-enter { animation: none; opacity: 1; }
          .edc-shake, .edc-spin { animation: none; }
        }
      `}</style>

      {/* ---------- Brand panel (desktop) ---------- */}
      <aside className="edc-grid relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:sticky lg:top-0 lg:flex lg:h-screen">
        <Link
          to="/"
          className="flex items-center gap-2.5 w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB629] rounded-lg"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFB629] text-[#0F2438]">
            <Bolt />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            {t("brand.name")}
          </span>
        </Link>

        <div className="flex flex-col items-center gap-10">
          <CircuitLoop />
          <p className="edc-mono text-3xl text-[#B9CBE3]">V = I × R</p>
        </div>

        <div className="max-w-sm">
          <h2 className="text-2xl font-semibold leading-snug">
            {t("login.sideTitle")}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#8FA9C9]">
            {t("login.sideSubtitle")}
          </p>
        </div>
      </aside>

      {/* ---------- Form ---------- */}
      <main className="flex min-h-screen flex-col justify-between px-4 py-8 sm:px-8 lg:min-h-0 lg:py-10">
        {/* Top Controls bar */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>{t("nav.home")}</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle Dark Mode"
              className="rounded-lg p-2 text-slate-600 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
            <LanguageSwitcher />
          </div>
        </div>

        <div className="w-full max-w-md mx-auto my-auto">
          {/* mobile brand */}
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F2438] dark:bg-slate-800 text-[#FFB629]">
              <Bolt />
            </span>
            <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              {t("brand.name")}
            </span>
          </div>

          <form
            onSubmit={handleSubmit}
            className="edc-enter rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 p-6 shadow-[0_10px_40px_-12px_rgba(15,36,56,.15)] dark:shadow-[0_10px_40px_-12px_rgba(0,0,0,.5)] sm:p-10"
          >
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t("login.title")}
            </h1>
            <p className="mt-2 text-[15px] text-slate-600 dark:text-slate-300">
              {t("login.subtitle")}
            </p>

            {justRegistered && !error && (
              <div
                role="status"
                className="mt-6 flex items-start gap-3 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/60 p-3.5 text-sm text-emerald-800 dark:text-emerald-300"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="mt-0.5 h-4 w-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M8 12.5l2.7 2.7L16 9.8" />
                </svg>
                <span>{t("login.registeredSuccess")}</span>
              </div>
            )}

            {error && (
              <div
                key={error}
                role="alert"
                className="edc-shake mt-6 flex items-start gap-3 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/60 p-3.5 text-sm text-red-800 dark:text-red-300"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="mt-0.5 h-4 w-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7.5v5M12 16.2v.1" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="username"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  {t("login.usernameLabel")}
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  spellCheck={false}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  {t("login.passwordLabel")}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword
                        ? t("login.hidePassword")
                        : t("login.showPassword")
                    }
                    className="absolute right-1.5 top-[calc(50%+3px)] -translate-y-1/2 rounded-md p-2 text-slate-400 dark:text-slate-500 transition hover:text-slate-700 dark:hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    {showPassword ? (
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M3 3l18 18M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 8.5 4 9.5 6a13 13 0 0 1-2.4 3.2M6.5 7.6A13 13 0 0 0 2.5 12c1 2 4.5 6 9.5 6 1.5 0 2.8-.4 4-.9M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M2.5 12C3.5 10 7 6 12 6s8.5 4 9.5 6c-1 2-4.5 6-9.5 6s-8.5-4-9.5-6Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-8 flex w-full items-center justify-center gap-2.5 rounded-lg bg-blue-600 px-4 py-3 text-[15px] font-semibold text-white shadow-sm transition duration-150 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading && (
                <span
                  className="edc-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
                  aria-hidden="true"
                />
              )}
              {loading ? t("login.submitting") : t("login.submit")}
            </button>

            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
              {t("login.noAccount")}{" "}
              <Link
                to="/signup"
                className="rounded font-semibold text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                {t("login.createOne")}
              </Link>
            </p>
          </form>
        </div>

        <div />
      </main>
    </div>
  );
}
