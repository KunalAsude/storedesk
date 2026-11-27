"use client";
import { ProductsPage } from "@/components/store/products-page";
import { useShell } from "@/components/layout/shell-context";

export default function Page() {
  const { fmt, route, setDialog, pathname } = useShell();
  return <ProductsPage {...{ fmt, route, setDialog, pathname }} />;
}
