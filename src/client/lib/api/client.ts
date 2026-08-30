import { supabase } from '../auth';

const API_URL = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_APP_URL || '');

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    hasMore?: boolean;
  };
}

async function getAuthHeaders(): Promise<HeadersInit> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return {
        'Authorization': `Bearer ${session.access_token}`,
      };
    }
  } catch (e) {
    // No session, continue without auth
  }
  return {};
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    let errorCode: string | undefined;

    if (isJson) {
      try {
        const data = await response.json();
        errorMessage = data.message || (typeof data.error === 'string' ? data.error : data.error?.message) || errorMessage;
        errorCode = data.code || data.error?.code;
      } catch {
        // If JSON parsing fails, use default error message
      }
    }

    throw new ApiError(errorMessage, response.status, errorCode);
  }

  if (isJson) {
    return response.json();
  }

  throw new Error('Unsupported response format');
}

export async function get<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const authHeaders = await getAuthHeaders();
  const response = await fetch(url, {
    ...options,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
    credentials: 'include',
  });

  return handleResponse<T>(response);
}

export async function post<T>(
  endpoint: string,
  data?: unknown,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const authHeaders = await getAuthHeaders();
  const response = await fetch(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
    credentials: 'include',
    body: data ? JSON.stringify(data) : undefined,
  });

  return handleResponse<T>(response);
}

export async function put<T>(
  endpoint: string,
  data?: unknown,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const authHeaders = await getAuthHeaders();
  const response = await fetch(url, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
    credentials: 'include',
    body: data ? JSON.stringify(data) : undefined,
  });

  return handleResponse<T>(response);
}

export async function patch<T>(
  endpoint: string,
  data?: unknown,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const authHeaders = await getAuthHeaders();
  const response = await fetch(url, {
    ...options,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
    credentials: 'include',
    body: data ? JSON.stringify(data) : undefined,
  });

  return handleResponse<T>(response);
}

export async function del<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const authHeaders = await getAuthHeaders();
  const response = await fetch(url, {
    ...options,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
    credentials: 'include',
  });

  return handleResponse<T>(response);
}

export const fetcher = {
  get,
  post,
  put,
  patch,
  del,
};