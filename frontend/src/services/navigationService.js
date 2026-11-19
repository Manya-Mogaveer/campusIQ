import { apiRequest } from './api';

export const navigationService = {
  getNodes: async () => {
    return apiRequest('/navigation/nodes');
  },

  getEdges: async () => {
    return apiRequest('/navigation/edges');
  },

  calculateRoute: async (routeParams) => {
    return apiRequest('/navigation/route', {
      method: 'POST',
      body: JSON.stringify(routeParams),
    });
  },

  getAlternatives: async (routeParams) => {
    return apiRequest('/navigation/alternatives', {
      method: 'POST',
      body: JSON.stringify(routeParams),
    });
  },

  resolveNearestNode: async (lat, lng) => {
    return apiRequest(`/navigation/nearest-node?lat=${lat}&lng=${lng}`);
  },
};
