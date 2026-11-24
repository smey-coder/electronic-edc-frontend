import api from './axios';

/** Turns an API error into text. For 422 errors it names the field, e.g. "user_id: Field required". */
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const detail = error?.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        const field = Array.isArray(item.loc) ? item.loc.filter((part) => part !== 'body').join('.') : '';
        return field ? `${field}: ${item.msg}` : item.msg;
      })
      .join(', ');
  }
  if (detail && typeof detail !== 'string') return JSON.stringify(detail);
  return detail || error?.response?.data?.message || error?.message || fallback;
}

const unwrap = (response) => response?.data ?? response;

const PAGE = 500; // the API allows at most 500 rows per request

export const studentService = {
  // GET /students/?skip=&limit=   (Admin, Teacher + student.read)
  list: async ({ skip = 0, limit = PAGE } = {}) =>
    unwrap(await api.get('/students/', { params: { skip, limit } })),

  // Reads every page until there are no more students.
  listAll: async () => {
    const all = [];
    for (let page = 0; page < 20; page += 1) {
      const chunk = await studentService.list({ skip: page * PAGE, limit: PAGE });
      const rows = Array.isArray(chunk) ? chunk : [];
      all.push(...rows);
      if (rows.length < PAGE) break;
    }
    return all;
  },

  // GET /students/{id}
  get: async (id) => unwrap(await api.get(`/students/${id}`)),

  // POST /students/   (student.create)
  create: async (payload) => unwrap(await api.post('/students/', payload)),

  // PUT /students/{id}   (student.update)
  update: async (id, payload) => unwrap(await api.put(`/students/${id}`, payload)),

  // DELETE /students/{id}   (student.delete)
  remove: async (id) => unwrap(await api.delete(`/students/${id}`)),

  // POST /students/import-excel   (student.import), multipart form with the field "file"
  importExcel: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return unwrap(
      await api.post('/students/import-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100));
        },
      }),
    );
  },
};

export default studentService;