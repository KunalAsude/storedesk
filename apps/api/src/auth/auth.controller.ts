import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Req, Res } from "@nestjs/common";
import type { AuthSession, MeResponse } from "@storedesk/shared";
import type { Response } from "express";
import { z } from "zod";
import { apiError } from "../common/api-error";
import { type AppConfig, CONFIG } from "../config";
import { type AuthResult, AuthService } from "./auth.service";
import type { AuthedRequest } from "./auth-user";
import { LoggedIn, Public } from "./can.decorator";
import type { RateLimiter } from "./rate-limit";

/** Errors after which the refresh cookie is useless; others (DB down, race) keep it. */
const CLEAR_COOKIE_ON = new Set(["SESSION_EXPIRED", "ACCOUNT_DISABLED", "NO_STORE_ACCESS"]);

export const REFRESH_COOKIE = "sd_refresh";
export const LOGIN_RATE_LIMITER = Symbol("LOGIN_RATE_LIMITER");

const loginBody = z.object({
  identifier: z.string().trim().min(3).max(254),
  password: z.string().min(1).max(200),
});

@Controller("auth")
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(CONFIG) private readonly config: AppConfig,
    @Inject(LOGIN_RATE_LIMITER) private readonly limiter: RateLimiter,
  ) {}

  @Public()
  @Post("login")
  @HttpCode(200)
  async login(@Body() body: unknown, @Req() req: AuthedRequest, @Res({ passthrough: true }) res: Response): Promise<AuthSession> {
    requireJson(req);
    const limit = this.limiter.hit(`login:${clientIp(req)}`);
    if (!limit.allowed) {
      res.setHeader("Retry-After", String(limit.retryAfterSeconds));
      throw apiError(HttpStatus.TOO_MANY_REQUESTS, "TOO_MANY_ATTEMPTS", "Too many login attempts. Please wait and try again", {
        retryAfterSeconds: limit.retryAfterSeconds,
      });
    }
    const parsed = loginBody.safeParse(body);
    if (!parsed.success) throw apiError(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", "Enter your email or phone and password");

    const result = await this.auth.login(parsed.data.identifier, parsed.data.password, meta(req));
    this.setRefreshCookie(res, result);
    return result.session;
  }

  /** Cookie-only; JSON required (CSRF). 409 REFRESH_RACE means another tab just refreshed: retry once. */
  @Public()
  @Post("refresh")
  @HttpCode(200)
  async refresh(@Req() req: AuthedRequest, @Res({ passthrough: true }) res: Response): Promise<AuthSession> {
    requireJson(req);
    const token: unknown = req.cookies?.[REFRESH_COOKIE];
    if (typeof token !== "string" || !token) throw apiError(HttpStatus.UNAUTHORIZED, "SESSION_EXPIRED", "Please log in again");
    try {
      const result = await this.auth.refresh(token, meta(req));
      this.setRefreshCookie(res, result);
      return result.session;
    } catch (err) {
      const code = (err as { getResponse?: () => { code?: string } }).getResponse?.()?.code;
      if (code && CLEAR_COOKIE_ON.has(code)) res.clearCookie(REFRESH_COOKIE, this.cookieOptions());
      throw err;
    }
  }

  @LoggedIn()
  @Get("me")
  me(@Req() req: AuthedRequest): Promise<MeResponse> {
    return this.auth.me(req.auth!.userId, req.auth!.storeId);
  }

  private cookieOptions() {
    return {
      httpOnly: true,
      secure: this.config.stage !== "development",
      sameSite: "lax" as const,
      path: this.config.refreshCookiePath,
    };
  }

  private setRefreshCookie(res: Response, result: AuthResult) {
    res.cookie(REFRESH_COOKIE, result.refreshToken, { ...this.cookieOptions(), expires: result.refreshExpiresAt });
  }
}

/** JSON only: browsers can't send it cross-site without CORS approval, which blocks CSRF form posts. */
function requireJson(req: AuthedRequest) {
  if (!(req.headers["content-type"] ?? "").startsWith("application/json")) {
    throw apiError(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", "Send the request as JSON");
  }
}

function clientIp(req: AuthedRequest): string {
  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}

function meta(req: AuthedRequest) {
  return { ip: clientIp(req), userAgent: req.headers["user-agent"]?.slice(0, 300) ?? null };
}
