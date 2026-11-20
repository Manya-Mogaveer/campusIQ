/**
 * Centralized API Client for CampusIQ
 * Connects to deployed FastAPI backend with automatic URL normalization,
 * JWT authentication injection, and comprehensive error handling.
 */

const rawBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

// Ensure the base URL resolves to the backend /api namespace
export const API_BASE_URL = rawBase
  ? rawBase.endsWith('/api')
    ? rawBase
    : `${rawBase}/api`
  : '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('campusiq_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Normalize endpoint to prevent double /api/api if passed with or without /api prefix
  let normalizedEndpoint = endpoint;
  if (!endpoint.startsWith('http')) {
    if (endpoint.startsWith('/api/')) {
      normalizedEndpoint = endpoint.slice(4); // Remove leading /api
    } else if (endpoint === '/api') {
      normalizedEndpoint = '';
    }
  }

  const url = normalizedEndpoint.startsWith('http')
    ? normalizedEndpoint
    : `${API_BASE_URL}${normalizedEndpoint.startsWith('/') ? '' : '/'}${normalizedEndpoint}`;

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (networkErr) {
    console.error(`[CampusIQ API] Network error contacting ${url}:`, networkErr);
    const err = new Error(
      `Unable to reach backend server (${networkErr.message || 'Network disconnected'}). Please check your internet connection.`
    );
    err.isNetworkError = true;
    throw err;
  }

  // 204 No Content
  if (response.status === 204) {
    return null;
  }

  // Handle unauthorized / expired token
  if (response.status === 401) {
    // If not a login request, clear stale token
    if (!endpoint.includes('/auth/login')) {
      localStorage.removeItem('campusiq_token');
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg =
      data?.detail ||
      (typeof data?.message === 'string' ? data.message : null) ||
      response.statusText ||
      `Request failed with status ${response.status}`;
    
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export default apiRequest;
