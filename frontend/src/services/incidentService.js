import { apiRequest } from './api';

export const incidentService = {
  submit: async (incidentData) => {
    return apiRequest('/incidents', {
      method: 'POST',
      body: JSON.stringify(incidentData),
    });
  },

  getPublic: async (statusFilter = null) => {
    const qs = statusFilter ? `?status_filter=${statusFilter}` : '';
    return apiRequest(`/incidents${qs}`);
  },

  getAdminAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status_filter', params.status);
    if (params.category && params.category !== 'all') query.append('category_filter', params.category);
    const qs = query.toString();
    return apiRequest(`/incidents/admin/all${qs ? `?${qs}` : ''}`);
  },

  triage: async (incidentId, triageData) => {
    return apiRequest(`/incidents/admin/${incidentId}`, {
      method: 'PATCH',
      body: JSON.stringify(triageData),
    });
  },
};
