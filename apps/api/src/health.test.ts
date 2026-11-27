import "reflect-metadata";
import { afterAll, beforeAll, expect, test } from "bun:test";
import { createApp } from "./main";

let app: Awaited<ReturnType<typeof createApp>>;
let base = "";

beforeAll(async () => {
  app = await createApp();
  await app.listen(0);
  base = (await app.getUrl()).replace("[::1]", "localhost");
});
afterAll(() => app.close());

test("GET /health", async () => {
  const res = await fetch(`${base}/health`);
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ ok: true, service: "storedesk-api" });
});
