import api from './axios';

export { getErrorMessage } from './formulaApi';

const unwrap = (response) => response?.data ?? response;

// Note: these routes have no trailing slash (the backend uses @router.get("")).
const base = (formulaId) => `/formulas/${formulaId}/variables`;

export const formulaVariableService = {
  // GET /formulas/{formula_id}/variables   (Admin, Teacher + formula_variable.read)
  list: async (formulaId) => unwrap(await api.get(base(formulaId))),

  // GET /formulas/{formula_id}/variables/{variable_id}
  get: async (formulaId, variableId) => unwrap(await api.get(`${base(formulaId)}/${variableId}`)),

  // POST /formulas/{formula_id}/variables   (formula_variable.create)
  // payload: { variable_name, display_name?, unit? }
  create: async (formulaId, payload) => unwrap(await api.post(base(formulaId), payload)),

  // PUT /formulas/{formula_id}/variables/{variable_id}   (formula_variable.update)
  update: async (formulaId, variableId, payload) =>
    unwrap(await api.put(`${base(formulaId)}/${variableId}`, payload)),

  // DELETE /formulas/{formula_id}/variables/{variable_id}   (formula_variable.delete) → 204
  remove: async (formulaId, variableId) => unwrap(await api.delete(`${base(formulaId)}/${variableId}`)),

  // PUT /formulas/{formula_id}/variables/bulk   (formula_variable.replace)
  // Replaces ALL variables of the formula. payload: { variables: [...] }
  replaceAll: async (formulaId, variables) =>
    unwrap(await api.put(`${base(formulaId)}/bulk`, { variables })),
};

export default formulaVariableService;