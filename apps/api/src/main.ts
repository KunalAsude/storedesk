import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { authMiddleware } from "./auth/auth.middleware";
import { TokenService } from "./auth/tokens";
import { type Clock, systemClock } from "./common/clock";
import { type AppConfig, loadConfig } from "./config";

export async function createApp(opts: { config?: AppConfig; clock?: Clock } = {}) {
  const config = opts.config ?? loadConfig();
  const app = await NestFactory.create<NestExpressApplication>(AppModule.register(config, opts.clock ?? systemClock), {
    logger: ["error", "warn", "log"],
  });
  // Behind Render's proxy: req.ip is the real client IP (used by the login rate limit).
  if (config.trustProxyHops > 0) app.set("trust proxy", config.trustProxyHops);
  app.use(cookieParser());
  app.use(authMiddleware(app.get(TokenService)));
  app.enableCors({ origin: config.webOrigins, credentials: true });
  app.enableShutdownHooks();
  return app;
}

if (import.meta.main) {
  const app = await createApp();
  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  console.log(`API on http://localhost:${port}`);
}
