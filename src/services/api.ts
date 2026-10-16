import axios, { AxiosError } from 'axios';
import { ApiResponse } from '../types/task';

// Configure base URL from env or fallback to relative /api for unified dev/prod
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to normalize error responses
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    // If backend provided a structured error response
    if (error.response?.data) {
      const serverError = error.response.data;
      const message = serverError.message || 'An unexpected error occurred';
      const formattedError = new Error(message) as Error & {
        status?: number;
        errors?: Array<{ field?: string; message: string }>;
      };
      formattedError.status = error.response.status;
      formattedError.errors = serverError.errors;
      return Promise.reject(formattedError);
    }

    // Network or server unreachable error
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. Please check your connection.'));
    }

    return Promise.reject(
      new Error(error.message || 'Unable to connect to the server. Please verify backend is running.')
    );
  }
);
