import { useMemo, useRef, useState } from 'react';
import {
  EDC_TEMPLATES,
  PALETTE,
  TEMPLATE_GROUPS,
  evaluateExpression,
  isMissingValue,
  normalizeExpression,
  parseExpression,
} from '../../utils/edcExpression';

const TABS = [
  ['operators', 'Operators'],
  ['functions', 'Functions'],
  ['symbols', 'Symbols'],
  ['constants', 'Constants'],
];

const inputClass =
  'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition ' +
  'placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 disabled:bg-slate-50';

function Icon({ path, className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

const ICON = {
  check: 'M5 12.5l4.5 4.5L19 7.5',
  alert: 'M12 8v5M12 16.5v.1M12 3l10 18H2L12 3Z',
  chevron: 'M6 9l6 6 6-6',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4',
  book: 'M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4ZM8 20a3 3 0 0 1-3-3',
  play: 'M8 5l11 7-11 7V5Z',
};

/**
 * Expression field for electrical / electronic formulas.
 *
 *   <ExpressionInput value={expression} onChange={setExpression} onPickTemplate={(t) => ...} />
 */
export default function ExpressionInput({ id = 'formula-expression', value, onChange, onPickTemplate, disabled = false }) {
  const inputRef = useRef(null);
  const [tab, setTab] = useState('operators');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showTry, setShowTry] = useState(false);
  const [query, setQuery] = useState('');
  const [testValues, setTestValues] = useState({});

  const parsed = useMemo(() => parseExpression(value), [value]);

  /* put a button's text at the cursor (wraps the selected text for functions) */
  const insert = (item) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    let text = item.insert;
    let back = item.back ?? 0;
    if (item.wrap && end > start) {
      text = `${item.insert.slice(0, -1)}${value.slice(start, end)})`;
      back = 0;
    }
    onChange(value.slice(0, start) + text + value.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      const pos = start + text.length - back;
      el?.setSelectionRange(pos, pos);
    });
  };

  const templates = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return EDC_TEMPLATES.filter(
      (template) => !needle || `${template.title} ${template.expression} ${template.group}`.toLowerCase().includes(needle),
    );
  }, [query]);

  /* "Try it": calculate with the numbers typed here */
  const trial = useMemo(() => {
    if (!parsed.ok) return null;
    try {
      const result = evaluateExpression(parsed.ast, testValues);
      if (!Number.isFinite(result)) return { error: 'The result is not a number (for example a division by zero).' };
      return { result: Number(result.toPrecision(10)) };
    } catch (error) {
      return isMissingValue(error) ? { hint: error.message } : { error: 'This calculation cannot be done with these values.' };
    }
  }, [parsed, testValues]);

  return (
    <div className="space-y-3">
      {/* input row */}
      <div className="flex gap-2">
        <input
          id={id}
          ref={inputRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => {
            const clean = normalizeExpression(value).trim();
            if (clean !== value) onChange(clean);
          }}
          disabled={disabled}
          placeholder="e.g. V**2 / R"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={!parsed.ok && !parsed.empty}
          aria-describedby={`${id}-status`}
          className={`${inputClass} font-mono text-[15px] ${!parsed.ok && !parsed.empty ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15' : ''}`}
        />
        <button
          type="button"
          onClick={() => setShowTemplates((open) => !open)}
          aria-expanded={showTemplates}
          className={`flex shrink-0 items-center gap-2 rounded-lg border px-3.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20 ${
            showTemplates ? 'border-[#0F2438] bg-[#0F2438] text-white' : 'border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Icon path={ICON.book} />
          <span className="hidden sm:inline">EDC templates</span>
        </button>
      </div>

      {/* template picker */}
      {showTemplates && (
        <div className="edc-xp-pop rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="relative border-b border-slate-100 p-2">
            <Icon path={ICON.search} className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search: ohm, resonance, power, gain…"
              aria-label="Search EDC templates"
              className={`${inputClass} pl-9`}
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-2">
            {templates.length === 0 && <p className="px-2 py-6 text-center text-sm text-slate-500">No template matches “{query}”.</p>}
            {TEMPLATE_GROUPS.map((group) => {
              const items = templates.filter((template) => template.group === group);
              if (items.length === 0) return null;
              return (
                <div key={group} className="mb-2 last:mb-0">
                  <p className="px-2 py-1 text-xs font-semibold text-slate-500">{group}</p>
                  <ul>
                    {items.map((template) => (
                      <li key={template.id}>
                        <button
                          type="button"
                          onClick={() => {
                            onPickTemplate?.(template);
                            if (!onPickTemplate) onChange(template.expression);
                            setShowTemplates(false);
                            setQuery('');
                          }}
                          className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left transition hover:bg-blue-50 focus-visible:bg-blue-50 focus-visible:outline-none"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-slate-900">{template.title}</span>
                            <span className="block truncate text-xs text-slate-500">{template.description}</span>
                          </span>
                          <code className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-[#0F2438]">{template.expression}</code>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* button palette */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
        <div className="mb-2 flex flex-wrap gap-1" role="tablist" aria-label="Expression buttons">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                tab === key ? 'bg-white text-[#0F2438] shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PALETTE[tab].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => insert(item)}
              disabled={disabled}
              title={item.title}
              className="min-w-9 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-sm text-slate-800 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-95 disabled:opacity-50"
            >
              {item.label}
            </button>
          ))}
        </div>
        {tab === 'functions' && (
          <p className="mt-2 text-xs text-slate-500">sin, cos and tan use radians. Use radians(60) to write 60 degrees. log is the natural logarithm.</p>
        )}
      </div>

      {/* live check */}
      <div id={`${id}-status`} aria-live="polite">
        {parsed.empty ? (
          <p className="text-sm text-slate-500">Type with the keyboard or the buttons, or pick an EDC template. Write 2*V, not 2V.</p>
        ) : parsed.ok ? (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-emerald-700">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100"><Icon path={ICON.check} className="h-3 w-3" /></span>
            <span className="font-medium">Expression is valid.</span>
            {parsed.variables.length > 0 ? (
              <span className="flex flex-wrap items-center gap-1 text-slate-600">
                Uses
                {parsed.variables.map((name) => (
                  <code key={name} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-[#0F2438]">{name}</code>
                ))}
              </span>
            ) : (
              <span className="text-slate-500">It has no variables yet.</span>
            )}
          </p>
        ) : (
          <p className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-sm text-red-800">
            <Icon path={ICON.alert} className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{parsed.error}</span>
          </p>
        )}
      </div>

      {/* try it */}
      {parsed.ok && parsed.variables.length > 0 && (
        <div className="rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setShowTry((open) => !open)}
            aria-expanded={showTry}
            className="flex w-full items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <span className="flex items-center gap-2"><Icon path={ICON.play} className="h-3.5 w-3.5" /> Try it with numbers</span>
            <Icon path={ICON.chevron} className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${showTry ? 'rotate-180' : ''}`} />
          </button>
          {showTry && (
            <div className="edc-xp-pop space-y-3 border-t border-slate-100 p-3.5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {parsed.variables.map((name) => (
                  <div key={name}>
                    <label htmlFor={`${id}-try-${name}`} className="mb-1 block font-mono text-xs font-semibold text-slate-600">{name}</label>
                    <input
                      id={`${id}-try-${name}`}
                      type="number"
                      step="any"
                      value={testValues[name] ?? ''}
                      onChange={(event) => setTestValues((current) => ({ ...current, [name]: event.target.value }))}
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-slate-50 px-3.5 py-2.5 text-sm">
                {trial?.result !== undefined ? (
                  <span className="text-slate-600">Result: <span className="font-mono text-lg font-bold text-emerald-700">{trial.result}</span></span>
                ) : trial?.error ? (
                  <span className="text-red-700">{trial.error}</span>
                ) : (
                  <span className="text-slate-500">{trial?.hint ?? 'Enter the values to see the result.'}</span>
                )}
              </div>
              <p className="text-xs text-slate-500">This is only a check in your browser. Nothing is saved.</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes edc-xp-pop { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
        .edc-xp-pop { animation: edc-xp-pop .18s ease-out; }
        @media (prefers-reduced-motion: reduce) { .edc-xp-pop { animation: none; } }
      `}</style>
    </div>
  );
}