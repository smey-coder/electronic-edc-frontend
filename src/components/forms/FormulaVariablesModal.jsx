import { useCallback, useEffect, useMemo, useState } from 'react';
import usePermission from '../../hooks/usePermission';
import formulaVariableService, { getErrorMessage } from '../../api/formulaVariableApi ';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const RESERVED = new Set(['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sqrt', 'log', 'ln', 'exp', 'abs', 'pi', 'e', 'min', 'max', 'pow']);

const emptyDraft = () => ({ variable_name: '', display_name: '', unit: '' });
const toDraft = (variable) => ({
  variable_name: variable.variable_name ?? '',
  display_name: variable.display_name ?? '',
  unit: variable.unit ?? '',
});

// Create / bulk: leave empty optional fields out.
const toCreatePayload = (draft) => ({
  variable_name: draft.variable_name.trim(),
  ...(draft.display_name.trim() && { display_name: draft.display_name.trim() }),
  ...(draft.unit.trim() && { unit: draft.unit.trim() }),
});

// Update: send null for an emptied field so it can be cleared.
const toUpdatePayload = (draft) => ({
  variable_name: draft.variable_name.trim(),
  display_name: draft.display_name.trim() || null,
  unit: draft.unit.trim() || null,
});

const ICONS = {
  edit: 'M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  plus: 'M12 5v14M5 12h14',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  close: 'M6 6l12 12M18 6L6 18',
  alert: 'M12 8v5M12 16.5v.1M12 3l10 18H2L12 3Z',
  rows: 'M4 6h16M4 12h16M4 18h16',
};

