import type { ApiError } from "@/core/types/api";

export function parseApiError(error: unknown): ApiError {
  if (error && typeof error === "object" && "status" in error) {
    return error as ApiError;
  }
  return {
    status: 0,
    code: "NETWORK_ERROR",
    message: "Không thể kết nối đến máy chủ",
    isNetworkError: true,
  };
}

export function getErrorMessage(error: unknown): string {
  return parseApiError(error).message;
}
