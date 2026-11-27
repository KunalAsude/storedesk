"use client";
import {
    ShoppingBag
} from "lucide-react";

export function TodoCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="todo-card">
      <span className="todo-icon">
        <ShoppingBag />
      </span>
      <span>
        <b>{title}</b>
        <small>{desc}</small>
      </span>
      <span className="planned-badge">Planned</span>
    </div>
  );
}
