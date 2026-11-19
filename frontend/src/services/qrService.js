import { apiRequest } from './api';

export const qrService = {
  getAll: async () => {
    return apiRequest('/qr');
  },

  getByCode: async (code) => {
    return apiRequest(`/qr/${encodeURIComponent(code)}`);
  },

  create: async (qrData) => {
    return apiRequest('/qr/admin', {
      method: 'POST',
      body: JSON.stringify(qrData),
    });
  },
};
