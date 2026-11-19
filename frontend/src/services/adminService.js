import { apiRequest } from './api';

export const adminService = {
  getAnalytics: async () => {
    return apiRequest('/admin/analytics');
  },

  createLocation: async (locationData) => {
    return apiRequest('/admin/locations', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  },

  updateLocation: async (id, locationData) => {
    return apiRequest(`/admin/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(locationData),
    });
  },

  deleteLocation: async (id) => {
    return apiRequest(`/admin/locations/${id}`, {
      method: 'DELETE',
    });
  },

  createBuilding: async (buildingData) => {
    return apiRequest('/admin/buildings', {
      method: 'POST',
      body: JSON.stringify(buildingData),
    });
  },

  updateBuilding: async (id, buildingData) => {
    return apiRequest(`/admin/buildings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(buildingData),
    });
  },

  blockPathway: async (pathId, reason = '') => {
    return apiRequest(`/admin/paths/${pathId}/block?reason=${encodeURIComponent(reason)}`, {
      method: 'PATCH',
    });
  },

  reopenPathway: async (pathId) => {
    return apiRequest(`/admin/paths/${pathId}/reopen`, {
      method: 'PATCH',
    });
  },
};
