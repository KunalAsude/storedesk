"use client";
import { AnalyticsPage } from "@/components/admin/analytics-page";
import { useShell } from "@/components/layout/shell-context";
import { companies } from "@/lib/mock/data";

export default function Page() {
  const { filter, setFilter, route, fmt, setDialog } = useShell();
  return <AnalyticsPage {...{ companies, filter, setFilter, route, fmt, setDialog }} />;
}
