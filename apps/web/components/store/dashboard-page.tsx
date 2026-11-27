"use client";
import { BillsTable } from "@/components/store/bills-table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    bills,
    products,
    salesByDay
} from "@/lib/mock/data";
import {
    ArrowDownLeft,
    ArrowRight,
    ArrowUpRight,
    Boxes,
    ChevronDown,
    CreditCard,
    Ellipsis,
    FileText,
    HandCoins,
    Package,
    Plus,
    Users,
    Wallet
} from "lucide-react";
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

function PageHeading({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && <div className="heading-action">{action}</div>}
    </div>
  );
}

function StatCard({
  label,
  value,
  delta,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta: string;
  icon: typeof Wallet;
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

export function DashboardPage({
  route,
  fmt,
}: {
  route: (p: string) => void;
  fmt: (n: number) => string;
}) {
  return (
    <>
      <PageHeading
        eyebrow="THURSDAY, 26 NOVEMBER 2026"
        title="Good evening, Rahul"
        subtitle="Here’s what’s happening at Brand Hub Mens Wear today."
        action={
          <Select defaultValue="Today">
            <SelectTrigger className="select-control" aria-label="Date range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Today">Today</SelectItem>
              <SelectItem value="Last 7 days">Last 7 days</SelectItem>
              <SelectItem value="Last 30 days">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        }
      />
      <div className="quick-actions">
        <button
          className="button primary"
          onClick={() => route("/store/billing")}
        >
          <Plus />
          New bill
        </button>
        <button
          className="button secondary"
          onClick={() => route("/store/inventory/products/new")}
        >
          <Package />
          Add product
        </button>
        <button
          className="button secondary"
          onClick={() => route("/store/inventory/purchases")}
        >
          <ArrowDownLeft />
          Stock in
        </button>
        <button
          className="button secondary"
          onClick={() => route("/store/customers")}
        >
          <Users />
          Add customer
        </button>
      </div>
      <div className="stats-grid">
        {[
          ["Today's sales", fmt(2845000), "+12.8%", Wallet],
          ["Bills today", "18", "+3 from yesterday", FileText],
          ["Average bill", fmt(158060), "+4.2%", CreditCard],
          ["Items sold", "42", "+8.1%", Package],
          ["Udhaar outstanding", fmt(4285000), "-2.4%", HandCoins],
          ["Stock value", fmt(284500000), "+6.3%", Boxes],
        ].map(([l, v, d, i]) => (
          <StatCard
            key={l as string}
            label={l as string}
            value={v as string}
            delta={d as string}
            icon={i as typeof Wallet}
          />
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel chart-panel">
          <div className="panel-head">
            <div>
              <h2>Sales overview</h2>
              <p>Daily revenue by payment method</p>
            </div>
            <button className="button subtle">
              This week <ChevronDown />
            </button>
          </div>
          <div className="chart-legend">
            <span>
              <i className="legend-cash" />
              Cash
            </span>
            <span>
              <i className="legend-upi" />
              UPI
            </span>
            <span>
              <i className="legend-card" />
              Card
            </span>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesByDay}>
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="3 4"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <Tooltip formatter={(v) => fmt(Number(v) * 100)} />
                <Area
                  type="monotone"
                  dataKey="cash"
                  stackId="1"
                  stroke="var(--chart-1)"
                  fill="var(--chart-1)"
                  fillOpacity={0.45}
                />
                <Area
                  type="monotone"
                  dataKey="upi"
                  stackId="1"
                  stroke="var(--chart-2)"
                  fill="var(--chart-2)"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="card"
                  stackId="1"
                  stroke="var(--chart-3)"
                  fill="var(--chart-3)"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="panel category-panel">
          <div className="panel-head">
            <div>
              <h2>Sales by category</h2>
              <p>Today’s sales mix</p>
            </div>
            <button className="icon-btn">
              <Ellipsis />
            </button>
          </div>
          <div className="donut-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Shirts", value: 44 },
                    { name: "Trousers", value: 27 },
                    { name: "Jackets", value: 18 },
                    { name: "Accessories", value: 11 },
                  ]}
                  innerRadius={65}
                  outerRadius={91}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {[0, 1, 2, 3].map((i) => (
                    <Cell key={i} fill={`var(--chart-${i + 1})`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center">
              <b>{fmt(2845000)}</b>
              <small>Total sales</small>
            </div>
          </div>
          <div className="category-legend">
            {[
              ["Shirts", "44%"],
              ["Trousers", "27%"],
              ["Jackets", "18%"],
              ["Accessories", "11%"],
            ].map((x, i) => (
              <span key={x[0]}>
                <i style={{ background: `var(--chart-${i + 1})` }} />
                {x[0]}
                <b>{x[1]}</b>
              </span>
            ))}
          </div>
        </section>
      </div>
      <div className="dashboard-grid lower-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Top products</h2>
              <p>Best sellers this week</p>
            </div>
            <button
              className="text-action"
              onClick={() => route("/store/inventory/products")}
            >
              View all <ArrowRight />
            </button>
          </div>
          <div className="rank-list">
            {products.slice(0, 4).map((p, i) => (
              <div className="rank-row" key={p.id}>
                <span className="rank-number">0{i + 1}</span>
                <span className="product-thumb">
                  {p.name
                    .split(" ")
                    .map((a) => a[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <span className="rank-name">
                  {p.name}
                  <small>{p.category}</small>
                </span>
                <b>{[32, 24, 18, 12][i]} sold</b>
                <strong>{fmt(p.price * [32, 24, 18, 12][i])}</strong>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Low stock</h2>
              <p>Reorder before you run out</p>
            </div>
            <button
              className="text-action"
              onClick={() => route("/store/inventory/stock")}
            >
              See stock <ArrowRight />
            </button>
          </div>
          {products
            .filter((p) => p.stock < 15)
            .map((p) => (
              <div className="low-stock-row" key={p.id}>
                <span className="product-thumb">
                  {p.name
                    .split(" ")
                    .map((a) => a[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <span>
                  {p.name}
                  <small>{p.sku}</small>
                </span>
                <span
                  className={`stock-number ${p.stock < 5 ? "critical" : ""}`}
                >
                  {p.stock} left
                </span>
                <button
                  className="button small secondary"
                  onClick={() => route("/store/inventory/purchases")}
                >
                  Stock in
                </button>
              </div>
            ))}
        </section>
      </div>
      <section className="panel recent-panel">
        <div className="panel-head">
          <div>
            <h2>Recent bills</h2>
            <p>Your latest customer transactions</p>
          </div>
          <button className="text-action" onClick={() => route("/store/sales")}>
            All sales <ArrowRight />
          </button>
        </div>
        <BillsTable fmt={fmt} rows={bills.slice(0, 5)} />
      </section>
    </>
  );
}
