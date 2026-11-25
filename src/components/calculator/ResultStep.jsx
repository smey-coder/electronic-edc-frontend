export default function ResultStep({ step }) {
  // ទាញយក Unit ពី step ឬ fallback ទៅ string ទទេ
  const unit = step.unit || step.variable?.unit || "";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/40 p-6 shadow-sm dark:border-emerald-900/50 dark:from-emerald-950/40 dark:via-slate-9θθ dark:to-emerald-950/20 transition-all">
      {/* Background decorative glow */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          {step.title || "លទ្ធផលចុងក្រោយ (Final Result)"}
        </span>
      </div>

      {/* Value & Unit Section */}
      <div className="mt-4 flex items-baseline gap-3">
        <span className="font-mono text-4xl font-black tracking-tight text-emerald-950 dark:text-emerald-100 sm:text-5xl">
          {typeof step.value === 'number' ? step.value.toLocaleString(undefined, { maximumFractionDigits: 4 }) : step.value}
        </span>

        {/* 🟢 ខ្នាត (Unit) ដែលលេចធ្លោនិងស្អាត */}
        {unit && (
          <span className="rounded-lg bg-emerald-200/50 px-2.5 py-1 font-mono text-lg font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
            {unit}
          </span>
        )}
      </div>

      {step.label && (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {step.label}
        </p>
      )}

      {/* Formula Used Footer */}
      {step.expression && (
        <div className="mt-5 flex items-center justify-between border-t border-emerald-100 dark:border-emerald-900/40 pt-3">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">រូបមន្តប្រើប្រាស់៖</span>
          <code className="rounded bg-emerald-100/60 px-2 py-0.5 font-mono text-xs font-semibold text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200">
            {step.expression}
          </code>
        </div>
      )}
    </div>
  );
}