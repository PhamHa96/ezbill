const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      // Attempt to parse JSON response whether it's an error or not.
      // Sometimes APIs return `{ message: "Bad request" }` on 400.
      let data: any;
      try {
        data = await response.json();
      } catch (parseErr) {
        data = null;
      }

      if (!response.ok) {
        const errorMessage = data?.message || data?.error || `HTTP ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }
      
      return data as T;
    } catch (error) {
      console.error(`[ApiService] Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  async post<T>(endpoint: string, data?: any, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  async put<T>(endpoint: string, data?: any, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  async delete<T>(endpoint: string, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

export const apiService = new ApiService();
