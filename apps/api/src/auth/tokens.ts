import { createHash, randomBytes } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import { PLATFORM_ROLE_KEYS, type PlatformRoleKey, STORE_ROLE_KEYS, type StoreRoleKey } from "@storedesk/shared";
import { jwtVerify, SignJWT } from "jose";
import { CLOCK, type Clock } from "../common/clock";
import { type AppConfig, CONFIG } from "../config";
import type { AuthUser } from "./auth-user";

export const ACCESS_TOKEN_SECONDS = 15 * 60;
export const REFRESH_TOKEN_DAYS = 30;
const ISSUER = "storedesk-api";
const AUDIENCE = "storedesk";

/** Claims inside the access token (short names keep the token small). */
interface AccessClaims {
  sid: string; // session id
  pr: PlatformRoleKey | null;
  cid: string | null;
  stid: string | null;
  sr: StoreRoleKey | null;
}

export interface AccessTokenInput {
  userId: string;
  sessionId: string;
  platformRole: PlatformRoleKey | null;
  companyId: string | null;
  storeId: string | null;
  storeRole: StoreRoleKey | null;
}

const isPlatformRole = (v: unknown): v is PlatformRoleKey => (PLATFORM_ROLE_KEYS as readonly unknown[]).includes(v);
const isStoreRole = (v: unknown): v is StoreRoleKey => (STORE_ROLE_KEYS as readonly unknown[]).includes(v);
const strOrNull = (v: unknown) => (typeof v === "string" ? v : null);

@Injectable()
export class TokenService {
  private readonly key: Uint8Array;

  constructor(
    @Inject(CONFIG) config: AppConfig,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {
    this.key = new TextEncoder().encode(config.jwtSecret);
  }

  /** HS256 access token, valid 15 minutes. */
  signAccess(input: AccessTokenInput): Promise<string> {
    const nowSec = Math.floor(this.clock.now().getTime() / 1000);
    const claims: AccessClaims = {
      sid: input.sessionId,
      pr: input.platformRole,
      cid: input.companyId,
      stid: input.storeId,
      sr: input.storeRole,
    };
    return new SignJWT({ ...claims })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setSubject(input.userId)
      .setIssuer(ISSUER)
      .setAudience(AUDIENCE)
      .setIssuedAt(nowSec)
      .setExpirationTime(nowSec + ACCESS_TOKEN_SECONDS)
      .sign(this.key);
  }

  /** Returns the caller, or null for a missing, expired, tampered or malformed token. */
  async verifyAccess(token: string): Promise<AuthUser | null> {
    try {
      const { payload } = await jwtVerify(token, this.key, {
        algorithms: ["HS256"],
        issuer: ISSUER,
        audience: AUDIENCE,
        currentDate: this.clock.now(),
        requiredClaims: ["exp", "iat", "sub", "sid"],
      });
      if (typeof payload.sub !== "string") return null;
      return {
        userId: payload.sub,
        sessionId: strOrNull(payload.sid) ?? undefined,
        platformRole: isPlatformRole(payload.pr) ? payload.pr : null,
        companyId: strOrNull(payload.cid) ?? undefined,
        storeId: strOrNull(payload.stid) ?? undefined,
        storeRole: isStoreRole(payload.sr) ? payload.sr : null,
      };
    } catch {
      return null;
    }
  }
}

/** 256-bit random refresh token (sent to the browser) and its sha-256 hash (stored). */
export function newRefreshToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashRefreshToken(token) };
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
