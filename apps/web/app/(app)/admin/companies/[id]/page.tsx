"use client";
import { CompanyDetailPage } from "@/components/admin/company-detail-page";
import { useShell } from "@/components/layout/shell-context";
import { companies } from "@/lib/mock/data";
import { usePathname } from "next/navigation";

export default function Page() {
  const { setDialog } = useShell();
  const id = usePathname().split("/").filter(Boolean).at(-1) ?? "";
  return <CompanyDetailPage companyId={id} companies={companies} setDialog={setDialog} />;
}
