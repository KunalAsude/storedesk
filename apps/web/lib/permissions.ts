import { hasPermission, type Permission, type UserRole } from "@storedesk/shared";
import { useMemo } from "react";

export { hasPermission, type Permission };

export function useCan(role: UserRole) {
  return useMemo(() => (permission: Permission) => hasPermission(role, permission), [role]);
}
