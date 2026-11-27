"use client";
import { ProductDetailPage } from "@/components/store/product-detail";
import { useShell } from "@/components/layout/shell-context";
import { usePathname } from "next/navigation";

export default function Page() {
  const { route, setDialog } = useShell();
  const id = usePathname().split("/").filter(Boolean).at(-1) ?? "";
  return <ProductDetailPage productId={id} route={route} setDialog={setDialog} />;
}
