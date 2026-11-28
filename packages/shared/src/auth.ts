// Shapes returned by /auth/login, /auth/refresh and /auth/me (API and web share them).
import type { PlatformRoleKey, StoreRoleKey } from "./roles";

export interface SessionUser {
  id: string;
  name: string;
  email: string | null;
  platformRole: PlatformRoleKey | null;
}

export interface SessionStore {
  id: string;
  name: string;
  companyId: string;
  companyName: string;
  role: StoreRoleKey;
}

export interface MeResponse {
  user: SessionUser;
  /** Store this session works in; null for platform admins. */
  store: SessionStore | null;
  /** Where the web should go after login. */
  landing: "/admin/analytics" | "/store/dashboard";
}

export interface AuthSession extends MeResponse {
  accessToken: string;
  /** Seconds until accessToken expires. */
  expiresIn: number;
}
