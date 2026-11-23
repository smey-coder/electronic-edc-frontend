import { useMemo } from 'react';
import useAuth from './useAuth';
import { getRole, hasPermission, hasRole } from '../utils/access';

/**
 * const { can, canAll, isRole, role } = usePermission();
 * can('user.delete')                 // has this permission
 * can(['user.update', 'user.read'])  // has any of them
 * canAll(['user.update', 'user.read'])
 * isRole('Admin')                    // or isRole(['Admin', 'Teacher'])
 */
export default function usePermission() {
  const auth = useAuth();

  return useMemo(
    () => ({
      role: getRole(auth),
      can: (permission) => hasPermission(auth, permission, false),
      canAll: (permissions) => hasPermission(auth, permissions, true),
      isRole: (roles) => hasRole(auth, roles),
    }),
    [auth],
  );
}