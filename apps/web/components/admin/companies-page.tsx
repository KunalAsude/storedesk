"use client";
import { StatusBadge } from "@/components/common/status-badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Company } from "@/lib/types";
import {
    Building2,
    ChevronLeft,
    ChevronRight,
    Filter,
    MoreHorizontal,
    Plus,
    Search
} from "lucide-react";
import { useState } from "react";

export function CompaniesPage({
  companies,
  filter,
  setFilter,
  route,
  fmt,
  setDialog,
}: any) {
  const [tab, setTab] = useState("Overview");
  const [range, setRange] = useState("Last 30 days");
  const [term, setTerm] = useState("");
  const filtered = companies.filter(
    (c: Company) =>
      (!term ||
        `${c.name} ${c.owner} ${c.city}`
          .toLowerCase()
          .includes(term.toLowerCase())) &&
      (filter === "All" || c.status === filter || c.plan === filter),
  );
  const demoToday = Date.UTC(2026, 10, 26);
  const expiring = companies.filter((c: Company) => {
    const expiresAt = Date.parse(`${c.expiry} 00:00:00 UTC`);
    return (
      ["Active", "Trial"].includes(c.status) &&
      expiresAt >= demoToday &&
      expiresAt <= demoToday + 14 * 86400000
    );
  });
  const pastDue = companies.filter((c: Company) => c.status === "Past due");
    return (
      <>
        <div className="page-heading">
          <div>
            <div className="eyebrow">PLATFORM ADMIN</div>
            <h1>Companies</h1>
            <p>Manage your customers, plans and subscriptions.</p>
          </div>
          <button
            className="button primary"
            onClick={() => setDialog("Add company")}
          >
            <Plus />
            Add company
          </button>
        </div>
        <div className="summary-strip">
          <span>
            <b>5</b> companies
          </span>
          <span>
            <b>3</b> active
          </span>
          <span>
            <b>₹1,19,700</b> monthly revenue
          </span>
          <span>
            <b>1</b> trial ending soon
          </span>
        </div>
        <div className="panel table-panel">
          <div className="list-toolbar">
            <div className="search-field">
              <Search />
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search companies"
              />
            </div>
            <Select
              value={filter}
              onValueChange={(value) => value && setFilter(value)}
            >
              <SelectTrigger
                className="select-control"
                aria-label="Filter companies"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "All",
                  "Active",
                  "Trial",
                  "Past due",
                  "Expired",
                  "Paused",
                  "Pro",
                  "Plus",
                  "Free",
                ].map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button className="button secondary">
              <Filter />
              More filters
            </button>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Owner</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Stores</th>
                  <th>Users</th>
                  <th>Expires on</th>
                  <th>Last active</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((c: Company) => (
                  <tr key={c.id}>
                    <td data-label="Company">
                      <button
                        className="company-cell"
                        onClick={() => route(`/admin/companies/${c.id}`)}
                      >
                        <span className="company-avatar">
                          {c.name.slice(0, 2).toUpperCase()}
                        </span>
                        <span>
                          <b>{c.name}</b>
                          <small>{c.city}</small>
                        </span>
                      </button>
                    </td>
                    <td data-label="Owner">
                      {c.owner}
                      <small className="sub-cell">{c.email}</small>
                    </td>
                    <td data-label="Plan">
                      <span className={`plan-pill ${c.plan.toLowerCase()}`}>
                        {c.plan}
                      </span>
                    </td>
                    <td data-label="Status">
                      <StatusBadge status={c.status} />
                    </td>
                    <td data-label="Stores">{c.stores}</td>
                    <td data-label="Users">{c.users}</td>
                    <td data-label="Expires">{c.expiry}</td>
                    <td data-label="Last active">Today</td>
                    <td>
                      <button
                        className="icon-btn tiny"
                        onClick={() => setDialog(`Manage ${c.name}`)}
                      >
                        <MoreHorizontal />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length && (
              <div className="empty-state">
                <Building2 />
                <b>No companies found</b>
                <span>Try adjusting your search or filters.</span>
              </div>
            )}
          </div>
          <div className="pagination">
            <span>Showing {filtered.length} of 5 companies</span>
            <div>
              <button className="icon-btn tiny">
                <ChevronLeft />
              </button>
              <button className="page-number active">1</button>
              <button className="icon-btn tiny">
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      </>
    );
}
