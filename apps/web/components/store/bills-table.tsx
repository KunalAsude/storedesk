"use client";
import type { Bill } from "@/lib/types";
import { formatINR } from "@storedesk/shared";
import {
    MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";

export function BillsTable({
  rows,
  fmt = formatINR,
}: {
  rows: Bill[];
  fmt?: (n: number) => string;
}) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Bill no.</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Payment</th>
            <th>Total</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.id}>
              <td className="mono">{b.id}</td>
              <td>{b.date}</td>
              <td>{b.customer}</td>
              <td>
                <span className="payment-badge">{b.payment}</span>
              </td>
              <td className="strong">{fmt(b.total)}</td>
              <td>
                <span
                  className={`status-badge ${b.status === "Paid" ? "success" : "warning"}`}
                >
                  {b.status}
                </span>
              </td>
              <td>
                <button
                  className="icon-btn tiny"
                  onClick={() => toast("Bill actions opened")}
                  aria-label="Bill actions"
                >
                  <MoreHorizontal />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
