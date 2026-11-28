import "reflect-metadata";
import { afterAll, beforeAll, expect, test } from "bun:test";
import { createApp } from "./main";
import { testConfig } from "./test-utils";

let app: Awaited<ReturnType<typeof createApp>>;
let base = "";

beforeAll(async () => {
  app = await createApp({ config: testConfig() });
  await app.listen(0);
  base = (await app.getUrl()).replace("[::1]", "localhost");
});
afterAll(() => app.close());

test("GET /health", async () => {
  const res = await fetch(`${base}/health`);
  expect(res.status).toBe(200);
  expect(await res.json()).toMatchObject({ ok: true, service: "storedesk-api", stage: "development" });
});

test("GET /health hides the IP echo in production", async () => {
  const prod = await createApp({ config: testConfig(undefined, { stage: "production" }) });
  prod.useLogger(false);
  await prod.listen(0);
  try {
    const url = (await prod.getUrl()).replace("[::1]", "localhost");
    expect(await (await fetch(`${url}/health`)).json()).toEqual({ ok: true, service: "storedesk-api" });
  } finally {
    await prod.close();
  }
});
