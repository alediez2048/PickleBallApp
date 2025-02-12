import axios from 'axios';
import { API_BASE_URL } from '@/config/env';
import { validateApiError } from '@/schemas/api';
import { z } from 'zod';

export const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await client.post('/auth/refresh', { refreshToken });
        const { token } = response.data;
        
        localStorage.setItem('auth_token', token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        return client(originalRequest);
      } catch (refreshError) {
        // Handle refresh token failure (e.g., logout user)
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export class ApiError extends Error {
  constructor(
    public code: number,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
  schema?: z.ZodType<any>;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async getAuthToken(): Promise<string | null> {
    return localStorage.getItem('auth_token');
  }

  private createUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(endpoint, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }

  private async handleResponse<T>(response: Response, schema?: z.ZodType<T>): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorResult = validateApiError(data);
      if (errorResult.success) {
        throw new ApiError(
          errorResult.data.code,
          errorResult.data.message,
          errorResult.data.details
        );
      }
      throw new ApiError(response.status, 'Unknown error occurred');
    }

    if (schema) {
      const result = schema.safeParse(data);
      if (!result.success) {
        console.error('Response validation error:', result.error);
        throw new ApiError(500, 'Invalid response format');
      }
      return result.data;
    }

    return data;
  }

  private async request<T>(
    endpoint: string,
    { params, schema, ...config }: RequestConfig = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    const url = this.createUrl(endpoint, params);

    const headers = new Headers(config.headers);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (!headers.has('Content-Type') && config.method !== 'GET') {
      headers.set('Content-Type', 'application/json');
    }

    try {
      const response = await fetch(url, {
        ...config,
        headers,
      });

      return this.handleResponse<T>(response, schema);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Network error:', error);
      throw new ApiError(0, 'Network error occurred');
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

export const api = new ApiClient(); 