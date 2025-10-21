import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL && import.meta.env.PROD) {
  throw new Error(
    'VITE_API_URL is not defined. Please set it in your Vercel environment variables.'
  );
}

/**
 * A hook for making API requests. It automatically adds the
 * Authorization header if the user is authenticated.
 */
export const usePlayerApi = () => {
  const { token, userId } = useAuth();

  const apiFetch = useCallback(
    async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
      const headers = new Headers(options.headers || {});
      headers.set('Content-Type', 'application/json');

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `Request failed with status ${response.status}`,
        }));
        throw new Error(errorData.error || 'An unknown API error occurred');
      }

      // Handle responses with no content (e.g., DELETE 204)
      if (response.status === 204) return null as T;

      return response.json() as Promise<T>;
    },
    [token]
  );

  return { apiFetch, userId };
};