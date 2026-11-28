// Stable error codes in API error bodies. The web switches on `code`, never on `message`.
// Today only auth/permission errors carry a code; other Nest errors (400/404/500) do not yet.
export const API_ERROR_CODES = [
  "UNAUTHENTICATED",
  "PERMISSION_DENIED",
  "ROUTE_NOT_GUARDED",
  "VALIDATION_FAILED",
  "INVALID_CREDENTIALS",
  "ACCOUNT_LOCKED",
  "ACCOUNT_DISABLED",
  "NO_STORE_ACCESS",
  "SESSION_EXPIRED",
  "TOO_MANY_ATTEMPTS",
  "REFRESH_RACE",
] as const;
export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export interface ApiError {
  statusCode: number;
  error: string;
  code: ApiErrorCode;
  message: string;
  /** Set when code is PERMISSION_DENIED. */
  permission?: string;
  /** Set when code is ACCOUNT_LOCKED or TOO_MANY_ATTEMPTS. */
  retryAfterSeconds?: number;
}
