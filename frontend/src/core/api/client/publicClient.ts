import axios from "axios";
import type { ApiResponse } from "@/core/types/api";

const publicClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,  // needed for refresh cookie
});

// Unwrap ApiResponse<T>.data automatically
publicClient.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse<unknown>;
    return body.data !== undefined ? { ...response, data: body.data } : response;
  },
  (error) => {
    const message = error.response?.data?.message ?? error.message ?? "Unexpected error";
    return Promise.reject({ ...error.response?.data, message, status: error.response?.status ?? 0 });
  }
);

export function publicPost<T>(url: string, data?: unknown, config?: object): Promise<T> {
  return publicClient.post<T>(url, data, config).then((r) => r.data as T);
}

export function publicGet<T>(url: string, config?: object): Promise<T> {
  return publicClient.get<T>(url, config).then((r) => r.data as T);
}

export default publicClient;
