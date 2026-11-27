"use client";
import { CustomerDetailPage } from "@/components/store/customer-detail";
import { useShell } from "@/components/layout/shell-context";
import { usePathname } from "next/navigation";

export default function Page() {
  const { route } = useShell();
  const id = usePathname().split("/").filter(Boolean).at(-1) ?? "";
  return <CustomerDetailPage customerId={id} route={route} />;
}
