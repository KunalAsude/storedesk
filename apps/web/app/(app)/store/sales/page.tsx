"use client";
import { SalesPage } from "@/components/store/sales-page";
import { useShell } from "@/components/layout/shell-context";

export default function Page() {
  const { fmt, filter, setFilter, route } = useShell();
  return <SalesPage {...{ fmt, filter, setFilter, route }} />;
}
