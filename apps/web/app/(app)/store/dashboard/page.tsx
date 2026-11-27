"use client";
import { DashboardPage } from "@/components/store/dashboard-page";
import { useShell } from "@/components/layout/shell-context";

export default function Page() {
  const { route, fmt } = useShell();
  return <DashboardPage route={route} fmt={fmt} />;
}
