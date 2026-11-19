import { apiRequest } from './api';

export const buildingService = {
  getAll: async () => {
    return apiRequest('/buildings');
  },

  getById: async (id) => {
    return apiRequest(`/buildings/${id}`);
  },

  getFloors: async (buildingId) => {
    return apiRequest(`/indoor/buildings/${buildingId}/floors`);
  },
};
