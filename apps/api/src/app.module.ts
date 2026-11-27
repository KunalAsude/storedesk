import { Controller, Get, Module } from "@nestjs/common";

@Controller()
class HealthController {
  // Used by the free uptime pinger to keep the Render instance awake.
  @Get("health")
  health() {
    return { ok: true, service: "storedesk-api" };
  }
}

@Module({ controllers: [HealthController] })
export class AppModule {}
