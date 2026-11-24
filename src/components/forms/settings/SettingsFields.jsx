export const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:text-slate-500';

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

export function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

export function SaveBar({ state, label = 'Save changes' }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <button
        type="submit"
        disabled={state.saving}
        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {state.saving ? 'Saving…' : label}
      </button>
      {state.ok && <span className="text-sm text-emerald-600">Saved.</span>}
      {state.error && <span role="alert" className="text-sm text-red-600">{state.error}</span>}
    </div>
  );
}