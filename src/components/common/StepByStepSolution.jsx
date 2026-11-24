import { useEffect, useMemo, useRef, useState } from 'react';
import { solveSteps } from '../../utils/solveSteps';

function Icon({ path, className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

const ICON = {
  next: 'M9 6l6 6-6 6',
  all: 'M6 7l6 5 6-5M6 13l6 5 6-5',
  restart: 'M4 12a8 8 0 1 0 3-6.2M4 4v4h4',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  alert: 'M12 8v5M12 16.5v.1M12 3l10 18H2L12 3Z',
};

function Expression({ children, strong = false }) {
  return (
    <code className={`block overflow-x-auto whitespace-nowrap rounded-lg bg-slate-50 px-3 py-2 font-mono text-[15px] text-[#0F2438] ${strong ? 'font-bold' : 'font-medium'}`}>
      {children}
    </code>
  );
}

function StepBody({ step, unit, serverResult }) {
  if (step.kind === 'formula' || step.kind === 'substitute') {
    return (
      <>
        <Expression>{step.expression}</Expression>
        {step.note && <p className="mt-1.5 text-xs text-slate-500">{step.note}</p>}
      </>
    );
  }

  if (step.kind === 'given') {
    return (
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {step.items.map((item) => (
          <li key={item.name} className="flex items-baseline gap-2 rounded-lg bg-slate-50 px-3 py-2">
            <span className="font-mono text-sm font-bold text-[#0F2438]">{item.name}</span>
            <span className="font-mono text-sm text-slate-700">= {item.value}{item.unit ? ` ${item.unit}` : ''}</span>
            {item.label && <span className="ml-auto truncate text-xs text-slate-400">{item.label}</span>}
          </li>
        ))}
      </ul>
    );
  }

  if (step.kind === 'calc') {
    return (
      <>
        <ul className="space-y-1">
          {step.details.map((line) => (
            <li key={line} className="font-mono text-sm text-slate-600">{line}</li>
          ))}
        </ul>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-slate-400" aria-hidden="true">→</span>
          <div className="min-w-0 flex-1"><Expression>{step.expression}</Expression></div>
        </div>
        {step.note && <p className="mt-1.5 text-xs text-slate-500">{step.note}</p>}
      </>
    );
  }

  // result
  const server = Number(serverResult);
  const mismatch =
    serverResult !== undefined && serverResult !== null && Number.isFinite(server) &&
    Math.abs(server - step.raw) > 1e-6 * Math.max(1, Math.abs(step.raw));
  return (
    <>
      <p className="font-mono text-3xl font-bold text-emerald-700">
        {step.value}
        {unit ? <span className="ml-1.5 text-lg font-semibold">{unit}</span> : null}
      </p>
      {mismatch && (
        <p className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800">
          <Icon path={ICON.alert} className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          The server calculated {serverResult}. The steps above are a teaching view and may differ slightly.
        </p>
      )}
    </>
  );
}

/**
 * Shows how a formula is solved, one step at a time.
 *   <StepByStepSolution formula={formula} values={{ V: '12', R: '4' }} unit="A" serverResult={3} fallbackSteps={api.steps} />
 *
 * values must stay the same object while the same answer is shown (it restarts the steps when it changes).
 */
export default function StepByStepSolution({ formula, values, unit, serverResult, fallbackSteps }) {
  const solution = useMemo(
    () => solveSteps({ expression: formula.expression, values: values ?? {}, variables: formula.variables ?? [] }),
    [formula, values],
  );
  const total = solution.ok ? solution.steps.length : 0;
  const [visible, setVisible] = useState(1);
  const lastRef = useRef(null);

  useEffect(() => {
    setVisible(1);
  }, [solution]);

  useEffect(() => {
    if (visible > 1) {
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      lastRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    }
  }, [visible]);

  const style = (
    <style>{`
      @keyframes edc-ss-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
      .edc-ss-in { animation: edc-ss-in .35s cubic-bezier(.2,.7,.2,1) both; }
      @media (prefers-reduced-motion: reduce) { .edc-ss-in { animation: none; } }
    `}</style>
  );

  /* The teaching view is not possible: show why, and the server's own steps if there are any. */
  if (!solution.ok) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Solution</p>
        <p className="mt-1 text-sm text-slate-500">The step-by-step view is not available: {solution.error}</p>
        {fallbackSteps?.length > 0 && (
          <ol className="mt-3 space-y-1.5">
            {fallbackSteps.map((step, index) => (
              <li key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-mono text-xs text-slate-700">{step}</li>
            ))}
          </ol>
        )}
      </div>
    );
  }

  const done = visible >= total;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4" aria-label="Step by step solution">
      {style}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Solution, step by step</h3>
          <p className="text-xs text-slate-500">Step {visible} of {total}</p>
        </div>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
          <div className="h-full rounded-full bg-blue-500 transition-all duration-300" style={{ width: `${(visible / total) * 100}%` }} />
        </div>
      </div>

      <ol className="mt-4 space-y-3" aria-live="polite">
        {solution.steps.slice(0, visible).map((step, index) => {
          const isResult = step.kind === 'result';
          return (
            <li
              key={`${index}-${step.title}`}
              ref={index === visible - 1 ? lastRef : null}
              className={`edc-ss-in flex gap-3 rounded-xl border p-3 ${isResult ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-white'}`}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isResult ? 'bg-emerald-600 text-white' : 'bg-[#0F2438] text-[#FFB629]'}`}>
                {isResult ? <Icon path={ICON.check} className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="mb-1.5 text-sm font-semibold text-slate-900">{step.title}</p>
                <StepBody step={step} unit={unit} serverResult={serverResult} />
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 flex flex-wrap gap-2">
        {!done && (
          <>
            <button
              type="button"
              onClick={() => setVisible((count) => Math.min(total, count + 1))}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 active:scale-[.98]"
            >
              Next step <Icon path={ICON.next} />
            </button>
            <button
              type="button"
              onClick={() => setVisible(total)}
              className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300/50"
            >
              <Icon path={ICON.all} /> Show all
            </button>
          </>
        )}
        {visible > 1 && (
          <button
            type="button"
            onClick={() => setVisible(1)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Icon path={ICON.restart} /> Start again
          </button>
        )}
      </div>
    </section>
  );
}