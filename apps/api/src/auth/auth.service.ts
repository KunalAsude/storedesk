import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { companies, type Db, memberships, sessions, stores, type Tx, users } from "@storedesk/db";
import type { AuthSession, MeResponse, SessionStore, SessionUser } from "@storedesk/shared";
import { and, asc, eq, gt, isNull, lte, or, sql } from "drizzle-orm";
import { apiError } from "../common/api-error";
import { CLOCK, type Clock } from "../common/clock";
import { DB } from "../db/db.module";
import { ACCESS_TOKEN_SECONDS, hashRefreshToken, newRefreshToken, REFRESH_TOKEN_DAYS, TokenService } from "./tokens";

export const MAX_FAILED_LOGINS = 5;
export const LOCK_MINUTES = 15;
/** Two tabs refreshing with the same cookie within this window is a race, not theft. */
export const REFRESH_RACE_GRACE_MS = 10_000;
const DAY_MS = 86_400_000;

/** Same message for unknown user and wrong password, so nobody can probe which emails exist. */
const invalidCredentials = () =>
  apiError(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Email/phone or password is incorrect");
const sessionExpired = () => apiError(HttpStatus.UNAUTHORIZED, "SESSION_EXPIRED", "Your session has ended. Please log in again");
const accountDisabled = () =>
  apiError(HttpStatus.FORBIDDEN, "ACCOUNT_DISABLED", "Your account is deactivated. Ask your store owner or StoreDesk support");
const noStoreAccess = () =>
  apiError(HttpStatus.FORBIDDEN, "NO_STORE_ACCESS", "You are not part of any store yet. Ask your store owner");

// Verified against when the user doesn't exist or is locked, so every path takes the same time.
const dummyHash = Bun.password.hash("storedesk-timing-equaliser", { algorithm: "argon2id" });

export interface AuthResult {
  session: AuthSession;
  refreshToken: string;
  refreshExpiresAt: Date;
}

interface RequestMeta {
  ip: string | null;
  userAgent: string | null;
}

type UserRow = typeof users.$inferSelect;
type Exec = Db | Tx;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  /** Unknown emails/phones "lock" like real ones, so the lock doesn't reveal who has an account. */
  private readonly phantomLocks = new Map<string, { count: number; lockedUntil: number }>();

  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(TokenService) private readonly tokens: TokenService,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async login(identifier: string, password: string, meta: RequestMeta): Promise<AuthResult> {
    const key = normalizeIdentifier(identifier);
    if (!key) throw invalidCredentials();
    const now = this.clock.now();
    const user = await this.findByIdentifier(key);

    if (!user || !user.passwordHash) {
      await Bun.password.verify(password, await dummyHash);
      throw this.phantomFailure(key, now);
    }

    if (user.lockedUntil && user.lockedUntil > now) {
      await Bun.password.verify(password, await dummyHash);
      throw this.locked(user.lockedUntil);
    }

    if (!(await Bun.password.verify(password, user.passwordHash))) {
      const lockedUntil = await this.recordFailedLogin(user.id, now);
      if (lockedUntil && lockedUntil > now) throw this.locked(lockedUntil);
      throw invalidCredentials();
    }

    // Right password: only now say the account is deactivated (doesn't leak anything to strangers).
    if (!user.isActive) throw accountDisabled();

    const store = await this.findStore(this.db, user);
    if (store === "none") throw noStoreAccess();
    const refresh = newRefreshToken();
    const refreshExpiresAt = new Date(now.getTime() + REFRESH_TOKEN_DAYS * DAY_MS);

    const sessionId = await this.db.transaction(async (tx) => {
      // Conditional on "not locked": a parallel batch of wrong guesses that locked the
      // account in the meantime wins over this success.
      const [ok] = await tx
        .update(users)
        .set({ failedLogins: 0, lockedUntil: null, lastLoginAt: now, lastStoreId: store?.id ?? user.lastStoreId })
        .where(and(eq(users.id, user.id), or(isNull(users.lockedUntil), lte(users.lockedUntil, now))))
        .returning({ id: users.id });
      if (!ok) return null;
      const [s] = await tx
        .insert(sessions)
        .values({ userId: user.id, refreshTokenHash: refresh.hash, expiresAt: refreshExpiresAt, ip: meta.ip, userAgent: meta.userAgent })
        .returning({ id: sessions.id });
      return s!.id;
    });
    if (!sessionId) {
      const [fresh] = await this.db.select({ lockedUntil: users.lockedUntil }).from(users).where(eq(users.id, user.id));
      throw this.locked(fresh?.lockedUntil ?? new Date(now.getTime() + LOCK_MINUTES * 60_000));
    }

    return { session: await this.buildSession(user, store, sessionId), refreshToken: refresh.token, refreshExpiresAt };
  }

  /**
   * Rotates the refresh token. Using an already-rotated token means it was copied:
   * the whole login family is revoked and the user must log in again. Within a few
   * seconds of rotation it is treated as two tabs racing (409, nothing revoked).
   */
  async refresh(refreshToken: string, meta: RequestMeta): Promise<AuthResult> {
    const now = this.clock.now();
    const outcome = await this.db.transaction(async (tx) => {
      const [old] = await tx
        .select()
        .from(sessions)
        .where(eq(sessions.refreshTokenHash, hashRefreshToken(refreshToken)))
        .for("update");
      if (!old) return { kind: "expired" as const };

      const revokeFamily = () =>
        tx.update(sessions).set({ revokedAt: now }).where(and(eq(sessions.familyId, old.familyId), isNull(sessions.revokedAt)));

      if (old.replacedBy) {
        if (old.revokedAt && now.getTime() - old.revokedAt.getTime() < REFRESH_RACE_GRACE_MS) return { kind: "race" as const };
        await revokeFamily();
        return { kind: "reused" as const, userId: old.userId };
      }
      if (old.revokedAt || old.expiresAt <= now) return { kind: "expired" as const };

      const [user] = await tx.select().from(users).where(eq(users.id, old.userId));
      if (!user || !user.isActive) {
        await revokeFamily();
        return { kind: "disabled" as const };
      }

      // Roles may have changed since login: the store context is read again, before rotating.
      const store = await this.findStore(tx, user);
      if (store === "none") {
        await revokeFamily();
        return { kind: "nostore" as const };
      }

      const refresh = newRefreshToken();
      const refreshExpiresAt = new Date(now.getTime() + REFRESH_TOKEN_DAYS * DAY_MS);
      const [next] = await tx
        .insert(sessions)
        .values({
          userId: user.id,
          familyId: old.familyId,
          refreshTokenHash: refresh.hash,
          expiresAt: refreshExpiresAt,
          ip: meta.ip,
          userAgent: meta.userAgent,
        })
        .returning({ id: sessions.id });
      await tx.update(sessions).set({ revokedAt: now, replacedBy: next!.id }).where(eq(sessions.id, old.id));
      return { kind: "ok" as const, user, store, sessionId: next!.id, refresh, refreshExpiresAt };
    });

    // Thrown outside the transaction so a family revoke above is committed.
    switch (outcome.kind) {
      case "race":
        throw apiError(HttpStatus.CONFLICT, "REFRESH_RACE", "Session was just refreshed in another tab. Try again");
      case "reused":
        this.logger.warn(`Refresh token reused for user ${outcome.userId}; session family revoked`);
        throw sessionExpired();
      case "expired":
        throw sessionExpired();
      case "disabled":
        throw accountDisabled();
      case "nostore":
        throw noStoreAccess();
    }
    return {
      session: await this.buildSession(outcome.user, outcome.store, outcome.sessionId),
      refreshToken: outcome.refresh.token,
      refreshExpiresAt: outcome.refreshExpiresAt,
    };
  }

  async me(userId: string, storeId: string | undefined): Promise<MeResponse> {
    const [user] = await this.db.select().from(users).where(eq(users.id, userId));
    if (!user || !user.isActive) throw sessionExpired();
    const store = await this.findStore(this.db, { ...user, lastStoreId: storeId ?? user.lastStoreId });
    if (store === "none") throw noStoreAccess();
    return { user: toSessionUser(user), store, landing: landingFor(user) };
  }

  private async findByIdentifier(key: string): Promise<UserRow | undefined> {
    const where = key.includes("@") ? sql`lower(${users.email}) = ${key}` : eq(users.phone, key);
    const [user] = await this.db.select().from(users).where(where);
    return user;
  }

  /**
   * +1 failed try; the 5th locks the account for 15 minutes. Atomic and only while not locked,
   * so parallel guesses can't skip or reset the lock. Returns the lock time if locked.
   */
  private async recordFailedLogin(userId: string, now: Date): Promise<Date | null> {
    const lockUntil = new Date(now.getTime() + LOCK_MINUTES * 60_000).toISOString();
    const reached = sql`${users.failedLogins} + 1 >= ${MAX_FAILED_LOGINS}`;
    const [row] = await this.db
      .update(users)
      .set({
        failedLogins: sql`CASE WHEN ${reached} THEN 0 ELSE ${users.failedLogins} + 1 END`,
        lockedUntil: sql`CASE WHEN ${reached} THEN ${lockUntil}::timestamptz ELSE ${users.lockedUntil} END`,
      })
      .where(and(eq(users.id, userId), or(isNull(users.lockedUntil), lte(users.lockedUntil, now))))
      .returning({ lockedUntil: users.lockedUntil });
    if (row) return row.lockedUntil;
    // Already locked by a parallel try.
    const [locked] = await this.db
      .select({ lockedUntil: users.lockedUntil })
      .from(users)
      .where(and(eq(users.id, userId), gt(users.lockedUntil, now)));
    return locked?.lockedUntil ?? null;
  }

  /** Mirrors recordFailedLogin for identifiers that don't exist. */
  private phantomFailure(key: string, now: Date) {
    const t = now.getTime();
    if (this.phantomLocks.size > 10_000) {
      for (const [k, v] of this.phantomLocks) if (v.lockedUntil <= t && v.count === 0) this.phantomLocks.delete(k);
    }
    const entry = this.phantomLocks.get(key) ?? { count: 0, lockedUntil: 0 };
    if (entry.lockedUntil > t) return this.locked(new Date(entry.lockedUntil));
    entry.count += 1;
    if (entry.count >= MAX_FAILED_LOGINS) {
      entry.count = 0;
      entry.lockedUntil = t + LOCK_MINUTES * 60_000;
      this.phantomLocks.set(key, entry);
      return this.locked(new Date(entry.lockedUntil));
    }
    this.phantomLocks.set(key, entry);
    return invalidCredentials();
  }

  private locked(until: Date) {
    const retryAfterSeconds = Math.max(1, Math.ceil((until.getTime() - this.clock.now().getTime()) / 1000));
    const minutes = Math.ceil(retryAfterSeconds / 60);
    return apiError(HttpStatus.LOCKED, "ACCOUNT_LOCKED", `Too many wrong passwords. Try again in ${minutes} min`, {
      retryAfterSeconds,
    });
  }

  /** Platform admins: null (no store). Store users: the last store used, else their first; "none" if they have none. */
  private async findStore(
    exec: Exec,
    user: Pick<UserRow, "id" | "platformRole" | "lastStoreId">,
  ): Promise<SessionStore | null | "none"> {
    if (user.platformRole) return null;
    const rows = await exec
      .select({
        id: stores.id,
        name: stores.name,
        companyId: companies.id,
        companyName: companies.name,
        role: memberships.role,
      })
      .from(memberships)
      .innerJoin(stores, eq(stores.id, memberships.storeId))
      .innerJoin(companies, eq(companies.id, memberships.companyId))
      .where(eq(memberships.userId, user.id))
      .orderBy(asc(memberships.createdAt));
    return rows.find((r) => r.id === user.lastStoreId) ?? rows[0] ?? "none";
  }

  private async buildSession(user: UserRow, store: SessionStore | null, sessionId: string): Promise<AuthSession> {
    const accessToken = await this.tokens.signAccess({
      userId: user.id,
      sessionId,
      platformRole: user.platformRole,
      companyId: store?.companyId ?? null,
      storeId: store?.id ?? null,
      storeRole: store?.role ?? null,
    });
    return { accessToken, expiresIn: ACCESS_TOKEN_SECONDS, user: toSessionUser(user), store, landing: landingFor(user) };
  }
}

function toSessionUser(user: UserRow): SessionUser {
  return { id: user.id, name: user.name, email: user.email, platformRole: user.platformRole };
}

function landingFor(user: Pick<UserRow, "platformRole">): MeResponse["landing"] {
  return user.platformRole ? "/admin/analytics" : "/store/dashboard";
}

/**
 * Email → lower-case. Phone → digits with a leading +; a bare 10-digit Indian number gets +91.
 * "+91 98224-12345" and "9822412345" both become "+919822412345". Returns "" when unusable.
 */
export function normalizeIdentifier(raw: string): string {
  const id = raw.trim();
  if (id.includes("@")) return id.toLowerCase();
  const digits = id.replace(/\D/g, "");
  if (!digits) return "";
  if (id.startsWith("+")) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return digits;
}
