import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import AccessDenied from '../components/common/AccessDenied';
import { getRole, hasPermission, hasRole, roleHome } from '../utils/access';

function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50" role="status" aria-label="Loading">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
    </div>
  );
}

/**
 * Guards a group of routes. Checks, in order:
 *   1. signed in            → otherwise go to /login
 *   2. role (allowedRoles)  → wrong role goes to its own dashboard
 *   3. permissions          → missing permission shows "You don't have access"
 *
 * <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
 *   <Route element={<ProtectedRoute permissions="user.read" />}> ... </Route>
 * </Route>
 */
export default function ProtectedRoute({ allowedRoles, permissions, requireAll = false, children }) {
  const auth = useAuth();
  const location = useLocation();

  const checking = auth?.loading ?? auth?.isLoading ?? false;
  const authenticated = auth?.isAuthenticated ?? Boolean(auth?.user);

  if (checking) return <FullPageSpinner />;

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!hasRole(auth, allowedRoles)) {
    const home = roleHome(getRole(auth));
    // Known role in the wrong area → send it to its own dashboard.
    // Unknown role → show a message instead of redirecting (avoids a redirect loop).
    return home ? <Navigate to={home} replace /> : <AccessDenied />;
  }

  if (!hasPermission(auth, permissions, requireAll)) {
    return <AccessDenied required={permissions} />;
  }

  return children ?? <Outlet />;
}

/** Used for "/" and unknown URLs: signed-in users go to their dashboard, everyone else to /login. */
export function HomeRedirect() {
  const auth = useAuth();
  const checking = auth?.loading ?? auth?.isLoading ?? false;
  const authenticated = auth?.isAuthenticated ?? Boolean(auth?.user);

  if (checking) return <FullPageSpinner />;

  const home = authenticated ? roleHome(getRole(auth)) : null;
  return <Navigate to={home ?? '/login'} replace />;
}