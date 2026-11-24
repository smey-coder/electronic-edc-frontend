import { useEffect, useMemo, useState } from 'react';
import { getErrorMessage } from '../../api/formulaApi';
import ExpressionInput from './ExpressionInput';
import { describeSymbol, normalizeExpression, parseExpression } from '../../utils/edcExpression';

const inputClass =
  'mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-slate-900 outline-none transition ' +
  'placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15';

const smallInput =
  'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition ' +
  'placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15';

/**
 * Create or edit a formula, with the EDC expression builder.
 *   formula    – when editing
 *   categories – [{ id, name }]
 *   onSubmit   – async (payload); throw to show an error here. The modal closes after it succeeds.
 *
 * Create payload: { title, expression, description, category_id, variables: [{ variable_name, display_name?, unit? }] }
 * Edit payload:   { title, expression, description, category_id }   (variables are edited with the Variables button)
 */
export default function FormulaFormModal({ formula, categories = [], onSubmit, onClose }) {
  const isEdit = Boolean(formula);

  const [title, setTitle] = useState(formula?.title ?? '');
  const [categoryId, setCategoryId] = useState(String(formula?.category_id ?? formula?.category?.id ?? ''));
  const [expression, setExpression] = useState(formula?.expression ?? '');
  const [description, setDescription] = useState(formula?.description ?? '');
  const [varMeta, setVarMeta] = useState({}); // what the user typed for each variable
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const parsed = useMemo(() => parseExpression(expression), [expression]);

  // Variables found in the expression, with a suggested name and unit that the user can change.
  const rows = useMemo(
    () =>
      parsed.variables.map((name) => ({
        name,
        ...describeSymbol(name),
        ...(varMeta[name] ?? {}),
      })),
    [parsed.variables, varMeta],
  );

  const missingInFormula = useMemo(() => {
    if (!isEdit) return [];
    const have = new Set((formula.variables ?? []).map((variable) => variable.variable_name));
    return parsed.variables.filter((name) => !have.has(name));
  }, [isEdit, formula, parsed.variables]);

  const updateRow = (row, key, value) =>
    setVarMeta((current) => ({
      ...current,
      [row.name]: { display_name: row.display_name, unit: row.unit, ...(current[row.name] ?? {}), [key]: value },
    }));

  const pickTemplate = (template) => {
    setExpression(template.expression);
    if (!title.trim()) setTitle(template.title);
    if (!description.trim()) setDescription(template.description);
  };

  // Escape closes the window, and the page behind it does not scroll.
  useEffect(() => {
    const onKeyDown = (event) => event.key === 'Escape' && !saving && onClose();
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [saving, onClose]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!parsed.ok) {
      setError(parsed.empty ? 'Write the expression first.' : parsed.error);
      return;
    }
    setError('');
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        expression: normalizeExpression(expression).trim(),
        description: description.trim() || null,
        category_id: categoryId === '' ? null : Number(categoryId),
      };
      if (!isEdit) {
        payload.variables = rows.map((row) => ({
          variable_name: row.name,
          ...(row.display_name.trim() && { display_name: row.display_name.trim() }),
          ...(row.unit.trim() && { unit: row.unit.trim() }),
        }));
      }
      await onSubmit(payload);
      onClose();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Failed to save the formula.'));
      setSaving(false);
    }
  };

  return (
    <div
      className="edc-fm-fade fixed inset-0 z-50 flex items-end justify-center bg-[#0F2438]/50 p-4 backdrop-blur-[2px] sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <style>{`
        @keyframes edc-fm-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes edc-fm-pop  { from { opacity: 0; transform: translateY(16px) scale(.98); } to { opacity: 1; transform: none; } }
        @keyframes edc-fm-spin { to { transform: rotate(360deg); } }
        .edc-fm-fade { animation: edc-fm-fade .15s ease-out; }
        .edc-fm-pop  { animation: edc-fm-pop .22s cubic-bezier(.2,.7,.2,1); }
        .edc-fm-spin { animation: edc-fm-spin .7s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .edc-fm-fade, .edc-fm-pop, .edc-fm-spin { animation: none; } }
      `}</style>

      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit formula' : 'Create formula'}
        className="edc-fm-pop flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">{isEdit ? 'Edit formula' : 'Create formula'}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {isEdit ? `Change the details of ${formula.title}.` : 'Build the expression with the buttons, or start from an EDC template.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="-mr-2 -mt-1 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        {/* body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="formula-title" className="text-sm font-medium text-slate-700">Title</label>
              <input id="formula-title" value={title} onChange={(event) => setTitle(event.target.value)} required
                placeholder="e.g. Series RLC impedance" autoComplete="off" className={inputClass} />
            </div>
            <div>
              <label htmlFor="formula-category" className="flex items-baseline justify-between text-sm font-medium text-slate-700">
                <span>Category</span><span className="text-xs font-normal text-slate-400">Optional</span>
              </label>
              <select id="formula-category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className={inputClass}>
                <option value="">No category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="formula-expression" className="text-sm font-medium text-slate-700">Expression</label>
            <div className="mt-1.5">
              <ExpressionInput id="formula-expression" value={expression} onChange={setExpression} onPickTemplate={pickTemplate} disabled={saving} />
            </div>
          </div>

          {/* variables */}
          {isEdit ? (
            missingInFormula.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                The expression uses {missingInFormula.map((name) => <code key={name} className="mx-0.5 rounded bg-white/70 px-1.5 py-0.5 font-mono text-xs">{name}</code>)}
                which {missingInFormula.length === 1 ? 'is' : 'are'} not a variable of this formula yet. After saving, add {missingInFormula.length === 1 ? 'it' : 'them'} with the Variables button on the formula card.
              </div>
            )
          ) : (
            <div>
              <h3 className="text-sm font-medium text-slate-700">Variables</h3>
              {rows.length === 0 ? (
                <p className="mt-1.5 rounded-lg border border-dashed border-slate-300 px-3.5 py-4 text-center text-sm text-slate-500">
                  Variables appear here when the expression has symbols such as V, I or R.
                </p>
              ) : (
                <ul className="mt-1.5 space-y-2">
                  {rows.map((row) => (
                    <li key={row.name} className="grid grid-cols-[auto_1fr] items-end gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[3.5rem_1.6fr_1fr]">
                      <span className="flex h-9 items-center justify-center rounded-lg bg-[#0F2438] px-2 font-mono text-sm font-semibold text-[#FFB629]">{row.name}</span>
                      <div className="min-w-0">
                        <label htmlFor={`var-${row.name}-name`} className="mb-1 block text-xs font-medium text-slate-600">Display name</label>
                        <input id={`var-${row.name}-name`} value={row.display_name} onChange={(event) => updateRow(row, 'display_name', event.target.value)}
                          placeholder="e.g. Voltage" autoComplete="off" className={smallInput} />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label htmlFor={`var-${row.name}-unit`} className="mb-1 block text-xs font-medium text-slate-600">Unit</label>
                        <input id={`var-${row.name}-unit`} value={row.unit} onChange={(event) => updateRow(row, 'unit', event.target.value)}
                          placeholder="e.g. V" autoComplete="off" className={smallInput} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-1.5 text-xs text-slate-500">Names and units are filled in for common EDC symbols. You can change them.</p>
            </div>
          )}

          <div>
            <label htmlFor="formula-description" className="flex items-baseline justify-between text-sm font-medium text-slate-700">
              <span>Description</span><span className="text-xs font-normal text-slate-400">Optional</span>
            </label>
            <textarea id="formula-description" value={description} onChange={(event) => setDescription(event.target.value)} rows="2"
              placeholder="What does this formula calculate?" className={inputClass} />
          </div>
        </div>

        {/* footer */}
        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50/60 px-6 py-4">
          <button type="button" onClick={onClose} disabled={saving}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300/50 disabled:opacity-60">
            Cancel
          </button>
          <button type="submit" disabled={saving || !parsed.ok || !title.trim()}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60">
            {saving && <span className="edc-fm-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create formula'}
          </button>
        </div>
      </form>
    </div>
  );
}