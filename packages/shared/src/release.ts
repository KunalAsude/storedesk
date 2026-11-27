// Release flags: which features each environment may show.
//
// Every page in the app belongs to exactly one feature below. A feature's status
// moves forward only when its stories are done (docs/stories/USER_STORIES.md):
//
//   planned  → idea only, page shows a TODO card
//   mock     → designed (v0), runs on mock data, nothing saved
//   building → backend being connected, may be half-working
//   beta     → connected to the real API and tested; try it on staging
//   live     → finished, tested on staging, safe for real shops
//
// What each environment (NEXT_PUBLIC_APP_STAGE / APP_STAGE) shows:
//   development → everything (with a status badge in the sidebar)
//   staging     → beta + live
//   production  → live only
//
// Per-company switches (plan modules, Admin → Company → Services) come on top of
// this later: a feature must be released here AND enabled for the company.

export const RELEASE_STATUSES = ["planned", "mock", "building", "beta", "live"] as const;
export type ReleaseStatus = (typeof RELEASE_STATUSES)[number];

export const APP_STAGES = ["development", "staging", "production"] as const;
export type AppStage = (typeof APP_STAGES)[number];

export type ReleaseFeature = {
  label: string;
  /** Route prefixes owned by this feature (longest match wins). */
  routes: string[];
  /** Story IDs that must be Done before the status can be "live". */
  stories: string[];
  status: ReleaseStatus;
};

const FEATURES = {
  // ---------- Admin (platform owners) ----------
  "admin.analytics": { label: "Analytics", routes: ["/admin/analytics", "/admin"], stories: ["US-ANA-01", "US-ANA-02", "US-ANA-03"], status: "mock" },
  "admin.companies": { label: "Companies", routes: ["/admin/companies"], stories: ["US-CMP-01", "US-CMP-02", "US-CMP-03", "US-CMP-04", "US-CMP-05"], status: "mock" },
  "admin.plans": { label: "Plans", routes: ["/admin/plans"], stories: ["US-SUB-01", "US-SUB-02", "US-SUB-03", "US-SUB-04"], status: "mock" },
  "admin.users": { label: "Users & invites", routes: ["/admin/users"], stories: ["US-USR-01", "US-USR-02", "US-USR-03"], status: "mock" },
  "admin.history": { label: "History", routes: ["/admin/history"], stories: ["US-HIS-01"], status: "mock" },
  "admin.themes": { label: "Themes", routes: ["/admin/themes"], stories: ["US-THM-01", "US-THM-02", "US-THM-05"], status: "mock" },
  "admin.settings": { label: "Platform settings", routes: ["/admin/settings"], stories: [], status: "mock" },

  // ---------- Store ----------
  "store.dashboard": { label: "Dashboard", routes: ["/store/dashboard", "/store"], stories: ["US-REP-01"], status: "mock" },
  "store.billing": { label: "Billing (POS)", routes: ["/store/billing"], stories: ["US-BIL-01", "US-BIL-02", "US-BIL-03", "US-BIL-04", "US-BIL-05", "US-BIL-06"], status: "mock" },
  "store.sales": { label: "Sales history", routes: ["/store/sales"], stories: ["US-SAL-01", "US-SAL-02", "US-SAL-03"], status: "mock" },
  "inventory.products": { label: "Products", routes: ["/store/inventory/products"], stories: ["US-INV-03", "US-INV-04"], status: "mock" },
  "inventory.categories": { label: "Categories", routes: ["/store/inventory/categories"], stories: ["US-INV-01", "US-INV-02"], status: "mock" },
  "inventory.stock": { label: "Stock", routes: ["/store/inventory/stock"], stories: ["US-INV-07", "US-INV-08"], status: "mock" },
  "inventory.purchases": { label: "Purchases", routes: ["/store/inventory/purchases"], stories: ["US-INV-05"], status: "mock" },
  "inventory.adjustments": { label: "Adjustments", routes: ["/store/inventory/adjustments"], stories: ["US-INV-06"], status: "mock" },
  "inventory.suppliers": { label: "Suppliers", routes: ["/store/inventory/suppliers"], stories: ["US-INV-09"], status: "mock" },
  "store.customers": { label: "Customers", routes: ["/store/customers"], stories: ["US-CUS-01", "US-CUS-02"], status: "mock" },
  "store.staff": { label: "Staff", routes: ["/store/staff"], stories: ["US-STF-01", "US-STF-02"], status: "mock" },
  "store.reports": { label: "Reports", routes: ["/store/reports"], stories: ["US-REP-02", "US-REP-03"], status: "mock" },
  "store.settings": { label: "Store settings", routes: ["/store/settings"], stories: ["US-STO-02"], status: "mock" },

  // ---------- Coming soon ----------
  "store.offers": { label: "Offers", routes: ["/store/offers"], stories: ["US-TODO-01"], status: "planned" },
  "store.online-store": { label: "Online store", routes: ["/store/online-store"], stories: ["US-TODO-02"], status: "planned" },
  "store.enquiries": { label: "Enquiries", routes: ["/store/enquiries"], stories: ["US-TODO-03"], status: "planned" },
  "store.expenses": { label: "Expenses", routes: ["/store/expenses"], stories: ["US-TODO-04"], status: "planned" },
  "store.branches": { label: "Branches", routes: ["/store/branches"], stories: ["US-TODO-05"], status: "planned" },
  "store.integrations": { label: "Integrations", routes: ["/store/integrations"], stories: ["US-TODO-06"], status: "planned" },
} satisfies Record<string, ReleaseFeature>;

export type FeatureKey = keyof typeof FEATURES;
/** The release list. Change a feature's status here when its stories are done. */
export const RELEASE: Record<FeatureKey, ReleaseFeature> = FEATURES;

const VISIBLE: Record<AppStage, readonly ReleaseStatus[]> = {
  development: RELEASE_STATUSES,
  staging: ["beta", "live"],
  production: ["live"],
};

/** Unknown or missing values fall back to "production" so nothing unfinished leaks by mistake. */
export function parseStage(value: string | undefined | null): AppStage {
  return (APP_STAGES as readonly string[]).includes(value ?? "") ? (value as AppStage) : "production";
}

export function isStatusVisible(status: ReleaseStatus, stage: AppStage): boolean {
  return VISIBLE[stage].includes(status);
}

/** The feature that owns a path (longest matching route prefix), or undefined. */
export function featureForPath(path: string): FeatureKey | undefined {
  let best: { key: FeatureKey; len: number } | undefined;
  for (const [key, f] of Object.entries(RELEASE) as [FeatureKey, ReleaseFeature][]) {
    for (const r of f.routes) {
      if ((path === r || path.startsWith(r + "/")) && (!best || r.length > best.len)) best = { key, len: r.length };
    }
  }
  return best?.key;
}

export function isFeatureReleased(key: FeatureKey, stage: AppStage): boolean {
  return isStatusVisible(RELEASE[key].status, stage);
}

/**
 * Whether a page may be shown. Paths outside /admin and /store (login, public bill page)
 * are always allowed. A path under /admin or /store with no feature is hidden outside
 * development, so a new page can't reach production without being registered here.
 */
export function isPathReleased(path: string, stage: AppStage): boolean {
  if (!path.startsWith("/admin") && !path.startsWith("/store")) return true;
  const key = featureForPath(path);
  if (!key) return stage === "development";
  return isFeatureReleased(key, stage);
}
