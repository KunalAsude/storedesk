"use client";
import { SaleDetailPage } from "@/components/store/sale-detail";
import { useShell } from "@/components/layout/shell-context";
import { usePathname } from "next/navigation";

export default function Page() {
  const { route, role } = useShell();
  const id = usePathname().split("/").filter(Boolean).at(-1) ?? "";
  return <SaleDetailPage billId={id} route={route} isOwner={role === "Owner"} />;
}
