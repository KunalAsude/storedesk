"use client";
import { CompaniesPage } from "@/components/admin/companies-page";
import { useShell } from "@/components/layout/shell-context";
import { companies } from "@/lib/mock/data";

export default function Page() {
  const { filter, setFilter, route, fmt, setDialog } = useShell();
  return <CompaniesPage {...{ companies, filter, setFilter, route, fmt, setDialog }} />;
}
