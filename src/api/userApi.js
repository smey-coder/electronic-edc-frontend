import api from './axios';

// Change these to match the values your backend accepts for `account_status`.
export const ACCOUNT_STATUSES = ['active', 'inactive'];

const unwrap = (response) => response?.data ?? response;

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const detail = error?.response?.data?.detail;
  return (
    (Array.isArray(detail) ? detail.map((item) => item.msg).join(', ') : detail) ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export const userService = {
  // GET /users/?skip=&limit=   (limit max is 500)
  list: async ({ skip = 0, limit = 500 } = {}) =>
    unwrap(await api.get('/users/', { params: { skip, limit } })),

  // GET /users/{id}
  get: async (id) => unwrap(await api.get(`/users/${id}`)),

  // POST /users/
  create: async (payload) => unwrap(await api.post('/users/', payload)),

  // PUT /users/{id}   { username?, email?, account_status? }
  update: async (id, payload) => unwrap(await api.put(`/users/${id}`, payload)),

  // PUT /users/{id}/role   { role_id }
  assignRole: async (id, roleId) => unwrap(await api.put(`/users/${id}/role`, { role_id: roleId })),

  // DELETE /users/{id}
  remove: async (id) => unwrap(await api.delete(`/users/${id}`)),
};

// Your backend sample did not include a roles endpoint.
// Adjust the path (or delete this) to match your API. The page falls back
// to the roles found on the loaded users if this request fails.
export const roleService = {
  list: async () => unwrap(await api.get('/roles/')),
};