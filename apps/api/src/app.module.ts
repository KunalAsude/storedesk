import { Controller, Get, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { Public } from "./auth/can.decorator";
import { CanGuard } from "./auth/can.guard";

@Controller()
class HealthController {
  // Used by the free uptime pinger to keep the Render instance awake.
  @Public()
  @Get("health")
  health() {
    return { ok: true, service: "storedesk-api" };
  }
}

@Module({
  controllers: [HealthController],
  // Every route must have @Can('key') or @Public() (AGENTS.md rule 4).
  providers: [{ provide: APP_GUARD, useClass: CanGuard }],
})
export class AppModule {}
