import { type DynamicModule, Global, Module } from "@nestjs/common";
import { CLOCK, type Clock } from "./common/clock";
import { type AppConfig, CONFIG } from "./config";

/** Config and clock, available everywhere. */
@Global()
@Module({})
export class CoreModule {
  static register(config: AppConfig, clock: Clock): DynamicModule {
    return {
      module: CoreModule,
      providers: [
        { provide: CONFIG, useValue: config },
        { provide: CLOCK, useValue: clock },
      ],
      exports: [CONFIG, CLOCK],
    };
  }
}
