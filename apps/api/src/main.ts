import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

export async function createApp() {
  const app = await NestFactory.create(AppModule, { logger: ["error", "warn", "log"] });
  app.enableCors({ origin: (process.env.WEB_ORIGIN ?? "http://localhost:3000").split(",") });
  app.enableShutdownHooks();
  return app;
}

if (import.meta.main) {
  const app = await createApp();
  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  console.log(`API on http://localhost:${port}`);
}
