import { apiRequest } from './api';

export const locationService = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.accessible_only) query.append('accessible_only', 'true');
    if (params.building_id) query.append('building_id', params.building_id);
    
    const qs = query.toString();
    return apiRequest(`/locations${qs ? `?${qs}` : ''}`);
  },

  getCategories: async () => {
    return apiRequest('/locations/categories');
  },

  getById: async (id) => {
    return apiRequest(`/locations/${id}`);
  },
};
