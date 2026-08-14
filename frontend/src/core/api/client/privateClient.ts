import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import type { ApiResponse } from "@/core/types/api";
import { tokenStorage } from "@/core/auth/tokenStorage";
import { AUTH_ENDPOINTS } from "@/core/api/endpoints";

const privateClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Request: attach access token
privateClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: unwrap data + handle 401 with silent refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

privateClient.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse<unknown>;
    return body.data !== undefined ? { ...response, data: body.data } : response;
  },
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${token}` };
              resolve(privateClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post<{ accessToken: string; expiresIn: number }>(
          `/api${AUTH_ENDPOINTS.REFRESH}`,
          {},
          { withCredentials: true }
        );
        // /auth/refresh returns AuthResponse directly (not wrapped in ApiResponse)
        const newToken = response.data.accessToken;
        tokenStorage.setAccessToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${newToken}` };
        return privateClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStorage.clearAccessToken();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const message = error.response?.data?.message ?? error.message ?? "Unexpected error";
    return Promise.reject({ ...error.response?.data, message, status: error.response?.status ?? 0 });
  }
);

export function privateGet<T>(url: string, config?: object): Promise<T> {
  return privateClient.get<T>(url, config).then((r) => r.data as T);
}

export function privatePost<T>(url: string, data?: unknown, config?: object): Promise<T> {
  return privateClient.post<T>(url, data, config).then((r) => r.data as T);
}

export function privatePut<T>(url: string, data?: unknown, config?: object): Promise<T> {
  return privateClient.put<T>(url, data, config).then((r) => r.data as T);
}

export function privateDelete<T>(url: string, config?: object): Promise<T> {
  return privateClient.delete<T>(url, config).then((r) => r.data as T);
}

export function privatePatch<T>(url: string, data?: unknown, config?: object): Promise<T> {
  return privateClient.patch<T>(url, data, config).then((r) => r.data as T);
}

export default privateClient;
