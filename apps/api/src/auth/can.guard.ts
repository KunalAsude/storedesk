import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { type ApiError, type Permission, roleKeyCan } from "@storedesk/shared";
import type { AuthedRequest } from "./auth-user";
import { CAN_KEY, PUBLIC_KEY } from "./can.decorator";

/**
 * Global guard (APP_GUARD), deny by default: every route needs @Can('key') or @Public().
 * A route with neither is refused and logged; can.guard.test.ts fails the build first.
 */
@Injectable()
export class CanGuard implements CanActivate {
  private readonly logger = new Logger(CanGuard.name);
  private readonly loggedUnguarded = new Set<string>();

  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    // Only HTTP is supported; WebSockets/microservices must opt in deliberately.
    if (ctx.getType() !== "http") return false;

    // The method's own decorator wins over the controller's.
    let permission: Permission | undefined;
    for (const target of [ctx.getHandler(), ctx.getClass()]) {
      permission = this.reflector.get<Permission>(CAN_KEY, target);
      if (permission) break;
      if (this.reflector.get<boolean>(PUBLIC_KEY, target)) return true;
    }

    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    const auth = req.auth;
    if (!auth) throw new UnauthorizedException(body(401, "Unauthorized", "UNAUTHENTICATED", "Please log in"));

    if (!permission) {
      const route = `${ctx.getClass().name}.${ctx.getHandler().name}`;
      if (!this.loggedUnguarded.has(route)) {
        this.loggedUnguarded.add(route);
        this.logger.error(`Route without @Can or @Public refused: ${route}`);
      }
      throw new ForbiddenException(body(403, "Forbidden", "ROUTE_NOT_GUARDED", "This route is not available"));
    }

    const allowed =
      (auth.platformRole != null && roleKeyCan(auth.platformRole, permission)) ||
      (auth.storeRole != null && roleKeyCan(auth.storeRole, permission));
    if (!allowed) {
      throw new ForbiddenException({
        ...body(403, "Forbidden", "PERMISSION_DENIED", `You don't have permission: ${permission}`),
        permission,
      });
    }
    return true;
  }
}

function body(statusCode: number, error: string, code: ApiError["code"], message: string): ApiError {
  return { statusCode, error, code, message };
}
