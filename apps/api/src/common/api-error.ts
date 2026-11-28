import { HttpException, HttpStatus } from "@nestjs/common";
import type { ApiError, ApiErrorCode } from "@storedesk/shared";

const STATUS_TEXT: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  409: "Conflict",
  423: "Locked",
  429: "Too Many Requests",
};

/** HttpException whose body has the shared ApiError shape (stable `code` for the web). */
export function apiError(statusCode: HttpStatus, code: ApiErrorCode, message: string, extra: Partial<ApiError> = {}) {
  const body: ApiError = { statusCode, error: STATUS_TEXT[statusCode] ?? "Error", code, message, ...extra };
  return new HttpException(body, statusCode);
}
