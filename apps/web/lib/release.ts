import { featureForPath, parseStage, RELEASE, type AppStage, type ReleaseStatus } from "@storedesk/shared";

/**
 * Which environment this build is for. Set NEXT_PUBLIC_APP_STAGE on the host:
 *   Vercel/Cloudflare production → "production", preview deployments → "staging".
 * Without it: `next dev` = development (show everything), any build = production (live only).
 */
export const APP_STAGE: AppStage = process.env.NEXT_PUBLIC_APP_STAGE
  ? parseStage(process.env.NEXT_PUBLIC_APP_STAGE)
  : process.env.NODE_ENV === "development"
    ? "development"
    : "production";

/** Status of the feature that owns a path, for the dev-only sidebar badge. */
export function releaseStatusForPath(path: string): ReleaseStatus | undefined {
  const key = featureForPath(path);
  return key ? RELEASE[key].status : undefined;
}
