import { useCallback, useEffect, useMemo, useState } from "react";
import usePermission from "../../hooks/usePermission";
import { licenseService, getErrorMessage } from "../../api/licenseApi";
import Modal from "../../components/common/UserModal";
import LicenseFormModal from "../../components/forms/LicenseFormModal";
import LicenseEditModal from "../../components/forms/LicenseEditModal";

const PAGE_SIZE = 10;

const ICONS = {
  key: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78Zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  edit: "M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4",
  ban: "M18.36 5.64a9 9 0 1 1-12.72 12.72M5.64 18.36L18.36 5.64",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  plus: "M12 5v14M5 12h14",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4",
  check: "M5 12.5l4.5 4.5L19 7.5",
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
      <path d={ICONS[name] || ICONS.key} />
    </svg>
  );
}

const controlClass =
  "rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

function RevokeLicenseModal({ license, onConfirm, onClose }) {
  const [revoking, setRevoking] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setError("");
    setRevoking(true);

    try {
      await onConfirm();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setRevoking(false);
    }
  };

  return (
    <Modal title="Revoke License Key" onClose={onClose} busy={revoking}>
      <div className="space-y-5">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        <div className="flex gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
          <Icon name="alert" className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            Are you sure you want to revoke license key{" "}
            <span className="font-semibold">#{license.id}</span>? It will no
            longer be redeemable.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={revoking}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={revoking}
            className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {revoking ? "Revoking…" : "Revoke Key"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function LicenseKeyManagementPage() {
  const { can } = usePermission();

  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [modal, setModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((type, message) => {
    const id = `${Date.now()}-${Math.random()}`;

    setToasts((current) => [...current, { id, type, message }]);

    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  const loadLicenses = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const data = await licenseService.list();
      setLicenses(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setLoadError(
        getErrorMessage(requestError, "Unable to load license keys."),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLicenses();
  }, [loadLicenses]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return licenses.filter((item) => {
      if (
        needle &&
        !`${item.description || ""} ${item.status || ""}`
          .toLowerCase()
          .includes(needle)
      ) {
        return false;
      }

      return true;
    });
  }, [licenses, query]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;

  const pageLicenses = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const hasFilters = Boolean(query);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  const handleCreate = async (payload) => {
    const res = await licenseService.create(payload);

    await loadLicenses();

    notify("success", "License key created successfully.");

    return res;
  };

  const handleUpdate = async (id, payload) => {
    await licenseService.update(id, payload);

    closeModal();

    notify("success", "License key updated successfully.");

    await loadLicenses();
  };

  const handleRevoke = async () => {
    await licenseService.revoke(modal.license.id);

    closeModal();

    notify("success", "License key revoked.");

    await loadLicenses();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this license key?")) {
      try {
        await licenseService.remove(id);

        notify("success", "License key deleted.");

        await loadLicenses();
      } catch (err) {
        alert(getErrorMessage(err, "Failed to delete license key."));
      }
    }
  };

  return (
    <div className="edc-root min-h-full bg-slate-50/70">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .edc-root {
          font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
          color: #1e293b;
        }

        @keyframes edc-page-enter {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes edc-toast-enter {
          from {
            opacity: 0;
            transform: translate3d(18px, 0, 0) scale(.98);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes edc-modal-item {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .edc-page-enter {
          animation: edc-page-enter .45s cubic-bezier(.2,.75,.25,1) both;
        }

        .edc-toast {
          animation: edc-toast-enter .28s cubic-bezier(.2,.7,.2,1) both;
        }

        .edc-table-row {
          animation: edc-modal-item .25s ease-out both;
        }

        .edc-soft-shadow {
          box-shadow: 0 12px 35px -24px rgba(15, 23, 42, .28);
        }

        @media (prefers-reduced-motion: reduce) {
          .edc-page-enter,
          .edc-toast,
          .edc-table-row {
            animation: none !important;
          }

          .edc-root *,
          .edc-root *::before,
          .edc-root *::after {
            scroll-behavior: auto !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      <div className="edc-page-enter mx-auto max-w-6xl px-1 pb-8">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Access management
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              License Keys
            </h1>

            <p className="mt-1.5 text-sm text-slate-500">
              {loading
                ? "Loading license keys…"
                : `${licenses.length} ${
                    licenses.length === 1 ? "key" : "keys"
                  } in the system`}
            </p>
          </div>

          {can("license.create") && (
            <button
              type="button"
              onClick={() => setModal({ type: "create" })}
              className="group flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 active:translate-y-0"
            >
              <Icon name="plus" />
              Generate key
            </button>
          )}
        </div>

        {/* Search Toolbar */}
        <div className="mt-7 flex flex-wrap gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
          <div className="relative min-w-[260px] flex-1">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by description or status..."
              className={`${controlClass} w-full pl-9`}
            />
          </div>
        </div>

        {/* Error */}
        {loadError && (
          <div
            role="alert"
            className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <span>{loadError}</span>

            <button
              type="button"
              onClick={loadLicenses}
              className="font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* License Table */}
        <div className="edc-soft-shadow mt-5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/90 text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">ID</th>
                  <th className="px-5 py-4 font-semibold">License Key</th>
                  <th className="px-5 py-4 font-semibold">Description</th>
                  <th className="px-5 py-4 font-semibold">Created By</th>
                  <th className="px-5 py-4 font-semibold">Usage</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Expires At</th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {/* Loading Skeleton */}
                {loading &&
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-5 py-4">
                        <div className="h-4 w-12 rounded bg-slate-100" />
                      </td>

                      <td className="px-5 py-4">
                        <div className="h-4 w-40 rounded bg-slate-100" />
                      </td>

                      <td className="px-5 py-4">
                        <div className="h-4 w-24 rounded bg-slate-100" />
                      </td>

                      <td className="px-5 py-4">
                        <div className="h-4 w-28 rounded bg-slate-100" />
                      </td>

                      <td className="px-5 py-4">
                        <div className="ml-auto h-8 w-20 rounded bg-slate-100" />
                      </td>
                    </tr>
                  ))}

                {/* License Rows */}
                {!loading &&
                  pageLicenses.map((item) => {
                    const isActive =
                      String(item.status || "").toLowerCase() === "active";

                    const usedCount = item.used_count ?? 0;
                    const maxUses = item.max_uses ?? 1;

                    return (
                      <tr
                        key={item.id}
                        className="transition-colors duration-200 hover:bg-blue-50/40"
                      >
                        {/* ID */}
                        <td className="px-5 py-4 font-semibold text-slate-700">
                          #{item.id}
                        </td>

                        {/* License Key Prefix */}
                        <td className="px-5 py-4">
                          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            <Icon
                              name="key"
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="font-mono text-sm font-semibold text-slate-800">
                              {item.key_prefix || "N/A"}
                            </span>
                          </div>
                        </td>

                        {/* Description */}
                        <td className="px-5 py-4 text-slate-600">
                          {item.description || "No description"}
                        </td>

                        {/* Created By */}
                        <td className="px-5 py-4 text-slate-600">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium">
                            User #{item.created_by ?? "N/A"}
                          </span>
                        </td>

                        {/* Usage */}
                        <td className="px-5 py-4">
                          <div className="min-w-[100px]">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-700">
                                {usedCount}/{maxUses}
                              </span>
                              <span className="text-slate-400">
                                {maxUses > 0
                                  ? Math.min(
                                      100,
                                      Math.round((usedCount / maxUses) * 100),
                                    )
                                  : 0}
                                %
                              </span>
                            </div>

                            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-blue-500 transition-all"
                                style={{
                                  width: `${
                                    maxUses > 0
                                      ? Math.min(
                                          100,
                                          (usedCount / maxUses) * 100,
                                        )
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isActive ? "bg-emerald-500" : "bg-slate-400"
                              }`}
                            />
                            {item.status || "Unknown"}
                          </span>
                        </td>

                        {/* Expires At */}
                        <td className="px-5 py-4 text-slate-500">
                          {item.expires_at
                            ? new Date(item.expires_at).toLocaleDateString()
                            : "Never"}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5">
                          <div className="flex justify-end gap-1">
                            {/* 📌 ប៊ូតុង Edit */}
                            {can("license.update") && (
                              <button
                                type="button"
                                onClick={() =>
                                  setModal({ type: "edit", license: item })
                                }
                                title="Edit"
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                              >
                                <Icon name="edit" />
                              </button>
                            )}
                            {can("license.revoke") && isActive && (
                              <button
                                type="button"
                                onClick={() =>
                                  setModal({ type: "revoke", license: item })
                                }
                                title="Revoke"
                                className="rounded-lg p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-600"
                              >
                                <Icon name="ban" />
                              </button>
                            )}
                            {can("license.delete") && (
                              <button
                                type="button"
                                onClick={() => handleDelete(item.id)}
                                title="Delete"
                                className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                              >
                                <Icon name="trash" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {!loading && !loadError && pageLicenses.length === 0 && (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Icon name="key" className="h-6 w-6" />
              </div>

              <p className="font-semibold text-slate-900">
                {hasFilters
                  ? "No license keys match your search"
                  : "No license keys yet"}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {hasFilters
                  ? "Try another search term."
                  : "Generate your first license key to get started."}
              </p>

              <button
                type="button"
                onClick={() =>
                  hasFilters ? setQuery("") : setModal({ type: "create" })
                }
                className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
              >
                {hasFilters ? "Clear search" : "Generate key"}
              </button>
            </div>
          )}

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
              <span>
                Showing {pageStart + 1}–
                {Math.min(pageStart + PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="px-1 text-slate-500">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create License Modal */}
      {modal?.type === "create" && (
        <LicenseFormModal onSubmit={handleCreate} onClose={closeModal} />
      )}

      {/* Edit License Modal */}
      {modal?.type === "edit" && (
        <LicenseEditModal
          license={modal.license}
          onSubmit={handleUpdate}
          onClose={closeModal}
        />
      )}

      {/* Revoke License Modal */}
      {modal?.type === "revoke" && (
        <RevokeLicenseModal
          license={modal.license}
          onConfirm={handleRevoke}
          onClose={closeModal}
        />
      )}

      {/* Toast Notifications */}
      <div
        className="pointer-events-none fixed right-4 top-4 z-[60] flex flex-col gap-2"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="edc-toast flex items-center gap-2.5 rounded-xl border border-slate-700/10 bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl shadow-slate-900/15"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
              <Icon name="check" className="h-3 w-3" />
            </span>

            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
