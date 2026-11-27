"use client";
import {
    ArrowUpRight
} from "lucide-react";

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta: string;
  icon: any;
}) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <Icon />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-bottom">
        <span className="positive">
          <ArrowUpRight />
          {delta}
        </span>
        <span>vs previous period</span>
      </div>
      <div className="sparkline">
        <svg viewBox="0 0 100 24" preserveAspectRatio="none">
          <path d="M0 19 C12 18 13 11 24 15 S35 9 45 12 S60 4 70 10 S86 2 100 4" />
        </svg>
      </div>
    </article>
  );
}
