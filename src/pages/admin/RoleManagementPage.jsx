import { useCallback, useEffect, useMemo, useState } from "react";
import usePermission from "../../hooks/usePermission";
import { roleService, getErrorMessage } from "../../api/roleApi";
import { permissionService } from "../../api/permissionApi";
import Modal from "../../components/common/UserModal";
import RoleFormModal from "../../components/forms/RoleFormModal";

const PAGE_SIZE = 10;

/* ------------------------------ helpers ------------------------------ */
const ICONS = {
  edit: "M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4",
  shield: "M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3Z",
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
      <path d={ICONS[name]} />
    </svg>
  );
}

const controlClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15";

/* --------------------------- delete modal --------------------------- */
function DeleteRoleModal({ role, onConfirm, onClose }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setError("");
    setDeleting(true);
    try {
      await onConfirm();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setDeleting(false);
    }
  };

  return (
    <Modal title="Delete role" onClose={onClose} busy={deleting}>
      <div className="space-y-5">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}
        <div className="flex gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-800">
          <Icon name="alert" className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            Role <span className="font-semibold">{role.name}</span> will be
            permanently removed from the system. This cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-600/30 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {deleting && (
              <span
                className="edc-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
                aria-hidden="true"
              />
            )}
            {deleting ? "Deleting…" : "Delete role"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------- page ------------------------------- */
export default function RoleManagementPage() {
  const { can } = usePermission();

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [permissionLoadError, setPermissionLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [modal, setModal] = useState(null); // { type: 'create' | 'edit' | 'delete', role? }
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((type, message) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, type, message }]);
    setTimeout(
      () => setToasts((current) => current.filter((toast) => toast.id !== id)),
      3500,
    );
  }, []);

  const loadRoles = useCallback(async () => {
    try {
      const data = await roleService.list();
      setRoles(Array.isArray(data) ? data : []);
      setLoadError("");
    } catch (requestError) {
      setLoadError(getErrorMessage(requestError, "Unable to load roles."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    roleService
      .list()
      .then((data) => {
        if (active) {
          setRoles(Array.isArray(data) ? data : []);
          setLoadError("");
        }
      })
      .catch((requestError) => {
        if (active) {
          setLoadError(getErrorMessage(requestError, "Unable to load roles."));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    permissionService
      .list()
      .then((data) => {
        if (active) {
          setPermissions(Array.isArray(data) ? data : []);
          setPermissionLoadError("");
        }
      })
      .catch((requestError) => {
        if (active) {
          setPermissionLoadError(
            getErrorMessage(requestError, "Unable to load permissions."),
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return roles.filter((role) => {
      if (
        needle &&
        !`${role.name} ${role.description || ""}`.toLowerCase().includes(needle)
      )
        return false;
      return true;
    });
  }, [roles, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRoles = filtered.slice(pageStart, pageStart + PAGE_SIZE);
  const hasFilters = Boolean(query);

  const closeModal = useCallback(() => setModal(null), []);

  /* ----- actions ----- */
  const handleCreate = async (payload) => {
    await roleService.create(payload);
    closeModal();
    notify("success", "Role created.");
    await loadRoles();
  };

  const handleUpdate = async (payload) => {
    await roleService.update(modal.role.id, payload);
    closeModal();
    notify("success", "Role updated.");
    await loadRoles();
  };

  const handleDelete = async () => {
    await roleService.remove(modal.role.id);
    closeModal();
    notify("success", "Role deleted.");
    await loadRoles();
  };

  return (
    <div className="edc-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        .edc-root { font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif; }
        @keyframes edc-toast { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: none; } }
        .edc-toast { animation: edc-toast .25s cubic-bezier(.2,.7,.2,1); }
        @media (prefers-reduced-motion: reduce) { .edc-toast { animation: none; } }
      `}</style>

      <div className="mx-auto max-w-6xl">
        {/* header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Roles
            </h1>
            <p className="mt-1 text-[15px] text-slate-600">
              {loading
                ? "Loading roles…"
                : `${roles.length} ${roles.length === 1 ? "role" : "roles"} in the system`}
            </p>
          </div>

          {/* Role create */}
          {can("role.create") && (
            <button
              type="button"
              onClick={() => setModal({ type: "create" })}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 active:scale-[.98]"
            >
              <Icon name="plus" /> Add role
            </button>
          )}
        </div>

        {/* toolbar */}
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="relative min-w-[260px] flex-1">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search by role name or description"
              aria-label="Search roles"
              className={`${controlClass} w-full pl-9`}
            />
          </div>
        </div>

        {loadError && (
          <div
            role="alert"
            className="mt-6 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <span>{loadError}</span>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setLoadError("");
                loadRoles();
              }}
              className="rounded-md px-3 py-1.5 font-semibold text-red-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
            >
              Try again
            </button>
          </div>
        )}

        {/* table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_40px_-12px_rgba(15,36,56,.12)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Role Name</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading &&
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100" />
                          <div className="h-4 w-32 rounded bg-slate-100" />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-60 rounded bg-slate-100" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="ml-auto h-8 w-20 rounded bg-slate-100" />
                      </td>
                    </tr>
                  ))}

                {!loading &&
                  pageRoles.map((role) => (
                    <tr
                      key={role.id}
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                            <Icon name="shield" className="h-4 w-4" />
                          </span>
                          <span>{role.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {role.description || "No description provided."}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          {can("role.update") && (
                            <button
                              type="button"
                              onClick={() => setModal({ type: "edit", role })}
                              aria-label={`Edit ${role.name}`}
                              title="Edit"
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                            >
                              <Icon name="edit" />
                            </button>
                          )}
                          {can("role.delete") && (
                            <button
                              type="button"
                              onClick={() => setModal({ type: "delete", role })}
                              aria-label={`Delete ${role.name}`}
                              title="Delete"
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                            >
                              <Icon name="trash" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {!loading && !loadError && pageRoles.length === 0 && (
            <div className="px-6 py-14 text-center">
              <p className="font-semibold text-slate-900">
                {hasFilters ? "No roles match your search" : "No roles yet"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {hasFilters
                  ? "Try a different search term."
                  : "Create the first role to get started."}
              </p>
              {hasFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setPage(1);
                  }}
                  className="mt-5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300/50"
                >
                  Clear search
                </button>
              ) : (
                can("role.create") && (
                  <button
                    type="button"
                    onClick={() => setModal({ type: "create" })}
                    className="mt-5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300/50"
                  >
                    Add role
                  </button>
                )
              )}
            </div>
          )}

          {/* pagination */}
          {!loading && filtered.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3 text-sm text-slate-600">
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
                  className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
                  className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* modals */}
      {(modal?.type === "create" || modal?.type === "edit") && (
        <RoleFormModal
          key={modal.type === "edit" ? modal.role.id : "create"}
          isOpen
          initialData={modal.type === "edit" ? modal.role : null}
          allPermissions={permissions}
          permissionError={permissionLoadError}
          onSubmit={modal.type === "edit" ? handleUpdate : handleCreate}
          onClose={closeModal}
        />
      )}
      {modal?.type === "delete" && (
        <DeleteRoleModal
          role={modal.role}
          onConfirm={handleDelete}
          onClose={closeModal}
        />
      )}

      {/* toasts */}
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