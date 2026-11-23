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

export const licenseService = {
  // GET /license-keys/?skip=0&limit=100 (Admin only + license.read)
  list: async ({ skip = 0, limit = 100 } = {}) => 
    unwrap(await api.get('/license-keys/', { params: { skip, limit } })),

  // GET /license-keys/{key_id} (Admin only + license.read)
  get: async (id) => 
    unwrap(await api.get(`/license-keys/${id}`)),

  // POST /license-keys/ (Admin only + license.create)
  // Payload: { max_uses, expires_at, description, etc. }
  create: async (payload) => 
    unwrap(await api.post('/license-keys/', payload)),

  // PUT /license-keys/{key_id} (Admin only + license.update)
  update: async (id, payload) => 
    unwrap(await api.put(`/license-keys/${id}`, payload)),

  // PUT /license-keys/{key_id}/revoke (Admin only + license.revoke)
  revoke: async (id) => 
    unwrap(await api.put(`/license-keys/${id}/revoke`)),

  // DELETE /license-keys/{key_id} (Admin only + license.delete)
  remove: async (id) => 
    unwrap(await api.delete(`/license-keys/${id}`)),
};

export default licenseService;