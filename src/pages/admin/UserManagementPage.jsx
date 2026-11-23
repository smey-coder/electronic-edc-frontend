import { useCallback, useEffect, useMemo, useState } from "react";
import useAuth from "../../hooks/useAuth";
import usePermission from "../../hooks/usePermission";
import { userService, roleService, getErrorMessage } from "../../api/userApi";
import Modal from "../../components/common/UserModal";
import UserFormModal from "../../components/forms/UserFormModal";

const PAGE_SIZE = 10;

/* ------------------------------ helpers ------------------------------ */
const getRoleId = (user) => user.role_id ?? user.role?.id ?? null;

const getRoleName = (user, roles) => {
  if (typeof user.role === "string") return user.role;
  if (user.role?.name) return user.role.name;
  return (
    roles.find((role) => String(role.id) === String(user.role_id))?.name ??
    "No role"
  );
};

const initials = (user) =>
  (user.username || user.email || "?").slice(0, 2).toUpperCase();

const AVATARS = [
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
];

const roleBadgeClass = (name) => {
  const key = String(name).toLowerCase();
  if (key === "admin") return "bg-[#0F2438] text-white";
  if (key === "teacher") return "bg-blue-50 text-blue-700";
  if (key === "student") return "bg-slate-100 text-slate-700";
  return "bg-slate-100 text-slate-500";
};

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

