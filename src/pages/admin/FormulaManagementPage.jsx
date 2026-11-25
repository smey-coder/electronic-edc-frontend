import { useCallback, useEffect, useState } from "react";
import usePermission from "../../hooks/usePermission";
import { formulaService, getErrorMessage } from "../../api/formulaApi";
import formulaVariableService from "../../api/formulaVariableApi ";
import Modal from "../../components/common/UserModal";
import FormulaFormModal from "../../components/forms/FormulaFormModal";
import FormulaVariablesModal from "../../components/forms/FormulaVariablesModal";
import { solveSteps } from "../../utils/edcExpression";
import ResultStep from "../../components/calculator/ResultStep";

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */
const ICONS = {
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4",
  plus: "M12 5v14M5 12h14",
  check: "M5 12.5l4.5 4.5L19 7.5",
  formula: "M17 4H7l6 8-6 8h10",
  edit: "M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  calc: "M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM8 7h8M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01",
  tag: "M3 12V4h8l10 10-8 8L3 12ZM7.5 8.5h.01",
  vars: "M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01",
  alert: "M12 8v5M12 16.5v.1M12 3l10 18H2L12 3Z",
};

function Icon({ name, className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICONS[name] || ICONS.formula} />
    </svg>
  );
}

function Spinner({ dark = false }) {
  return (
    <span
      className={`edc-spin h-4 w-4 rounded-full border-2 ${dark ? "border-slate-300 border-t-slate-700" : "border-white/40 border-t-white"}`}
      aria-hidden="true"
    />
  );
}

const controlClass =
  "rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const ghostButton =
  "rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300/50 disabled:opacity-60";

/* A sine wave with a bright pulse travelling along it. */
function WaveArt() {
  const d =
    "M0 60C33 10 67 10 100 60S167 110 200 60S267 10 300 60S367 110 400 60";
  return (
    <svg
      viewBox="0 0 400 120"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-3/5 opacity-90 sm:block"
      aria-hidden="true"
    >
      <g fill="none" strokeLinecap="round">
        <path d={d} stroke="#2A4A70" strokeWidth="1.5" />
        <path
          d={d}
          stroke="#1C3858"
          strokeWidth="1.5"
          transform="translate(0 18)"
        />
        <path
          className="edc-wave"
          pathLength="100"
          d={d}
          stroke="#FFB629"
          strokeWidth="2.5"
        />
      </g>
    </svg>
  );
}

