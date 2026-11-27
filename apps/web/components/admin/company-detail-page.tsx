"use client";
import { CompanyDetail } from "@/components/admin/company-detail";
import type { Company } from "@/lib/types";
import { useState } from "react";

export function CompanyDetailPage({
  companyId,
  companies,
  setDialog,
}: {
  companyId: string;
  companies: Company[];
  setDialog: (name: string) => void;
}) {
  const [tab, setTab] = useState("Overview");
  return (
    <CompanyDetail
      company={companies.find((c) => c.id === decodeURIComponent(companyId)) || companies[0]}
      tab={tab}
      setTab={setTab}
      setDialog={setDialog}
    />
  );
}
