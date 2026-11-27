"use client";
import { UsersPage } from "@/components/admin/users-page";
import { useShell } from "@/components/layout/shell-context";

export default function Page() {
  const { setDialog } = useShell();
  return <UsersPage setDialog={setDialog} />;
}
