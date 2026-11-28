import { Global, Inject, Module, type OnApplicationShutdown } from "@nestjs/common";
import { createDb } from "@storedesk/db";
import { type AppConfig, CONFIG } from "../config";

/** Owner connection (not filtered by RLS). Store data must go through withCompany() (US-RBAC-03). */
export const DB = Symbol("DB");
const DB_CONNECTION = Symbol("DB_CONNECTION");

@Global()
@Module({
  providers: [
    { provide: DB_CONNECTION, inject: [CONFIG], useFactory: (config: AppConfig) => createDb(config.databaseUrl) },
    { provide: DB, inject: [DB_CONNECTION], useFactory: (conn: ReturnType<typeof createDb>) => conn.db },
  ],
  exports: [DB],
})
export class DbModule implements OnApplicationShutdown {
  constructor(@Inject(DB_CONNECTION) private readonly conn: ReturnType<typeof createDb>) {}

  async onApplicationShutdown() {
    await this.conn.client.end({ timeout: 5 });
  }
}
