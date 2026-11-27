"use client";
import { StaffPage } from "@/components/store/staff-page";
import { useShell } from "@/components/layout/shell-context";

export default function Page() {
  const { setDialog } = useShell();
  return <StaffPage setDialog={setDialog} />;
}
