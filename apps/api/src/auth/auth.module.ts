import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { CLOCK, type Clock } from "../common/clock";
import { type AppConfig, CONFIG } from "../config";
import { AuthController, LOGIN_RATE_LIMITER } from "./auth.controller";
import { AuthService } from "./auth.service";
import { CanGuard } from "./can.guard";
import { RateLimiter } from "./rate-limit";
import { TokenService } from "./tokens";

@Module({
  controllers: [AuthController],
  providers: [
    TokenService,
    AuthService,
    {
      provide: LOGIN_RATE_LIMITER,
      inject: [CONFIG, CLOCK],
      useFactory: (config: AppConfig, clock: Clock) => new RateLimiter(config.loginRateLimit, 15 * 60_000, clock),
    },
    // Every route must have @Can('key'), @LoggedIn() or @Public() (AGENTS.md rule 4).
    { provide: APP_GUARD, useClass: CanGuard },
  ],
  exports: [TokenService],
})
export class AuthModule {}
