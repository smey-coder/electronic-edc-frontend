import api from './axios';

export const settingsService = {
  getProfile: () => api.get('/me/profile').then((r) => r.data),
  updateProfile: (data) => api.put('/me/profile', data).then((r) => r.data),
  changePassword: (data) => api.post('/me/password', data).then((r) => r.data),
};