import { apiRequest } from './api';

export const facilityService = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    const qs = query.toString();
    return apiRequest(`/facilities${qs ? `?${qs}` : ''}`);
  },

  getById: async (id) => {
    return apiRequest(`/facilities/${id}`);
  },

  updateStatus: async (id, statusData) => {
    return apiRequest(`/facilities/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
    });
  },
};
