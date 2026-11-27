"use client";

export function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "Active"
      ? "success"
      : status === "Trial"
        ? "info"
        : status === "Past due"
          ? "danger"
          : status === "Paused"
            ? "neutral"
            : "muted";
  return (
    <span className={`status-badge ${cls}`}>
      <i />
      {status}
    </span>
  );
}
