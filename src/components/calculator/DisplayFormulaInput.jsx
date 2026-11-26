import React from 'react';

const COMMON_SYMBOLS = ['×', '÷', '±', '√', '²', '³', '≤', '≥', '≠', 'π', 'Δ', 'θ'];

const inputClass =
  'mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-slate-900 outline-none transition ' +
  'placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15';

export default function DisplayFormulaInput({ value, onChange, placeholder = 'e.g. V = I × R' }) {
  
  // បញ្ចូលនិមិត្តសញ្ញាទៅក្នុង Input ត្រង់ទីតាំង Cursor បច្ចុប្បន្ន
  const handleInsertSymbol = (symbol) => {
    const newValue = (value || '') + symbol;
    onChange(newValue);
  };

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor="formula-display-input" className="text-sm font-medium text-slate-700">
          Display Formula
        </label>
        <span className="text-xs font-normal text-slate-400">Optional (Formatted view)</span>
      </div>

      {/* ប្រអប់ Input សម្រាប់វាយបញ្ចូល */}
      <input
        id="formula-display-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={inputClass}
      />

      {/* ប៊ូតុងនិមិត្តសញ្ញាគណិតវិទ្យាសាមញ្ញៗ (Quick Math Symbols Toolbar) */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="self-center text-xs text-slate-400 mr-1">Insert:</span>
        {COMMON_SYMBOLS.map((symbol) => (
          <button
            key={symbol}
            type="button"
            onClick={() => handleInsertSymbol(symbol)}
            className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-slate-50 text-xs font-mono font-medium text-slate-700 shadow-2xs transition hover:bg-slate-100 hover:border-slate-300 active:scale-95"
            title={`Insert ${symbol}`}
          >
            {symbol}
          </button>
        ))}
      </div>
    </div>
  );
}