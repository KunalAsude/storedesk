"use client";
import { BillsTable } from "@/components/store/bills-table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { bills } from "@/lib/mock/data";
import { formatINR } from "@storedesk/shared";
import {
    Download,
    Filter,
    Search
} from "lucide-react";
import { toast } from "sonner";

export function SalesPage({ fmt = formatINR, filter, setFilter, route }: any) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">SELL</div>
          <h1>Sales history</h1>
          <p>Every bill, right where you need it.</p>
        </div>
        <button
          className="button secondary"
          onClick={() => toast("CSV export prepared")}
        >
          <Download />
          Export
        </button>
      </div>
      <div className="stats-grid compact-stats">
        <div className="metric-card">
          <small>Sales this month</small>
          <b>{fmt(28450000)}</b>
        </div>
        <div className="metric-card">
          <small>Bills</small>
          <b>142</b>
        </div>
        <div className="metric-card">
          <small>UPI collected</small>
          <b>{fmt(14820000)}</b>
        </div>
        <div className="metric-card">
          <small>Udhaar due</small>
          <b>{fmt(428500)}</b>
        </div>
      </div>
      <div className="panel">
        <div className="list-toolbar">
          <div className="search-field">
            <Search />
            <input placeholder="Search bill number or customer" />
          </div>
          <button className="button secondary">
            <Filter />
            Date range
          </button>
          <Select
            value={filter}
            onValueChange={(value) => value && setFilter(value)}
          >
            <SelectTrigger className="select-control" aria-label="Filter sales">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["All", "Paid", "Udhaar", "Cash", "UPI"].map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <BillsTable
          rows={bills.filter(
            (b) =>
              filter === "All" || b.status === filter || b.payment === filter,
          )}
          fmt={fmt}
        />
      </div>
    </>
  );
}
