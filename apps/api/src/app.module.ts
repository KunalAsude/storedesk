import { Controller, type DynamicModule, Get, Inject, Module, Req } from "@nestjs/common";
import type { Request } from "express";
import { AuthModule } from "./auth/auth.module";
import { Public } from "./auth/can.decorator";
import { type Clock, systemClock } from "./common/clock";
import { type AppConfig, CONFIG } from "./config";
import { CoreModule } from "./core.module";
import { DbModule } from "./db/db.module";

@Controller()
class HealthController {
  constructor(@Inject(CONFIG) private readonly config: AppConfig) {}

  // Used by the free uptime pinger to keep the Render instance awake.
  // Outside production it also echoes the caller's IP as the API sees it, to check TRUST_PROXY_HOPS.
  @Public()
  @Get("health")
  health(@Req() req: Request) {
    return {
      ok: true,
      service: "storedesk-api",
      ...(this.config.stage !== "production" && { stage: this.config.stage, yourIp: req.ip }),
    };
  }
}

@Module({ controllers: [HealthController] })
export class AppModule {
  static register(config: AppConfig, clock: Clock = systemClock): DynamicModule {
    return { module: AppModule, imports: [CoreModule.register(config, clock), DbModule, AuthModule] };
  }
}
