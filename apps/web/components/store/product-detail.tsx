"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, Package, Plus } from "lucide-react";
import { toast } from "sonner";
import { bills, products } from "@/lib/mock/data";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const movementHistory = [
  ["26 Nov 2026, 4:12 pm", "Sale", "−1", "BH/26-27/0142", "Pooja Shinde"],
  ["25 Nov 2026, 11:32 am", "Purchase", "+12", "PO/26-27/022", "Rahul Patil"],
  [
    "22 Nov 2026, 9:10 am",
    "Count correction",
    "+2",
    "ADJ/26-27/018",
    "Ganesh Kale",
  ],
  ["19 Nov 2026, 5:42 pm", "Damage", "−1", "ADJ/26-27/016", "Rahul Patil"],
];
const salesTrend = [
  { week: "03 Nov", units: 12 },
  { week: "10 Nov", units: 18 },
  { week: "17 Nov", units: 15 },
  { week: "24 Nov", units: 22 },
];
const formatINR = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: paise % 100 ? 2 : 0,
  }).format(paise / 100);

export function ProductDetailPage({
  productId,
  route,
  setDialog,
}: {
  productId: string;
  route: (path: string) => void;
  setDialog: (value: string) => void;
}) {
  const product = useMemo(
    () => products.find((item) => item.id === productId) ?? products[0],
    [productId],
  );
  const [tab, setTab] = useState("Variants");
  const tabs = ["Variants", "History", "Sales"];
  const stockFor = (sizeIndex: number, colorIndex: number) => {
    const count = product.sizes.length * product.colors.length;
    const index = colorIndex * product.sizes.length + sizeIndex;
    return (
      Math.floor(product.stock / count) +
      (index < product.stock % count ? 1 : 0)
    );
  };

  return (
    <>
      <div className="page-heading">
        <div className="detail-product-title">
          <button
            className="icon-btn"
            aria-label="Back to products"
            onClick={() => route("/store/inventory/products")}
          >
            <ArrowLeft />
          </button>
          <span className="company-avatar large">
            {product.name
              .split(" ")
              .map((word) => word[0])
              .join("")
              .slice(0, 2)}
          </span>
          <div>
            <div className="eyebrow">INVENTORY · PRODUCT</div>
            <h1>{product.name}</h1>
            <p>
              <span className="mono">{product.sku}</span> · {product.category}
            </p>
          </div>
        </div>
        <div className="heading-action">
          <button
            className="button secondary"
            onClick={() => setDialog("Stock in")}
          >
            <Plus />
            Stock in
          </button>
          <button
            className="button primary"
            onClick={() =>
              route(`/store/inventory/products/${product.id}/edit`)
            }
          >
            Edit product
          </button>
        </div>
      </div>
      <div className="stats-grid compact-stats">
        <div className="metric-card">
          <small>Selling price</small>
          <b>{formatINR(product.price)}</b>
        </div>
        <div className="metric-card">
          <small>Stock on hand</small>
          <b>{product.stock} units</b>
        </div>
        <div className="metric-card">
          <small>Variants</small>
          <b>{product.sizes.length * product.colors.length}</b>
        </div>
      </div>
      <div className="tabs-row" role="tablist" aria-label="Product details">
        {tabs.map((item) => (
          <button
            role="tab"
            aria-selected={tab === item}
            className={tab === item ? "active" : ""}
            key={item}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>
      {tab === "Variants" && (
        <section className="panel table-panel">
          <div className="panel-head">
            <div>
              <h2>Stock by size and colour</h2>
              <p>Available inventory for each product variant.</p>
            </div>
            <button
              className="button secondary"
              onClick={() => setDialog("Adjust stock")}
            >
              Adjust stock
            </button>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Colour</th>
                  {product.sizes.map((size) => (
                    <th key={size}>{size}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {product.colors.map((color, colorIndex) => (
                  <tr key={color}>
                    <td>
                      <b>{color}</b>
                    </td>
                    {product.sizes.map((size, sizeIndex) => {
                      const stock = stockFor(sizeIndex, colorIndex);
                      return (
                        <td
                          key={size}
                          className={
                            stock === 0
                              ? "stock-zero"
                              : stock < 3
                                ? "stock-low"
                                : ""
                          }
                        >
                          {stock}
                          <small className="sub-cell">
                            {product.sku}-{color.slice(0, 3).toUpperCase()}-
                            {size}
                          </small>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {tab === "History" && (
        <section className="panel table-panel">
          <div className="panel-head">
            <div>
              <h2>Movement ledger</h2>
              <p>Every stock change recorded for this product.</p>
            </div>
            <button
              className="button secondary"
              onClick={() => toast("Movement history exported")}
            >
              Export
            </button>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Reference</th>
                  <th>By</th>
                </tr>
              </thead>
              <tbody>
                {movementHistory.map(([date, type, quantity, ref, by]) => (
                  <tr key={ref}>
                    <td>{date}</td>
                    <td>
                      <span className="status-badge neutral">{type}</span>
                    </td>
                    <td>{quantity}</td>
                    <td className="mono">{ref}</td>
                    <td>{by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {tab === "Sales" && (
        <>
          <div className="dashboard-grid">
            <section className="panel chart-panel">
              <div className="panel-head">
                <div>
                  <h2>Units sold</h2>
                  <p>Weekly sales this month</p>
                </div>
                <span className="trend-tag">
                  <ArrowUpRight />
                  18.2%
                </span>
              </div>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrend}>
                    <CartesianGrid
                      stroke="var(--border)"
                      strokeDasharray="3 4"
                      vertical={false}
                    />
                    <XAxis dataKey="week" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Area
                      dataKey="units"
                      stroke="var(--chart-1)"
                      fill="var(--chart-1)"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>
            <section className="panel">
              <h2>Sales summary</h2>
              <div className="metric-card">
                <small>Units sold this month</small>
                <b>67</b>
              </div>
              <div className="metric-card">
                <small>Revenue this month</small>
                <b>{formatINR(product.price * 67)}</b>
              </div>
            </section>
          </div>
          <section className="panel recent-panel">
            <div className="panel-head">
              <div>
                <h2>Recent bills</h2>
                <p>Latest sales containing this product.</p>
              </div>
            </div>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Bill no.</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Payment</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.slice(0, 5).map((bill) => (
                    <tr key={bill.id}>
                      <td className="mono">{bill.id}</td>
                      <td>{bill.date}</td>
                      <td>{bill.customer}</td>
                      <td>{bill.payment}</td>
                      <td>{formatINR(bill.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </>
  );
}
