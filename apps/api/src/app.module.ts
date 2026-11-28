import { Controller, type DynamicModule, Get, Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { Public } from "./auth/can.decorator";
import { type Clock, systemClock } from "./common/clock";
import type { AppConfig } from "./config";
import { CoreModule } from "./core.module";
import { DbModule } from "./db/db.module";

@Controller()
class HealthController {
  // Used by the free uptime pinger to keep the Render instance awake.
  @Public()
  @Get("health")
  health() {
    return { ok: true, service: "storedesk-api" };
  }
}

@Module({ controllers: [HealthController] })
export class AppModule {
  static register(config: AppConfig, clock: Clock = systemClock): DynamicModule {
    return { module: AppModule, imports: [CoreModule.register(config, clock), DbModule, AuthModule] };
  }
}
