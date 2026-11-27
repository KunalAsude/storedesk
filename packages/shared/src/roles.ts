// Roles and theme names shared by the API and the web app.

export const PLATFORM_ROLES = ["Super admin", "Admin", "Support"] as const;
export const STORE_ROLES = ["Owner", "Manager", "Cashier", "Stock staff"] as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[number];
export type StoreRole = (typeof STORE_ROLES)[number];
export type UserRole = PlatformRole | StoreRole;

export function isPlatformRole(role: UserRole): role is PlatformRole {
  return (PLATFORM_ROLES as readonly string[]).includes(role);
}

export const THEME_NAMES = ["brown", "sage", "graphite", "olive", "maroon", "terracotta"] as const;
export type ThemeName = (typeof THEME_NAMES)[number];

export type CompanyStatus = "Active" | "Trial" | "Past due" | "Expired" | "Paused" | "Cancelled";
export type PlanName = "Free" | "Plus" | "Pro";
