"use client";
import { createContext, useContext } from "react";
import type { UserRole } from "@/lib/types";

/**
 * What the app shell shares with the page inside it.
 * - route: navigate and close menus
 * - setDialog: open the shared dialog (e.g. "Add company", "My profile")
 * - filter/setFilter: shared list filter used by companies and sales
 * - role: the preview role chosen in the profile menu (mock RBAC until auth exists)
 */
export type ShellValue = {
  pathname: string;
  title: string;
  role: UserRole;
  route: (path: string) => void;
  fmt: (paise: number) => string;
  setDialog: (name: string) => void;
  filter: string;
  setFilter: (value: string) => void;
};

export const ShellContext = createContext<ShellValue | null>(null);

export function useShell(): ShellValue {
  const value = useContext(ShellContext);
  if (!value) throw new Error("useShell must be used inside <AppShell>");
  return value;
}
