import type { INestApplication } from "@nestjs/common";
import { METHOD_METADATA, PATH_METADATA } from "@nestjs/common/constants";
import { MetadataScanner, ModulesContainer } from "@nestjs/core";
import { CAN_KEY, PUBLIC_KEY } from "./can.decorator";

/**
 * Lists "Controller.method" for every route Nest registered in `app` (dynamic modules,
 * forwardRef and inherited methods included) that has neither @Can nor @Public.
 */
export function findUnguardedRoutes(app: INestApplication): string[] {
  const scanner = new MetadataScanner();
  const missing = new Set<string>();
  for (const mod of app.get(ModulesContainer).values()) {
    for (const wrapper of mod.controllers.values()) {
      const controller = wrapper.metatype as (abstract new (...args: never[]) => unknown) | null;
      if (!controller?.prototype) continue;
      const classGuarded = Reflect.getMetadata(CAN_KEY, controller) ?? Reflect.getMetadata(PUBLIC_KEY, controller);
      for (const name of scanner.getAllMethodNames(controller.prototype)) {
        const handler = (controller.prototype as Record<string, unknown>)[name];
        if (typeof handler !== "function") continue;
        const isRoute =
          Reflect.getMetadata(PATH_METADATA, handler) !== undefined && Reflect.getMetadata(METHOD_METADATA, handler) !== undefined;
        if (!isRoute) continue;
        const guarded = Reflect.getMetadata(CAN_KEY, handler) ?? Reflect.getMetadata(PUBLIC_KEY, handler) ?? classGuarded;
        if (!guarded) missing.add(`${controller.name}.${name}`);
      }
    }
  }
  return [...missing].sort();
}
