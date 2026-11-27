"use client";
import { TodoPage } from "@/components/common/todo-page";
import { useShell } from "@/components/layout/shell-context";

export default function Page() {
  const { title } = useShell();
  return <TodoPage title={title} />;
}