/* Empty-state picture: axes, a curve and a sigma. */
function EmptyArt() {
  return (
    <svg viewBox="0 0 160 110" className="mx-auto h-28 w-40" aria-hidden="true">
      <rect x="6" y="6" width="148" height="98" rx="14" fill="#F1F5F9" />
      <path
        d="M26 86V28M26 86h112"
        stroke="#CBD5E1"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        className="edc-curve"
        pathLength="100"
        d="M30 78C50 78 54 40 76 40S100 76 134 34"
        stroke="#2563EB"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="134" cy="34" r="4.5" fill="#FFB629" />
      <path
        d="M118 22H104l8 9-8 9h14"
        stroke="#0F2438"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function FormulaManagementPage() {
  const { can } = usePermission();

  const [categories, setCategories] = useState([]);
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(true); // first load only
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [modal, setModal] = useState(null); // { type: 'createFormula' | 'editFormula' | 'deleteFormula' | 'categories' | 'calculate', formula }
  const [modalError, setModalError] = useState("");
  const [busy, setBusy] = useState(false);

  // calculator
  const [calcInputs, setCalcInputs] = useState({});
  const [calcResult, setCalcResult] = useState(null);

  // categories
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [confirmCatId, setConfirmCatId] = useState(null);

  const [toasts, setToasts] = useState([]);

  const notify = useCallback((type, message) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, type, message }]);
    setTimeout(
      () => setToasts((current) => current.filter((t) => t.id !== id)),
      3500,
    );
  }, []);

  // wait a moment after typing before asking the server
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    setError("");
    try {
      const [catRes, formRes] = await Promise.all([
        formulaService.getCategories(),
        formulaService.listFormulas({
          category_id: selectedCategory || undefined,
          search: searchQuery || undefined,
        }),
      ]);
      setCategories(Array.isArray(catRes) ? catRes : []);
      setFormulas(Array.isArray(formRes) ? formRes : []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load formula data."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const closeModal = () => {
    if (busy) return;
    setModal(null);
    setModalError("");
    setConfirmCatId(null);
  };

  const openModal = (next) => {
    setModalError("");
    setConfirmCatId(null);
    setModal(next);
  };

  const categoryName = (formula) =>
    formula.category?.name ??
    categories.find((cat) => String(cat.id) === String(formula.category_id))
      ?.name ??
    null;

  const hasFilters = Boolean(searchInput.trim() || selectedCategory);

  /* ----------------------------- actions ----------------------------- */
  const handleDeleteFormula = async () => {
    setBusy(true);
    setModalError("");
    try {
      await formulaService.deleteFormula(modal.formula.id);
      setBusy(false);
      setModal(null);
      notify("success", "Formula deleted successfully.");
      loadData();
    } catch (err) {
      setModalError(getErrorMessage(err, "Failed to delete formula."));
      setBusy(false);
    }
  };

  const handleCalculateSubmit = (e) => {
    e.preventDefault();
    setModalError("");
    setBusy(true);

    try {
      if (!modal?.formula) {
        throw new Error("No formula selected.");
      }

      // ហៅប្រើប្រាស់ solveSteps ពី edcExpression.js ឬ solveSteps.js
      const result = solveSteps({
        expression: modal.formula.expression,
        values: calcInputs,
        variables: modal.formula.variables,
      });

      if (!result.ok) {
        setModalError(result.error || "Calculation failed.");
        setCalcResult(null);
      } else {
        // រៀបចំទុកដាក់ទិន្នន័យចូល State ឱ្យចំ Structure ដែលត្រូវបង្ហាញលើ UI
        setCalcResult({
          result: result.value,
          unit: modal.formula.variables?.[0]?.unit || "",
          steps: result.steps || [], // ធានាថា steps ត្រូវបានចូលទីនេះ
        });
      }
    } catch (err) {
      console.error("Calculation Error:", err);
      setModalError(
        err.message || "An unexpected error occurred during calculation.",
      );
      setCalcResult(null);
    } finally {
      setBusy(false);
    }
  };

  const handleCreateCategory = async (event) => {
    event.preventDefault();
    setBusy(true);
    setModalError("");
    try {
      await formulaService.createCategory({
        name: catName.trim(),
        description: catDesc.trim(),
      });
      setCatName("");
      setCatDesc("");
      notify("success", "Category created successfully.");
      await loadData();
    } catch (err) {
      setModalError(getErrorMessage(err, "Failed to create category."));
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteCategory = async (catId) => {
    setBusy(true);
    setModalError("");
    try {
      await formulaService.deleteCategory(catId);
      setConfirmCatId(null);
      if (String(selectedCategory) === String(catId)) setSelectedCategory("");
      notify("success", "Category deleted.");
      await loadData();
    } catch (err) {
      setModalError(getErrorMessage(err, "Failed to delete category."));
    } finally {
      setBusy(false);
    }
  };

  /* ------------------------------ render ------------------------------ */
  return (
    <div className="mx-auto max-w-6xl pb-8 text-slate-800">
      <style>{`
        @keyframes edc-rise  { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes edc-pop   { from { opacity: 0; transform: translateY(8px) scale(.98); } to { opacity: 1; transform: none; } }
        @keyframes edc-toast { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: none; } }
        @keyframes edc-wave  { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -100; } }
        @keyframes edc-draw  { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
        @keyframes edc-spin  { to { transform: rotate(360deg); } }

        .edc-rise  { opacity: 0; animation: edc-rise .5s cubic-bezier(.2,.7,.2,1) forwards; }
        .edc-pop   { animation: edc-pop .3s cubic-bezier(.2,.7,.2,1) both; }
        .edc-toast { animation: edc-toast .25s cubic-bezier(.2,.7,.2,1); }
        .edc-wave  { stroke-dasharray: 5 95; animation: edc-wave 3.2s linear infinite; }
        .edc-curve { stroke-dasharray: 100; animation: edc-draw 1.4s ease-out both; }
        .edc-spin  { animation: edc-spin .7s linear infinite; }

        @media (prefers-reduced-motion: reduce) {
          .edc-rise, .edc-pop, .edc-toast, .edc-curve, .edc-spin { animation: none; opacity: 1; }
          .edc-wave { animation: none; stroke-dasharray: none; display: none; }
        }
      `}</style>

      {/* ---------- Banner ---------- */}
      <section className="edc-rise relative overflow-hidden rounded-2xl bg-[#0F2438] p-6 text-white shadow-[0_18px_40px_-20px_rgba(15,36,56,.6)] sm:p-8">
        <WaveArt />
        <div className="relative max-w-xl">
          <p className="flex items-center gap-2 text-xs font-semibold text-[#FFB629]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FFB629]" />
            Engineering engine
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Formula management
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-[#B9CBE3]">
            Create formulas, group them by category and solve them with
            step-by-step substitution.
          </p>

          <div className="mt-5 flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-white/10 px-3 py-1 text-[#D7E3F3]">
              <span className="font-semibold text-white">
                {formulas.length}
              </span>{" "}
              {formulas.length === 1 ? "formula" : "formulas"}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[#D7E3F3]">
              <span className="font-semibold text-white">
                {categories.length}
              </span>{" "}
              {categories.length === 1 ? "category" : "categories"}
            </span>
          </div>

          {can("formula.create") && (
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => openModal({ type: "createFormula" })}
                className="flex items-center gap-2 rounded-xl bg-[#FFB629] px-4 py-2.5 text-sm font-semibold text-[#0F2438] shadow-sm transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB629]/40 active:scale-[.98]"
              >
                <Icon name="plus" /> Create formula
              </button>
              <button
                type="button"
                onClick={() => openModal({ type: "categories" })}
                className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
              >
                <Icon name="tag" /> Manage categories
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ---------- Search + category chips ---------- */}
      <div
        className="edc-rise mt-6 space-y-3"
        style={{ animationDelay: "80ms" }}
      >
        <div className="relative">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search formulas by title…"
            aria-label="Search formulas"
            className={`${controlClass} w-full pl-10`}
          />
        </div>

        <div
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
          role="tablist"
          aria-label="Categories"
        >
          {[{ id: "", name: "All" }, ...categories].map((cat) => {
            const active = String(selectedCategory) === String(cat.id);
            return (
              <button
                key={cat.id === "" ? "all" : cat.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() =>
                  setSelectedCategory(cat.id === "" ? "" : String(cat.id))
                }
                className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 ${
                  active
                    ? "border-[#0F2438] bg-[#0F2438] text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={loadData}
            className="font-semibold underline-offset-4 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* ---------- Formula cards ---------- */}
      <div
        className={`mt-6 transition-opacity duration-200 ${refreshing && !loading ? "opacity-60" : "opacity-100"}`}
      >
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="h-5 w-20 rounded-full bg-slate-100" />
                <div className="mt-4 h-4 w-3/4 rounded bg-slate-100" />
                <div className="mt-4 h-12 rounded-lg bg-slate-100" />
                <div className="mt-4 h-9 rounded-lg bg-slate-100" />
              </div>
            ))}
          </div>
        ) : formulas.length === 0 ? (
          <div className="edc-pop rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <EmptyArt />
            <p className="mt-4 font-semibold text-slate-900">
              {hasFilters ? "No formulas match your search" : "No formulas yet"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {hasFilters
                ? "Try another word or choose a different category."
                : "Create the first formula to start calculating."}
            </p>
            {hasFilters ? (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setSelectedCategory("");
                }}
                className={`mt-5 ${ghostButton}`}
              >
                Clear filters
              </button>
            ) : (
              can("formula.create") && (
                <button
                  type="button"
                  onClick={() => openModal({ type: "createFormula" })}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30"
                >
                  <Icon name="plus" /> Create formula
                </button>
              )
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {formulas.map((formula, index) => {
              const category = categoryName(formula);
              return (
                <article
                  key={formula.id}
                  className="edc-rise group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_36px_-16px_rgba(15,36,56,.28)]"
                  style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      <Icon name="tag" className="h-3 w-3" />
                      {category ?? "Uncategorized"}
                    </span>
                    <div className="flex gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                      {can("formula_variable.read") && (
                        <button
                          type="button"
                          onClick={() =>
                            openModal({ type: "variables", formula })
                          }
                          aria-label={`Variables of ${formula.title}`}
                          title="Variables"
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                        >
                          <Icon name="vars" />
                        </button>
                      )}
                      {can("formula.update") && (
                        <button
                          type="button"
                          onClick={() =>
                            openModal({ type: "editFormula", formula })
                          }
                          aria-label={`Edit ${formula.title}`}
                          title="Edit"
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                        >
                          <Icon name="edit" />
                        </button>
                      )}
                      {can("formula.delete") && (
                        <button
                          type="button"
                          onClick={() =>
                            openModal({ type: "deleteFormula", formula })
                          }
                          aria-label={`Delete ${formula.title}`}
                          title="Delete"
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                        >
                          <Icon name="trash" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h2 className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
                    {formula.title}
                  </h2>

                  <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
                    <code className="whitespace-nowrap font-mono text-[15px] font-semibold text-[#0F2438]">
                      {formula.expression}
                    </code>
                  </div>

                  {formula.variables?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {formula.variables.map((variable) => (
                        <span
                          key={variable.variable_name}
                          className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-xs text-slate-600"
                        >
                          {variable.variable_name}
                          {variable.unit ? (
                            <span className="text-slate-400">
                              {" "}
                              ({variable.unit})
                            </span>
                          ) : null}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500">
                    {formula.description || "No description."}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setCalcInputs({});
                      setCalcResult(null);
                      openModal({ type: "calculate", formula });
                    }}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 active:scale-[.98]"
                  >
                    <Icon name="calc" /> Calculate
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================ MODALS ============================ */}
      {/* Calculate / Step-by-Step Solver Modal */}
      {modal?.type === "calculate" && (
        <Modal
          title={`Calculate: ${modal.formula.title}`}
          onClose={closeModal}
          busy={busy}
        >
          <form
            onSubmit={handleCalculateSubmit}
            className="space-y-4 max-h-[75vh] overflow-y-auto pr-1"
          >
            {modalError && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
              >
                {modalError}
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
              <p className="text-xs font-medium text-slate-500">
                Expression Formula
              </p>
              <code className="mt-0.5 block overflow-x-auto whitespace-nowrap font-mono text-[15px] font-semibold text-[#0F2438]">
                {modal.formula.expression}
              </code>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {modal.formula.variables?.map((variable) => (
                <div key={variable.variable_name}>
                  <label
                    htmlFor={`calc-${variable.variable_name}`}
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    {variable.display_name || variable.variable_name}
                    {variable.unit ? (
                      <span className="font-normal text-slate-400">
                        {" "}
                        ({variable.unit})
                      </span>
                    ) : null}
                  </label>
                  <input
                    id={`calc-${variable.variable_name}`}
                    type="number"
                    step="any"
                    required
                    value={calcInputs[variable.variable_name] ?? ""}
                    onChange={(event) =>
                      setCalcInputs({
                        ...calcInputs,
                        [variable.variable_name]: event.target.value,
                      })
                    }
                    placeholder={`Enter ${variable.variable_name}`}
                    className={`${controlClass} w-full font-mono`}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={busy}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busy && <Spinner />}
                {busy ? "Computing…" : "Compute Step-by-Step"}
              </button>
            </div>

            {/* Structured Worked Solution / Steps Display */}
            {calcResult && calcResult.steps && (
              <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Worked Solution & Explanation
                </h4>

                <div className="space-y-2.5">
                  {calcResult.steps.map((step, idx) => {
                    switch (step.kind) {
                      case "formula":
                        return (
                          <div
                            key={idx}
                            className="rounded-lg border border-blue-100 bg-blue-50/60 p-3"
                          >
                            <span className="text-[11px] font-bold uppercase text-blue-800">
                              Step 1: {step.title}
                            </span>
                            <div className="mt-1 font-mono text-sm font-semibold text-blue-900">
                              {step.expression}
                            </div>
                          </div>
                        );
                      case "given":
                        return (
                          <div
                            key={idx}
                            className="rounded-lg border border-slate-200 bg-white p-3"
                          >
                            <span className="text-[11px] font-bold uppercase text-slate-600">
                              Step 2: {step.title}
                            </span>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              {step.items.map((item, i) => (
                                <div
                                  key={i}
                                  className="rounded border border-slate-100 bg-slate-50 p-2 font-mono text-xs"
                                >
                                  <span className="text-slate-500">
                                    {item.name} ({item.label}):
                                  </span>{" "}
                                  <span className="font-bold text-slate-800">
                                    {item.value} {item.unit}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      case "substitute":
                        return (
                          <div
                            key={idx}
                            className="rounded-lg border border-amber-100 bg-amber-50/60 p-3"
                          >
                            <span className="text-[11px] font-bold uppercase text-amber-800">
                              Step 3: {step.title}
                            </span>
                            <div className="mt-1 font-mono text-sm font-semibold text-amber-900">
                              {step.expression}
                            </div>
                            {step.note && (
                              <p className="mt-1 text-xs italic text-amber-700">
                                {step.note}
                              </p>
                            )}
                          </div>
                        );
                      case "calc":
                        return (
                          <div
                            key={idx}
                            className="rounded-lg border border-slate-200 bg-white p-3 space-y-1.5"
                          >
                            <span className="text-[11px] font-bold uppercase text-slate-600">
                              Calculation
                            </span>
                            <div className="space-y-1">
                              {step.details.map((detail, dIdx) => (
                                <div
                                  key={dIdx}
                                  className="rounded bg-slate-50 p-2 font-mono text-xs text-slate-800 border border-slate-100"
                                >
                                  {detail}
                                </div>
                              ))}
                            </div>
                            <div className="font-mono text-xs font-semibold text-blue-600 pt-1">
                              Current: {step.expression}
                            </div>
                          </div>
                        );
                      // result final 
                      case "result":
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-4"
                          >
                            <div>
                              <span className="block text-[11px] font-bold uppercase text-emerald-800">
                                Final Result
                              </span>
                              <span className="font-mono text-xl font-bold text-emerald-700">
                                {step.value}
                              </span>
                              <span className="ml-2 font-mono text-xl font-bold text-emerald-700">
                                {step.unit}
                              </span>
                            </div>
                            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                          </div>
                        );
                      default:
                        return null;
                    }
                  })}
                </div>
              </div>
            )}
          </form>
        </Modal>
      )}

      {/* Create formula */}
      {modal?.type === "createFormula" && (
        <FormulaFormModal
          categories={categories}
          onSubmit={async (payload) => {
            const created = await formulaService.createFormula(payload);
            // If the API did not save the variables sent with the formula, save them with the variables endpoint.
            const newId = created?.id ?? created?.formula?.id;
            const alreadySaved =
              (created?.variables?.length ??
                created?.formula?.variables?.length ??
                0) > 0;
            if (payload.variables?.length && newId && !alreadySaved) {
              try {
                await formulaVariableService.replaceAll(
                  newId,
                  payload.variables,
                );
              } catch (variableError) {
                notify(
                  "error",
                  "Formula created, but its variables were not saved. Add them with the Variables button.",
                );
              }
            }
            notify("success", "Formula created successfully.");
            loadData();
          }}
          onClose={closeModal}
        />
      )}

      {/* Edit formula */}
      {modal?.type === "editFormula" && (
        <FormulaFormModal
          formula={modal.formula}
          categories={categories}
          onSubmit={async (payload) => {
            await formulaService.updateFormula(modal.formula.id, payload);
            notify("success", "Formula updated successfully.");
            loadData();
          }}
          onClose={closeModal}
        />
      )}

      {/* Variables */}
      {modal?.type === "variables" && (
        <FormulaVariablesModal
          formula={modal.formula}
          onChanged={loadData}
          onClose={closeModal}
        />
      )}

      {/* Delete formula */}
      {modal?.type === "deleteFormula" && (
        <Modal title="Delete formula" onClose={closeModal} busy={busy}>
          <div className="space-y-5">
            {modalError && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
              >
                {modalError}
              </div>
            )}
            <div className="flex gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-800">
              <Icon name="alert" className="mt-0.5 h-5 w-5 shrink-0" />
              <p>
                <span className="font-semibold">{modal.formula.title}</span>{" "}
                will be removed permanently. Students will no longer be able to
                use it.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={busy}
                className={ghostButton}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteFormula}
                disabled={busy}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-600/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busy && <Spinner />}
                {busy ? "Deleting…" : "Delete formula"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Manage categories */}
      {modal?.type === "categories" && (
        <Modal title="Manage categories" onClose={closeModal} busy={busy}>
          <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
            {modalError && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
              >
                {modalError}
              </div>
            )}

            <form
              onSubmit={handleCreateCategory}
              className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <h3 className="text-sm font-bold text-slate-900">
                Add a category
              </h3>
              <input
                type="text"
                required
                value={catName}
                onChange={(event) => setCatName(event.target.value)}
                placeholder="Name, e.g. AC circuits"
                aria-label="Category name"
                className={`${controlClass} w-full`}
              />
              <textarea
                value={catDesc}
                onChange={(event) => setCatDesc(event.target.value)}
                placeholder="Description (optional)"
                aria-label="Category description"
                rows="2"
                className={`${controlClass} w-full`}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={busy}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 disabled:opacity-70"
                >
                  {busy && confirmCatId === null && <Spinner />}
                  Save category
                </button>
              </div>
            </form>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">
                Existing categories
              </h3>
              {categories.length === 0 ? (
                <p className="text-sm text-slate-500">No categories yet.</p>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="edc-pop flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {cat.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {cat.description || "No description"}
                      </p>
                    </div>

                    {confirmCatId === cat.id ? (
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span className="text-xs font-medium text-slate-600">
                          Delete?
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id)}
                          disabled={busy}
                          className="flex items-center gap-1.5 rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-70"
                        >
                          {busy && <Spinner />} Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmCatId(null)}
                          disabled={busy}
                          className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmCatId(cat.id)}
                        aria-label={`Delete category ${cat.name}`}
                        title="Delete"
                        className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                      >
                        <Icon name="trash" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ============================ TOASTS ============================ */}
      <div
        className="pointer-events-none fixed right-4 top-4 z-[60] flex flex-col gap-2"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="edc-toast pointer-events-auto flex items-center gap-2.5 rounded-lg bg-[#0F2438] px-4 py-3 text-sm font-medium text-white shadow-lg"
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}
            >
              <Icon
                name={toast.type === "error" ? "alert" : "check"}
                className="h-3 w-3"
              />
            </span>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
