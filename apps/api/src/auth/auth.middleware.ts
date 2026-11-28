import type { NextFunction, Response } from "express";
import type { AuthedRequest } from "./auth-user";
import type { TokenService } from "./tokens";

/**
 * Reads `Authorization: Bearer <access token>` and sets req.auth when valid.
 * Never rejects by itself: CanGuard decides (401 when a route needs login).
 */
export function authMiddleware(tokens: TokenService) {
  return async (req: AuthedRequest, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      const auth = await tokens.verifyAccess(header.slice(7).trim());
      if (auth) req.auth = auth;
    }
    next();
  };
}
