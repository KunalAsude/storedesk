import type { PlatformRoleKey, StoreRoleKey } from "@storedesk/shared";
import type { Request } from "express";

/** Who is calling. Filled from the access token (US-AUTH-01); the company scope comes in US-RBAC-03. */
export interface AuthUser {
  userId: string;
  platformRole?: PlatformRoleKey | null;
  /** Role in the store this request is for. */
  storeRole?: StoreRoleKey | null;
  companyId?: string;
  storeId?: string;
}

/** Express request after the auth middleware has run. */
export type AuthedRequest = Request & { auth?: AuthUser };
