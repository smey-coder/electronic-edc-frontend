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

export const permissionService = {
  // GET /permissions/?skip=0&limit=100 (Admin only + permission.read)
  list: async ({ skip = 0, limit = 100 } = {}) => 
    unwrap(await api.get('/permissions/', { params: { skip, limit } })),

  // GET /permissions/{perm_id} (Admin only + permission.read)
  get: async (id) => 
    unwrap(await api.get(`/permissions/${id}`)),

  // POST /permissions/ (Admin only + permission.create)
  // Payload: { name, description }
  create: async (payload) => 
    unwrap(await api.post('/permissions/', payload)),

  // PUT /permissions/{perm_id} (Admin only + permission.update)
  // Payload: { name, description }
  update: async (id, payload) => 
    unwrap(await api.put(`/permissions/${id}`, payload)),

  // DELETE /permissions/{perm_id} (Admin only + permission.delete)
  remove: async (id) => 
    unwrap(await api.delete(`/permissions/${id}`)),
};

export default permissionService;