/* --------------------------- small modals --------------------------- */
function RoleModal({ user, roles, onSubmit, onClose }) {
  const [roleId, setRoleId] = useState(getRoleId(user) ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSubmit(Number(roleId));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Change role"
      description={`Choose a new role for ${user.username}.`}
      onClose={onClose}
      busy={saving}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}
        <div>
          <label
            htmlFor="um-assign-role"
            className="text-sm font-medium text-slate-700"
          >
            Role
          </label>
          <select
            id="um-assign-role"
            value={roleId}
            onChange={(event) => setRoleId(event.target.value)}
            required
            className={`${controlClass} mt-1.5 block w-full`}
          >
            <option value="">Select a role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || roleId === ""}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving && (
              <span
                className="edc-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
                aria-hidden="true"
              />
            )}
            {saving ? "Saving…" : "Save role"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteModal({ user, onConfirm, onClose }) {
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
    <Modal title="Delete user" onClose={onClose} busy={deleting}>
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
            <span className="font-semibold">{user.username}</span> will be
            removed from the system. This cannot be undone. To keep the account
            but block access, set it to inactive instead.
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
            {deleting ? "Deleting…" : "Delete user"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------- page ------------------------------- */
export default function UserManagementPage() {
  const auth = useAuth();
  const { can } = usePermission();
  const currentUserId = auth?.user?.id;

  const [users, setUsers] = useState([]);
  const [fetchedRoles, setFetchedRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const [modal, setModal] = useState(null); // { type: 'create' | 'edit' | 'role' | 'delete', user? }
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((type, message) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, type, message }]);
    setTimeout(
      () => setToasts((current) => current.filter((toast) => toast.id !== id)),
      3500,
    );
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await userService.list();
      setUsers(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setLoadError(getErrorMessage(requestError, "Unable to load users."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    roleService
      .list()
      .then((data) => setFetchedRoles(Array.isArray(data) ? data : []))
      .catch(() => setFetchedRoles([]));
  }, []);

  // Use the roles endpoint when it works; otherwise build the list from the users we have.
  const roles = useMemo(() => {
    if (fetchedRoles.length > 0) return fetchedRoles;
    const seen = new Map();
    users.forEach((user) => {
      const id = getRoleId(user);
      const name = typeof user.role === "string" ? user.role : user.role?.name;
      if (id != null && name) seen.set(id, { id, name });
    });
    return [...seen.values()];
  }, [fetchedRoles, users]);

  const statuses = useMemo(
    () => [
      ...new Set(users.map((user) => user.account_status).filter(Boolean)),
    ],
    [users],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return users.filter((user) => {
      if (
        needle &&
        !`${user.username} ${user.email}`.toLowerCase().includes(needle)
      )
        return false;
      if (roleFilter && String(getRoleId(user)) !== roleFilter) return false;
      if (statusFilter && user.account_status !== statusFilter) return false;
      return true;
    });
  }, [users, query, roleFilter, statusFilter]);

  useEffect(() => setPage(1), [query, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageUsers = filtered.slice(pageStart, pageStart + PAGE_SIZE);
  const hasFilters = Boolean(query || roleFilter || statusFilter);

  const closeModal = useCallback(() => setModal(null), []);

  /* ----- actions: modals throw on failure so they can show the error ----- */
  const handleCreate = async (payload) => {
    await userService.create(payload);
    closeModal();
    notify("success", "User created.");
    await loadUsers();
  };

  const handleUpdate = async (payload) => {
    await userService.update(modal.user.id, payload);
    closeModal();
    notify("success", "User updated.");
    await loadUsers();
  };

  const handleAssignRole = async (roleId) => {
    await userService.assignRole(modal.user.id, roleId);
    closeModal();
    notify("success", "Role updated.");
    await loadUsers();
  };

  const handleDelete = async () => {
    await userService.remove(modal.user.id);
    closeModal();
    notify("success", "User deleted.");
    await loadUsers();
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
              Users
            </h1>
            <p className="mt-1 text-[15px] text-slate-600">
              {loading
                ? "Loading accounts…"
                : `${users.length} ${users.length === 1 ? "account" : "accounts"} in the system`}
            </p>
          </div>

          {/* User create */}
          {can("user.create") && (
            <button
              type="button"
              onClick={() => setModal({ type: "create" })}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 active:scale-[.98]"
            >
              <Icon name="plus" /> Add user
            </button>
          )}
        </div>

        {/* toolbar */}
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by username or email"
              aria-label="Search users"
              className={`${controlClass} w-full pl-9`}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            aria-label="Filter by role"
            className={controlClass}
          >
            <option value="">All roles</option>
            {roles.map((role) => (
              <option key={role.id} value={String(role.id)}>
                {role.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by status"
            className={controlClass}
          >
            <option value="">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {loadError && (
          <div
            role="alert"
            className="mt-6 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <span>{loadError}</span>
            <button
              type="button"
              onClick={loadUsers}
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
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading &&
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-100" />
                          <div className="space-y-2">
                            <div className="h-3 w-28 rounded bg-slate-100" />
                            <div className="h-3 w-40 rounded bg-slate-100" />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-5 w-16 rounded-full bg-slate-100" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-5 w-20 rounded-full bg-slate-100" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="ml-auto h-8 w-28 rounded bg-slate-100" />
                      </td>
                    </tr>
                  ))}

                {!loading &&
                  pageUsers.map((user) => {
                    const roleName = getRoleName(user, roles);
                    const isActive =
                      String(user.account_status).toLowerCase() === "active";
                    const isSelf =
                      currentUserId != null && user.id === currentUserId;
                    return (
                      <tr
                        key={user.id}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${AVATARS[user.id % AVATARS.length]}`}
                            >
                              {initials(user)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-slate-900">
                                {user.username}
                                {isSelf && (
                                  <span className="ml-2 text-xs font-normal text-slate-400">
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="truncate text-slate-500">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${roleBadgeClass(roleName)}`}
                          >
                            {roleName}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`}
                            />
                            {user.account_status ?? "unknown"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex justify-end gap-1">
                            {can("user.update") && (
                              <button
                                type="button"
                                onClick={() => setModal({ type: "edit", user })}
                                aria-label={`Edit ${user.username}`}
                                title="Edit"
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                              >
                                <Icon name="edit" />
                              </button>
                            )}
                            {can("user.assign_role") && (
                              <button
                                type="button"
                                onClick={() => setModal({ type: "role", user })}
                                aria-label={`Change role for ${user.username}`}
                                title="Change role"
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                              >
                                <Icon name="shield" />
                              </button>
                            )}
                            {can("user.delete") && (
                              <button
                                type="button"
                                onClick={() =>
                                  setModal({ type: "delete", user })
                                }
                                disabled={isSelf}
                                aria-label={`Delete ${user.username}`}
                                title={
                                  isSelf
                                    ? "You cannot delete your own account"
                                    : "Delete"
                                }
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500"
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

          {!loading && !loadError && pageUsers.length === 0 && (
            <div className="px-6 py-14 text-center">
              <p className="font-semibold text-slate-900">
                {hasFilters ? "No users match your filters" : "No users yet"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {hasFilters
                  ? "Try a different search or clear the filters."
                  : "Add the first account to get started."}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (hasFilters) {
                    setQuery("");
                    setRoleFilter("");
                    setStatusFilter("");
                  } else {
                    setModal({ type: "create" });
                  }
                }}
                className="mt-5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300/50"
              >
                {hasFilters ? "Clear filters" : "Add user"}
              </button>
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
      {modal?.type === "create" && (
        <UserFormModal
          mode="create"
          roles={roles}
          onSubmit={handleCreate}
          onClose={closeModal}
        />
      )}
      {modal?.type === "edit" && (
        <UserFormModal
          mode="edit"
          user={modal.user}
          roles={roles}
          onSubmit={handleUpdate}
          onClose={closeModal}
        />
      )}
      {modal?.type === "role" && (
        <RoleModal
          user={modal.user}
          roles={roles}
          onSubmit={handleAssignRole}
          onClose={closeModal}
        />
      )}
      {modal?.type === "delete" && (
        <DeleteModal
          user={modal.user}
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
