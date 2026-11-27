// Roles and theme names shared by the API and the web app.

export const PLATFORM_ROLES = ["Super admin", "Admin", "Support"] as const;
export const STORE_ROLES = ["Owner", "Manager", "Cashier", "Stock staff"] as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[number];
export type StoreRole = (typeof STORE_ROLES)[number];
export type UserRole = PlatformRole | StoreRole;

export function isPlatformRole(role: UserRole): role is PlatformRole {
  return (PLATFORM_ROLES as readonly string[]).includes(role);
}

// Short keys stored in the database. Labels above are for the UI only.
export const PLATFORM_ROLE_KEYS = ["super_admin", "admin", "support"] as const;
export const STORE_ROLE_KEYS = ["owner", "manager", "cashier", "stock_staff"] as const;

export type PlatformRoleKey = (typeof PLATFORM_ROLE_KEYS)[number];
export type StoreRoleKey = (typeof STORE_ROLE_KEYS)[number];
export type RoleKey = PlatformRoleKey | StoreRoleKey;

export const ROLE_LABELS: Record<RoleKey, UserRole> = {
  super_admin: "Super admin",
  admin: "Admin",
  support: "Support",
  owner: "Owner",
  manager: "Manager",
  cashier: "Cashier",
  stock_staff: "Stock staff",
};

export const THEME_NAMES = ["brown", "sage", "graphite", "olive", "maroon", "terracotta"] as const;
export type ThemeName = (typeof THEME_NAMES)[number];

export type CompanyStatus = "Active" | "Trial" | "Past due" | "Expired" | "Paused" | "Cancelled";
export type PlanName = "Free" | "Plus" | "Pro";
