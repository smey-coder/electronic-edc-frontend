import api from './axios';

const unwrap = (response) => response?.data ?? response;

export function getErrorMessage(error, fallback = 'Something went wrong.') {
  const detail = error?.response?.data?.detail;
  return (
    (Array.isArray(detail) ? detail.map((item) => item.msg).join(', ') : detail) ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export const formulaService = {
  // Categories
  getCategories: async () => unwrap(await api.get('/formulas/categories')),
  createCategory: async (payload) => unwrap(await api.post('/formulas/categories', payload)),
  updateCategory: async (id, payload) => unwrap(await api.put(`/formulas/categories/${id}`, payload)),
  deleteCategory: async (id) => unwrap(await api.delete(`/formulas/categories/${id}`)),

  // Formulas
  listFormulas: async (params = {}) => unwrap(await api.get('/formulas', { params })),
  getFormula: async (id) => unwrap(await api.get(`/formulas/${id}`)),
  createFormula: async (payload) => unwrap(await api.post('/formulas', payload)),
  updateFormula: async (id, payload) => unwrap(await api.put(`/formulas/${id}`, payload)),
  deleteFormula: async (id) => unwrap(await api.delete(`/formulas/${id}`)),

  // Calculate
  calculate: async (id, variables) => unwrap(await api.post(`/formulas/${id}/calculate`, { variables })),
};

export default formulaService;