function Icon({ name, className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

function Spinner() {
  return <span className="fv-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />;
}

const inputClass =
  'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition ' +
  'placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 disabled:bg-slate-50';

const ghostButton =
  'rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300/50 disabled:opacity-60';

const primaryButton =
  'flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 disabled:cursor-not-allowed disabled:opacity-70';

/** Three inputs: symbol, display name, unit. */
function VariableInputs({ value, onChange, idPrefix, autoFocus = false }) {
  const set = (key) => (event) => onChange({ ...value, [key]: event.target.value });
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1.6fr_1fr]">
      <div>
        <label htmlFor={`${idPrefix}-name`} className="mb-1 block text-xs font-medium text-slate-600">Symbol</label>
        <input id={`${idPrefix}-name`} value={value.variable_name} onChange={set('variable_name')} required autoFocus={autoFocus}
          placeholder="V" autoComplete="off" spellCheck={false} className={`${inputClass} font-mono`} />
      </div>
      <div className="order-last col-span-2 sm:order-none sm:col-span-1">
        <label htmlFor={`${idPrefix}-display`} className="mb-1 flex justify-between text-xs font-medium text-slate-600">
          <span>Display name</span><span className="font-normal text-slate-400">Optional</span>
        </label>
        <input id={`${idPrefix}-display`} value={value.display_name} onChange={set('display_name')}
          placeholder="Voltage" autoComplete="off" className={inputClass} />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-unit`} className="mb-1 flex justify-between text-xs font-medium text-slate-600">
          <span>Unit</span><span className="font-normal text-slate-400">Optional</span>
        </label>
        <input id={`${idPrefix}-unit`} value={value.unit} onChange={set('unit')}
          placeholder="V" autoComplete="off" className={inputClass} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */
/**
 * Manage the variables of one formula.
 *   <FormulaVariablesModal formula={formula} onChanged={reloadFormulas} onClose={close} />
 */
export default function FormulaVariablesModal({ formula, onChanged, onClose }) {
  const { can } = usePermission();
  const canCreate = can('formula_variable.create');
  const canUpdate = can('formula_variable.update');
  const canDelete = can('formula_variable.delete');
  const canReplace = can('formula_variable.replace');

  const [variables, setVariables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);

  const [mode, setMode] = useState('list'); // 'list' | 'bulk'
  const [newDraft, setNewDraft] = useState(emptyDraft());
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(emptyDraft());
  const [confirmId, setConfirmId] = useState(null);
  const [bulkRows, setBulkRows] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await formulaVariableService.list(formula.id);
      setVariables(Array.isArray(data) ? data : []);
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Unable to load variables.'));
    } finally {
      setLoading(false);
    }
  }, [formula.id]);

  useEffect(() => {
    load();
  }, [load]);

  // Escape closes the window, and the page behind it does not scroll.
  useEffect(() => {
    const onKeyDown = (event) => event.key === 'Escape' && !busy && onClose();
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [busy, onClose]);

  // Symbols found in the expression that are not variables yet.
  const suggestions = useMemo(() => {
    const found = (formula.expression ?? '').match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? [];
    const have = new Set(variables.map((variable) => variable.variable_name));
    return [...new Set(found)].filter((name) => !RESERVED.has(name.toLowerCase()) && !have.has(name));
  }, [formula.expression, variables]);

  /* Runs an API call, then refreshes the list and tells the page. */
  const run = async (task, { after } = {}) => {
    setBusy(true);
    setActionError('');
    try {
      await task();
      after?.();
      await load();
      onChanged?.();
      return true;
    } catch (error) {
      setActionError(getErrorMessage(error));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleAdd = (event) => {
    event.preventDefault();
    return run(() => formulaVariableService.create(formula.id, toCreatePayload(newDraft)), {
      after: () => setNewDraft(emptyDraft()),
    });
  };

  const handleSaveEdit = (event) => {
    event.preventDefault();
    return run(() => formulaVariableService.update(formula.id, editingId, toUpdatePayload(editDraft)), {
      after: () => setEditingId(null),
    });
  };

  const handleDelete = (variableId) =>
    run(() => formulaVariableService.remove(formula.id, variableId), { after: () => setConfirmId(null) });

  /* ----- bulk editor ----- */
  const openBulk = () => {
    setActionError('');
    setBulkRows(variables.map((variable) => ({ key: `v-${variable.id}`, ...toDraft(variable) })));
    setMode('bulk');
  };

  const updateBulkRow = (key, draft) =>
    setBulkRows((rows) => rows.map((row) => (row.key === key ? { ...row, ...draft } : row)));

  const handleSaveBulk = async (event) => {
    event.preventDefault();
    const names = bulkRows.map((row) => row.variable_name.trim());
    const duplicate = names.find((name, index) => names.indexOf(name) !== index);
    if (duplicate) {
      setActionError(`The symbol "${duplicate}" is used more than once.`);
      return;
    }
    await run(() => formulaVariableService.replaceAll(formula.id, bulkRows.map(toCreatePayload)), {
      after: () => setMode('list'),
    });
  };

  const isBulk = mode === 'bulk';

  return (
    <div
      className="fv-fade fixed inset-0 z-50 flex items-end justify-center bg-[#0F2438]/50 p-4 backdrop-blur-[2px] sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <style>{`
        @keyframes fv-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fv-pop  { from { opacity: 0; transform: translateY(16px) scale(.98); } to { opacity: 1; transform: none; } }
        @keyframes fv-row  { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes fv-spin { to { transform: rotate(360deg); } }
        .fv-fade { animation: fv-fade .15s ease-out; }
        .fv-pop  { animation: fv-pop .22s cubic-bezier(.2,.7,.2,1); }
        .fv-row  { animation: fv-row .25s cubic-bezier(.2,.7,.2,1) both; }
        .fv-spin { animation: fv-spin .7s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .fv-fade, .fv-pop, .fv-row, .fv-spin { animation: none; } }
      `}</style>

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Variables of ${formula.title}`}
        className="fv-pop flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold tracking-tight text-slate-900">
              {isBulk ? 'Edit all variables' : 'Variables'} · {formula.title}
            </h2>
            <p className="mt-1 truncate text-sm text-slate-500">
              Expression: <code className="font-mono font-semibold text-[#0F2438]">{formula.expression}</code>
            </p>
          </div>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close"
            className="-mr-2 -mt-1 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50">
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        {/* body */}
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {(loadError || actionError) && (
            <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <span>{loadError || actionError}</span>
              {loadError && <button type="button" onClick={load} className="font-semibold underline-offset-4 hover:underline">Try again</button>}
            </div>
          )}

          {/* ===== bulk editor ===== */}
          {isBulk ? (
            <form id="fv-bulk-form" onSubmit={handleSaveBulk} className="space-y-3">
              <div className="flex gap-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Saving replaces every variable of this formula with the list below.</p>
              </div>

              {bulkRows.length === 0 && <p className="py-4 text-center text-sm text-slate-500">No variables. Add one below.</p>}

              {bulkRows.map((row, index) => (
                <div key={row.key} className="fv-row flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3" style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}>
                  <div className="min-w-0 flex-1">
                    <VariableInputs idPrefix={row.key} value={row} onChange={(draft) => updateBulkRow(row.key, draft)} />
                  </div>
                  <button type="button" onClick={() => setBulkRows((rows) => rows.filter((item) => item.key !== row.key))}
                    aria-label={`Remove ${row.variable_name || 'variable'}`} title="Remove"
                    className="mb-0.5 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600">
                    <Icon name="trash" />
                  </button>
                </div>
              ))}

              <button type="button" onClick={() => setBulkRows((rows) => [...rows, { key: `n-${Date.now()}-${rows.length}`, ...emptyDraft() }])}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-700">
                <Icon name="plus" /> Add a row
              </button>
            </form>
          ) : (
            <>
              {/* ===== list ===== */}
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-14 animate-pulse rounded-xl bg-slate-100" />
                  ))}
                </div>
              ) : variables.length === 0 && !loadError ? (
                <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center">
                  <p className="font-semibold text-slate-900">No variables yet</p>
                  <p className="mt-1 text-sm text-slate-500">Add the symbols used in the expression so students can enter their values.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {variables.map((variable, index) => {
                    const editing = editingId === variable.id;
                    return (
                      <li key={variable.id} className="fv-row rounded-xl border border-slate-200 bg-white p-3" style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}>
                        {editing ? (
                          <form onSubmit={handleSaveEdit} className="space-y-3">
                            <VariableInputs idPrefix={`edit-${variable.id}`} value={editDraft} onChange={setEditDraft} autoFocus />
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => setEditingId(null)} disabled={busy} className={`${ghostButton} !px-3 !py-1.5`}>Cancel</button>
                              <button type="submit" disabled={busy} className={`${primaryButton} !px-3 !py-1.5`}>
                                {busy && <Spinner />} Save
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-[#0F2438] px-2 font-mono text-sm font-semibold text-[#FFB629]">
                              {variable.variable_name}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-slate-900">{variable.display_name || <span className="text-slate-400">No display name</span>}</p>
                            </div>
                            {variable.unit && (
                              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs text-slate-600">{variable.unit}</span>
                            )}

                            {confirmId === variable.id ? (
                              <div className="flex shrink-0 items-center gap-1.5">
                                <span className="text-xs font-medium text-slate-600">Delete?</span>
                                <button type="button" onClick={() => handleDelete(variable.id)} disabled={busy}
                                  className="flex items-center gap-1.5 rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-70">
                                  {busy && <Spinner />} Yes
                                </button>
                                <button type="button" onClick={() => setConfirmId(null)} disabled={busy}
                                  className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60">
                                  No
                                </button>
                              </div>
                            ) : (
                              <div className="flex shrink-0 gap-0.5">
                                {canUpdate && (
                                  <button type="button" onClick={() => { setActionError(''); setConfirmId(null); setEditDraft(toDraft(variable)); setEditingId(variable.id); }}
                                    aria-label={`Edit ${variable.variable_name}`} title="Edit"
                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                                    <Icon name="edit" />
                                  </button>
                                )}
                                {canDelete && (
                                  <button type="button" onClick={() => { setActionError(''); setEditingId(null); setConfirmId(variable.id); }}
                                    aria-label={`Delete ${variable.variable_name}`} title="Delete"
                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600">
                                    <Icon name="trash" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* symbols found in the expression */}
              {canCreate && !loading && suggestions.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-slate-500">In the expression:</span>
                  {suggestions.map((name) => (
                    <button key={name} type="button" onClick={() => setNewDraft((draft) => ({ ...draft, variable_name: name }))}
                      className="rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 font-mono text-xs font-semibold text-blue-700 transition hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                      + {name}
                    </button>
                  ))}
                </div>
              )}

              {/* add form */}
              {canCreate && (
                <form onSubmit={handleAdd} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-bold text-slate-900">Add a variable</h3>
                  <VariableInputs idPrefix="new" value={newDraft} onChange={setNewDraft} />
                  <div className="flex justify-end">
                    <button type="submit" disabled={busy || !newDraft.variable_name.trim()} className={primaryButton}>
                      {busy && editingId === null && confirmId === null ? <Spinner /> : <Icon name="plus" />}
                      Add variable
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/60 px-6 py-4">
          {isBulk ? (
            <>
              <button type="button" onClick={() => { setActionError(''); setMode('list'); }} disabled={busy} className={ghostButton}>Back</button>
              <button type="submit" form="fv-bulk-form" disabled={busy} className={primaryButton}>
                {busy ? <Spinner /> : <Icon name="check" />}
                {busy ? 'Saving…' : 'Save all'}
              </button>
            </>
          ) : (
            <>
              {canReplace && !loading && !loadError ? (
                <button type="button" onClick={openBulk} disabled={busy}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60">
                  <Icon name="rows" /> Edit all at once
                </button>
              ) : <span />}
              <button type="button" onClick={onClose} disabled={busy} className={ghostButton}>Done</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}