import { describe, expect, test } from "bun:test";
import { RELEASE, featureForPath, isPathReleased, parseStage, type FeatureKey } from "./release";

describe("release flags", () => {
  test("longest route wins", () => {
    expect(featureForPath("/store/inventory/products/shirt/edit")).toBe("inventory.products");
    expect(featureForPath("/store")).toBe("store.dashboard");
    expect(featureForPath("/admin/companies/brand-hub")).toBe("admin.companies");
  });

  test("production shows only live features", () => {
    expect(isPathReleased("/store/billing", "production")).toBe(RELEASE["store.billing"].status === "live");
    expect(isPathReleased("/store/offers", "production")).toBe(false);
    expect(isPathReleased("/store/offers", "development")).toBe(true);
  });

  test("auth and public pages are always allowed", () => {
    expect(isPathReleased("/login", "production")).toBe(true);
    expect(isPathReleased("/b/abc123", "production")).toBe(true);
  });

  test("unregistered /store pages never reach production", () => {
    expect(isPathReleased("/store/something-new", "production")).toBe(false);
    expect(isPathReleased("/store/something-new", "development")).toBe(true);
  });

  test("unknown stage falls back to production", () => {
    expect(parseStage(undefined)).toBe("production");
    expect(parseStage("prod")).toBe("production");
    expect(parseStage("staging")).toBe("staging");
  });

  test("every live feature has stories listed", () => {
    for (const [key, f] of Object.entries(RELEASE) as [FeatureKey, { status: string; stories: string[] }][]) {
      if (f.status === "live") expect(f.stories.length, key).toBeGreaterThan(0);
    }
  });
});
