import api from './axios';

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

export const roleService = {
  // GET /roles/?skip=0&limit=100 (Admin only + role.read)
  list: async ({ skip = 0, limit = 100 } = {}) => 
    unwrap(await api.get('/roles/', { params: { skip, limit } })),

  // GET /roles/{role_id} (Admin only + role.read)
  get: async (id) => 
    unwrap(await api.get(`/roles/${id}`)),

  // POST /roles/ (Admin only + role.create)
  // Payload: { name, description, permission_ids, etc. }
  create: async (payload) => 
    unwrap(await api.post('/roles/', payload)),

  // PUT /roles/{role_id} (Admin only + role.update)
  // Payload: { name, description, permission_ids, etc. }
  update: async (id, payload) => 
    unwrap(await api.put(`/roles/${id}`, payload)),

  // DELETE /roles/{role_id} (Admin only + role.delete)
  remove: async (id) => 
    unwrap(await api.delete(`/roles/${id}`)),
};

export default roleService;