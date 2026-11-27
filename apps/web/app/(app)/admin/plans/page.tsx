"use client";
import { PlansPage } from "@/components/admin/plans-page";
import { useShell } from "@/components/layout/shell-context";
import { companies } from "@/lib/mock/data";

export default function Page() {
  const { filter, setFilter, route, fmt, setDialog } = useShell();
  return <PlansPage {...{ companies, filter, setFilter, route, fmt, setDialog }} />;
}
