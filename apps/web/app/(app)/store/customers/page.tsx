"use client";
import { CustomersPage } from "@/components/store/customers-page";
import { useShell } from "@/components/layout/shell-context";

export default function Page() {
  const { route, fmt } = useShell();
  return <CustomersPage route={route} fmt={fmt} />;
}
