// Stable error codes in API error bodies. The web switches on `code`, never on `message`.
// Today only auth/permission errors carry a code; other Nest errors (400/404/500) do not yet.
export const API_ERROR_CODES = ["UNAUTHENTICATED", "PERMISSION_DENIED", "ROUTE_NOT_GUARDED"] as const;
export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export interface ApiError {
  statusCode: number;
  error: string;
  code: ApiErrorCode;
  message: string;
  /** Set when code is PERMISSION_DENIED. */
  permission?: string;
}
