import { type CanActivate, type ExecutionContext, HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { type Permission, roleKeyCan } from "@storedesk/shared";
import { apiError } from "../common/api-error";
import type { AuthedRequest } from "./auth-user";
import { CAN_KEY, LOGGED_IN_KEY, PUBLIC_KEY } from "./can.decorator";

type Rule = { kind: "public" } | { kind: "logged-in" } | { kind: "can"; permission: Permission } | { kind: "none" };

/**
 * Global guard (APP_GUARD), deny by default: every route needs @Can('key'), @LoggedIn() or @Public().
 * A route with none is refused and logged; can.guard.test.ts fails the build first.
 */
@Injectable()
export class CanGuard implements CanActivate {
  private readonly logger = new Logger(CanGuard.name);
  private readonly loggedUnguarded = new Set<string>();

  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    // Only HTTP is supported; WebSockets/microservices must opt in deliberately.
    if (ctx.getType() !== "http") return false;

    const rule = this.ruleFor(ctx);
    if (rule.kind === "public") return true;

    const auth = ctx.switchToHttp().getRequest<AuthedRequest>().auth;
    if (!auth) throw apiError(HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED", "Please log in");

    if (rule.kind === "logged-in") return true;

    if (rule.kind === "none") {
      const route = `${ctx.getClass().name}.${ctx.getHandler().name}`;
      if (!this.loggedUnguarded.has(route)) {
        this.loggedUnguarded.add(route);
        this.logger.error(`Route without @Can, @LoggedIn or @Public refused: ${route}`);
      }
      throw apiError(HttpStatus.FORBIDDEN, "ROUTE_NOT_GUARDED", "This route is not available");
    }

    const { permission } = rule;
    const allowed =
      (auth.platformRole != null && roleKeyCan(auth.platformRole, permission)) ||
      (auth.storeRole != null && roleKeyCan(auth.storeRole, permission));
    if (!allowed) {
      throw apiError(HttpStatus.FORBIDDEN, "PERMISSION_DENIED", `You don't have permission: ${permission}`, { permission });
    }
    return true;
  }

  /** The method's own decorator wins over the controller's; @Can wins over the others on the same target. */
  private ruleFor(ctx: ExecutionContext): Rule {
    for (const target of [ctx.getHandler(), ctx.getClass()]) {
      const permission = this.reflector.get<Permission>(CAN_KEY, target);
      if (permission) return { kind: "can", permission };
      if (this.reflector.get<boolean>(LOGGED_IN_KEY, target)) return { kind: "logged-in" };
      if (this.reflector.get<boolean>(PUBLIC_KEY, target)) return { kind: "public" };
    }
    return { kind: "none" };
  }
}
