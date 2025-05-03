import { Platform } from 'react-native';
import { useAuthStore } from '../store/auth-store';
import { getAuthToken } from '../firebaseConfig';

interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
}

const API_URL = Platform.OS === 'web' 
  ? process.env.NEXT_PUBLIC_API_URL 
  : process.env.EXPO_PUBLIC_API_URL;

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = {
  fetch: async (endpoint: string, options: ApiOptions = {}) => {
    const { requiresAuth = true, ...fetchOptions } = options;
    
    // Prepare headers
    const headers = new Headers(fetchOptions.headers);
    headers.set('Content-Type', 'application/json');
    
    // Add auth token if required
    if (requiresAuth) {
      const token = await getAuthToken();
      if (!token) {
        throw new ApiError(401, 'Authentication required');
      }
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Add platform identifier
    headers.set('X-Platform', Platform.OS);

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
        credentials: 'omit', // Don't send cookies
        mode: 'cors', // Enable CORS
      });

      // Handle token expiration
      if (response.status === 401) {
        // Try to refresh token
        const newToken = await useAuthStore.getState().refreshToken();
        if (newToken) {
          // Retry the request with new token
          headers.set('Authorization', `Bearer ${newToken}`);
          const retryResponse = await fetch(`${API_URL}${endpoint}`, {
            ...fetchOptions,
            headers,
            credentials: 'omit',
            mode: 'cors',
          });
          
          if (!retryResponse.ok) {
            throw new ApiError(retryResponse.status, 'Request failed after token refresh');
          }
          
          return retryResponse.json();
        } else {
          // Token refresh failed, user needs to re-authenticate
          await useAuthStore.getState().logout();
          throw new ApiError(401, 'Session expired');
        }
      }

      if (!response.ok) {
        throw new ApiError(response.status, await response.text());
      }

      return response.json();
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        throw error;
      }
      // Handle different error types
      if (error instanceof TypeError) {
        throw new ApiError(500, error.message || 'Network request failed');
      }
      if (error instanceof Error) {
        throw new ApiError(500, error.message || 'Request failed');
      }
      // Handle unknown error types
      throw new ApiError(500, 'An unexpected error occurred');
    }
  },

  get: (endpoint: string, options: ApiOptions = {}) => {
    return api.fetch(endpoint, { ...options, method: 'GET' });
  },

  post: (endpoint: string, data: any, options: ApiOptions = {}) => {
    return api.fetch(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put: (endpoint: string, data: any, options: ApiOptions = {}) => {
    return api.fetch(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: (endpoint: string, options: ApiOptions = {}) => {
    return api.fetch(endpoint, { ...options, method: 'DELETE' });
  },
};

// Request interceptor for automatic token refresh
export const createRequestInterceptor = () => {
  let isRefreshing = false;
  let failedQueue: any[] = [];

  const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  return async (error: ApiError) => {
    if (error.status === 401 && !isRefreshing) {
      isRefreshing = true;

      try {
        const token = await useAuthStore.getState().refreshToken();
        processQueue(null, token);
        return token;
      } catch (refreshError) {
        processQueue(refreshError as Error);
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }

    throw error;
  };
};