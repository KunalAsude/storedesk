// Fails if any admin/store page is not registered in packages/shared/src/release.ts.
// Runs in CI so a new page can't ship without a release flag.
import { Glob } from "bun";
import { featureForPath } from "@storedesk/shared";

const missing: string[] = [];
for await (const file of new Glob("app/(app)/**/page.tsx").scan(".")) {
  const route = file
    .replace(/^app\/\(app\)/, "")
    .replace(/\/page\.tsx$/, "")
    .replace(/\[[^\]]+\]/g, "sample") || "/";
  if (!featureForPath(route)) missing.push(route);
}
if (missing.length) {
  console.error("Pages without a release flag (add them to packages/shared/src/release.ts):");
  for (const m of missing) console.error("  " + m);
  process.exit(1);
}
console.log("All admin/store pages have a release flag.");
