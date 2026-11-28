import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { Controller, Get, Module } from "@nestjs/common";
import { APP_GUARD, NestFactory } from "@nestjs/core";
import type { NextFunction, Response } from "express";
import { AppModule } from "../app.module";
import { testConfig } from "../test-utils";
import type { AuthedRequest, AuthUser } from "./auth-user";
import { Can, Public } from "./can.decorator";
import { CanGuard } from "./can.guard";
import { findUnguardedRoutes } from "./route-coverage";

@Controller("t")
class TestController {
  @Public()
  @Get("open")
  open() {
    return { ok: true };
  }

  @Can("inventory.edit")
  @Get("edit")
  edit() {
    return { ok: true };
  }

  @Get("forgotten")
  forgotten() {
    return { ok: true };
  }
}

@Can("admin.view")
@Controller("admin-t")
class TestAdminController {
  @Get()
  list() {
    return { ok: true };
  }
}

// Routes inherited from a base class must be covered too.
class BaseCrud {
  @Get("inherited")
  inherited() {
    return { ok: true };
  }
}

@Controller("child-t")
class TestChildController extends BaseCrud {}

@Public()
@Controller("mixed-t")
class TestMixedController {
  @Get("open")
  open() {
    return { ok: true };
  }

  @Can("staff.manage")
  @Get("locked")
  locked() {
    return { ok: true };
  }
}

@Module({ controllers: [TestController, TestAdminController, TestMixedController, TestChildController], providers: [{ provide: APP_GUARD, useClass: CanGuard }] })
class TestModule {}

let app: Awaited<ReturnType<typeof NestFactory.create>>;
let base = "";

beforeAll(async () => {
  app = await NestFactory.create(TestModule, { logger: false });
  // Test-only stand-in for the login middleware (US-AUTH-01): JSON AuthUser in a header.
  app.use((req: AuthedRequest, _res: Response, next: NextFunction) => {
    const h = req.header("x-test-auth");
    if (h) req.auth = JSON.parse(h) as AuthUser;
    next();
  });
  await app.listen(0);
  base = (await app.getUrl()).replace("[::1]", "localhost");
});
afterAll(() => app.close());

const call = (path: string, auth?: Partial<AuthUser>) =>
  fetch(`${base}${path}`, { headers: auth ? { "x-test-auth": JSON.stringify({ userId: "u1", ...auth }) } : {} });

describe("@Can guard", () => {
  test("@Public route is open without login", async () => {
    expect((await call("/t/open")).status).toBe(200);
  });

  test("not logged in → 401 UNAUTHENTICATED", async () => {
    const res = await call("/t/edit");
    expect(res.status).toBe(401);
    expect(await res.json()).toMatchObject({ code: "UNAUTHENTICATED", message: "Please log in" });
  });

  test("permission refused → 403 PERMISSION_DENIED with the key", async () => {
    const res = await call("/t/edit", { storeRole: "cashier" });
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({
      statusCode: 403,
      error: "Forbidden",
      code: "PERMISSION_DENIED",
      message: "You don't have permission: inventory.edit",
      permission: "inventory.edit",
    });
  });

  test("store role with the permission → 200", async () => {
    expect((await call("/t/edit", { storeRole: "stock_staff" })).status).toBe(200);
  });

  test("platform role grants too; support cannot edit", async () => {
    expect((await call("/t/edit", { platformRole: "super_admin" })).status).toBe(200);
    expect((await call("/t/edit", { platformRole: "support" })).status).toBe(403);
  });

  test("@Can on a controller covers its routes; store owner is refused admin", async () => {
    expect((await call("/admin-t", { storeRole: "owner" })).status).toBe(403);
    expect((await call("/admin-t", { platformRole: "admin" })).status).toBe(200);
  });

  test("@Can on a method wins over @Public on its controller", async () => {
    expect((await call("/mixed-t/open")).status).toBe(200);
    expect((await call("/mixed-t/locked")).status).toBe(401);
    expect((await call("/mixed-t/locked", { storeRole: "cashier" })).status).toBe(403);
  });

  test("unguarded route: 401 when logged out, so it is not revealed", async () => {
    expect((await call("/t/forgotten")).status).toBe(401);
  });

  test("route without @Can or @Public is refused even for super admin", async () => {
    const res = await call("/t/forgotten", { platformRole: "super_admin" });
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ code: "ROUTE_NOT_GUARDED" });
  });
});

describe("route coverage", () => {
  test("detects routes without @Can or @Public, inherited ones included", () => {
    expect(findUnguardedRoutes(app)).toEqual(["TestChildController.inherited", "TestController.forgotten"]);
  });

  test("every route in the real API has @Can or @Public", async () => {
    const real = await NestFactory.create(AppModule.register(testConfig()), { logger: false });
    await real.init();
    try {
      expect(findUnguardedRoutes(real)).toEqual([]);
    } finally {
      await real.close();
    }
  });
});
