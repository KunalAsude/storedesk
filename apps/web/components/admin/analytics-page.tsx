"use client";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { TodoCard } from "@/components/common/todo-card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { monthlyMrr } from "@/lib/mock/data";
import type { Company } from "@/lib/types";
import {
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    Building2,
    CalendarDays,
    FileText,
    Wallet
} from "lucide-react";
import { useState } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import { toast } from "sonner";

export function AnalyticsPage({
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
            <h1>Analytics</h1>
            <p>A clear view of StoreDesk, across every shop.</p>
          </div>
          <Select
            value={range}
            onValueChange={(value) => value && setRange(value)}
          >
            <SelectTrigger
              className="select-control"
              aria-label="Analytics date range"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Last 30 days", "Last 90 days", "Last 12 months"].map(
                (item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="stats-grid admin-stats">
          {[
            ["Monthly recurring revenue", "₹1,19,700", "+8.4%", Wallet],
            ["Active companies", "42", "+3 this month", Building2],
            ["New this month", "8", "+2 vs last month", ArrowRight],
            ["Trials ending in 7 days", "3", "Needs attention", CalendarDays],
            ["Churned this month", "2", "−1 vs last month", ArrowDownRight],
            ["Bills processed today", "2,841", "+14.2%", FileText],
          ].map(([l, v, d, i]: any) => (
            <StatCard key={l} label={l} value={v} delta={d} icon={i} />
          ))}
        </div>
        <div className="dashboard-grid admin-charts">
          <section className="panel chart-panel">
            <div className="panel-head">
              <div>
                <h2>Monthly recurring revenue</h2>
                <p>Revenue growth over 12 months</p>
              </div>
              <span className="trend-tag">
                <ArrowUpRight />
                12.4%
              </span>
            </div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyMrr.map((point) => ({
                    ...point,
                    amount: point.mrr * 40000,
                  }))}
                >
                  <CartesianGrid
                    stroke="var(--border)"
                    strokeDasharray="3 4"
                    vertical={false}
                  />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis
                    domain={[0, 320000]}
                    ticks={[0, 40000, 80000, 120000, 160000, 200000, 240000, 280000, 320000]}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(amount: number) => {
                      if (amount === 0) return "₹0";
                      if (amount < 100000) return `₹${amount / 1000}k`;
                      return `₹${(amount / 100000).toFixed(1)}L`;
                    }}
                  />
                  <Tooltip
                    formatter={(value: any) => [
                      `₹${Number(value).toLocaleString("en-IN")}`,
                      "Monthly recurring revenue",
                    ]}
                    labelFormatter={(label) => `${label} 2026`}
                  />
                  <Area
                    dataKey="amount"
                    stroke="var(--chart-1)"
                    fill="var(--chart-1)"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section className="panel category-panel">
            <div className="panel-head">
              <div>
                <h2>Companies by plan</h2>
                <p>42 paying companies</p>
              </div>
            </div>
            <div className="donut-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Free", value: 10 },
                      { name: "Plus", value: 18 },
                      { name: "Pro", value: 14 },
                    ]}
                    innerRadius={66}
                    outerRadius={90}
                    dataKey="value"
                  >
                    {[1, 2, 3].map((i) => (
                      <Cell key={i} fill={`var(--chart-${i})`} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <b>42</b>
                <small>Companies</small>
              </div>
            </div>
            <div className="category-legend">
              <span>
                <i style={{ background: "var(--chart-1)" }} />
                Free <b>10</b>
              </span>
              <span>
                <i style={{ background: "var(--chart-2)" }} />
                Plus <b>18</b>
              </span>
              <span>
                <i style={{ background: "var(--chart-3)" }} />
                Pro <b>14</b>
              </span>
            </div>
          </section>
        </div>
        <section className="panel table-panel">
          <div className="panel-head">
            <div>
              <h2>Expiring in the next 14 days</h2>
              <p>Accounts to follow up with this week</p>
            </div>
            <button
              className="text-action"
              onClick={() => route("/admin/companies")}
            >
              All companies <ArrowRight />
            </button>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Plan</th>
                  <th>Expires</th>
                  <th>Owner</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {expiring.map((c: Company) => (
                  <tr key={c.id}>
                    <td>
                      <b>{c.name}</b>
                      <small className="sub-cell">{c.city}</small>
                    </td>
                    <td>
                      <span className={`plan-pill ${c.plan.toLowerCase()}`}>
                        {c.plan}
                      </span>
                    </td>
                    <td>{c.expiry}</td>
                    <td>{c.owner}</td>
                    <td>
                      <button
                        className="button small secondary"
                        onClick={() =>
                          toast("Subscription extended by 30 days")
                        }
                      >
                        Extend
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel table-panel">
          <div className="panel-head">
            <div>
              <h2>Past due</h2>
              <p>Accounts requiring a payment follow-up</p>
            </div>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Plan</th>
                  <th>Due since</th>
                  <th>Owner</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pastDue.map((c: Company) => (
                  <tr key={c.id}>
                    <td>
                      <b>{c.name}</b>
                      <small className="sub-cell">{c.city}</small>
                    </td>
                    <td>
                      <span className={`plan-pill ${c.plan.toLowerCase()}`}>
                        {c.plan}
                      </span>
                    </td>
                    <td>{c.expiry}</td>
                    <td>{c.owner}</td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <div className="dashboard-grid">
          <TodoCard
            title="More analytics"
            desc="Revenue by city, feature usage, cohorts and more detailed growth insights are on the roadmap."
          />
        </div>
      </>
    );
}
