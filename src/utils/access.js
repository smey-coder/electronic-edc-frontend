// Where each role lands after login. Matches LoginPage: `/${role.toLowerCase()}/dashboard`.
export const ROLE_HOME = {
  admin: '/admin/dashboard',
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
};

const nameOf = (item) => (typeof item === 'string' ? item : item?.name ?? item?.code ?? item?.permission ?? '');
const normRole = (value) => String(value ?? '').trim().toLowerCase();
// "user:create" and "user.create" are treated as the same permission.
const normPermission = (value) => String(value ?? '').trim().toLowerCase().replace(/:/g, '.');

/** Role name from the auth context, e.g. "Admin", or null. */
export function getRole(auth) {
  const user = auth?.user;
  const raw = user?.role ?? auth?.role ?? user?.roles?.[0] ?? auth?.roles?.[0];
  return nameOf(raw) || null;
}

/** Every permission list the auth context might carry (only the ones that are arrays). */
function permissionLists(auth) {
  const user = auth?.user;
  return [
    auth?.permissions,
    user?.permissions,
    user?.role?.permissions,
    ...(Array.isArray(user?.roles) ? user.roles.map((role) => role?.permissions) : []),
  ].filter(Array.isArray);
}

/** True when the backend actually sent a permissions list to the browser. */
export function hasPermissionData(auth) {
  return permissionLists(auth).length > 0;
}

/** Set of normalized permission names from the auth context. */
export function getPermissions(auth) {
  return new Set(
    permissionLists(auth)
      .flat()
      .map((item) => normPermission(nameOf(item)))
      .filter(Boolean),
  );
}

export function roleHome(role) {
  return ROLE_HOME[normRole(role)] ?? null;
}

export function hasRole(auth, allowedRoles) {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  const role = normRole(getRole(auth));
  return [].concat(allowedRoles).some((allowed) => normRole(allowed) === role);
}

/**
 * requireAll=false → at least one of the permissions; true → all of them.
 *
 * If the backend does not send a permissions list at all, the browser cannot know,
 * so the check is skipped (returns true). The API still enforces every permission
 * and answers 403 when it is missing. Once /auth/me returns `permissions`,
 * the check is enforced here too (an empty list means "no permissions").
 */
export function hasPermission(auth, required, requireAll = false) {
  const list = [].concat(required ?? []).filter(Boolean);
  if (list.length === 0) return true;
  if (!hasPermissionData(auth)) return true;

  const owned = getPermissions(auth);
  const check = (permission) => owned.has(normPermission(permission));
  return requireAll ? list.every(check) : list.some(check);
}