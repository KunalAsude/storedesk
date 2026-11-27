"use client";
import { UtilityPage } from "@/components/store/inventory-page";
import { useShell } from "@/components/layout/shell-context";

export default function Page() {
  const { pathname, title, setDialog } = useShell();
  return <UtilityPage path={pathname} title={title} setDialog={setDialog} />;
}
