// Utility for making authenticated super admin API requests

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const makeSuperAdminRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('super_admin_token');
  const accessKey = localStorage.getItem('super_admin_access_key');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (accessKey) {
    headers['X-Super-Admin-Key'] = accessKey;
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
};

export const superAdminGet = (endpoint: string) => {
  return makeSuperAdminRequest(endpoint, { method: 'GET' });
};

export const superAdminPost = (endpoint: string, data: any) => {
  return makeSuperAdminRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const superAdminDelete = (endpoint: string) => {
  return makeSuperAdminRequest(endpoint, { method: 'DELETE' });
};