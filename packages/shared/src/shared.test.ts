import { describe, expect, test } from "bun:test";
import { PLATFORM_ROLES, PLATFORM_ROLE_KEYS, ROLE_LABELS, STORE_ROLES, STORE_ROLE_KEYS, formatINR, hasPermission, toPaise } from "./index";

describe("role keys", () => {
  test("every key has a label and every label has a key", () => {
    expect(PLATFORM_ROLE_KEYS.map((k) => ROLE_LABELS[k])).toEqual([...PLATFORM_ROLES]);
    expect(STORE_ROLE_KEYS.map((k) => ROLE_LABELS[k])).toEqual([...STORE_ROLES]);
  });
});

describe("money", () => {
  test("formats Indian grouping and hides .00", () => {
    expect(formatINR(10250000)).toBe("₹1,02,500");
    expect(formatINR(5365)).toBe("₹53.65");
  });
  test("toPaise", () => {
    expect(toPaise("499.5")).toBe(49950);
  });
});

describe("permissions", () => {
  test("cashier cannot open admin or inventory", () => {
    expect(hasPermission("Cashier", "billing.create")).toBe(true);
    expect(hasPermission("Cashier", "admin.view")).toBe(false);
    expect(hasPermission("Cashier", "inventory.edit")).toBe(false);
  });
  test("owner has no platform admin access", () => {
    expect(hasPermission("Owner", "admin.view")).toBe(false);
  });
});
