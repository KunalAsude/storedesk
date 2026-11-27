"use client";
import { SimpleTable } from "@/components/common/simple-table";
import { formatINR } from "@storedesk/shared";
import {
    Filter,
    Plus,
    Search
} from "lucide-react";
import { toast } from "sonner";

export function CustomersPage({ route, fmt = formatINR }: any) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">PEOPLE</div>
          <h1>Customers</h1>
          <p>Relationships that keep your shop moving.</p>
        </div>
        <button
          className="button primary"
          onClick={() => toast("Add customer form opened")}
        >
          <Plus />
          Add customer
        </button>
      </div>
      <div className="stats-grid compact-stats">
        <div className="metric-card">
          <small>Customers</small>
          <b>286</b>
        </div>
        <div className="metric-card">
          <small>Returning customers</small>
          <b>64%</b>
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
            <input placeholder="Search by name or mobile" />
          </div>
          <button className="button secondary">
            <Filter />
            Filters
          </button>
        </div>
        <SimpleTable
          headers={[
            "Customer",
            "Mobile",
            "Visits",
            "Total spent",
            "Last visit",
            "Udhaar due",
          ]}
          rows={[
            [
              "Rahul Patil",
              "+91 98223 45678",
              "18",
              fmt(824500),
              "Today",
              fmt(0),
            ],
            [
              "Sagar Shinde",
              "+91 98221 23456",
              "12",
              fmt(512000),
              "Yesterday",
              fmt(149900),
            ],
            [
              "Amit Kale",
              "+91 98224 56789",
              "9",
              fmt(362500),
              "24 Nov",
              fmt(29900),
            ],
            [
              "Neha Jadhav",
              "+91 98220 11122",
              "6",
              fmt(184500),
              "22 Nov",
              fmt(0),
            ],
          ]}
        />
      </div>
    </>
  );
}
