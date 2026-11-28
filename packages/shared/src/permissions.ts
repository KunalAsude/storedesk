// Single source of permission keys. The API guards (@Can) and the web app (useCan)
// both read this file, so a page that is hidden in the UI is also refused by the API.
import { ROLE_LABELS, type RoleKey, type UserRole } from "./roles";

export const PERMISSIONS = [
  "dashboard.view",
  "billing.create",
  "sales.view",
  "inventory.view",
  "inventory.edit",
  "customers.view",
  "customers.edit",
  "reports.view",
  "staff.manage",
  "settings.manage",
  "admin.view",
  "company.manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const STORE_ALL: Permission[] = [
  "dashboard.view",
  "billing.create",
  "sales.view",
  "inventory.view",
  "inventory.edit",
  "customers.view",
  "customers.edit",
  "reports.view",
  "staff.manage",
  "settings.manage",
];

// Default grants per role. TODO(US-RBAC-04): owners can create custom roles.
export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  "Super admin": [...STORE_ALL, "admin.view", "company.manage"],
  Admin: [...STORE_ALL, "admin.view", "company.manage"],
  Support: ["dashboard.view", "sales.view", "inventory.view", "customers.view", "reports.view", "admin.view"],
  Owner: [...STORE_ALL, "company.manage"],
  Manager: [
    "dashboard.view",
    "billing.create",
    "sales.view",
    "inventory.view",
    "inventory.edit",
    "customers.view",
    "customers.edit",
    "reports.view",
    "staff.manage",
  ],
  Cashier: ["dashboard.view", "billing.create", "sales.view", "customers.view"],
  "Stock staff": ["dashboard.view", "inventory.view", "inventory.edit"],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/** Same check by database role key (`cashier`, `stock_staff`…), used by the API. */
export function roleKeyCan(role: RoleKey, permission: Permission): boolean {
  // Unknown key (old token, renamed role) → no permission, never a crash.
  if (!Object.hasOwn(ROLE_LABELS, role)) return false;
  return hasPermission(ROLE_LABELS[role], permission);
}
