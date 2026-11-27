"use client";
import { products } from "@/lib/mock/data";
import { formatINR } from "@storedesk/shared";
import {
    Plus,
    Search
} from "lucide-react";
import { useState } from "react";

export function UtilityPage({
  path,
  title,
  setDialog,
}: {
  path: string;
  title: string;
  setDialog: (s: string) => void;
}) {
  const groups = path.includes("categories")
    ? ["Departments", "Categories", "Sub-categories", "Size sets", "Colours"]
    : path.includes("stock")
      ? ["All variants", "Low stock", "Out of stock"]
      : path.includes("purchases")
        ? ["Purchase history", "New stock in"]
        : path.includes("adjustments")
          ? ["Adjustment history", "New adjustment"]
          : ["All suppliers", "Recent purchases"];
  const [active, setActive] = useState(groups[0]);
  const [term, setTerm] = useState("");
  const isCategories = path.includes("categories");
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">INVENTORY</div>
          <h1>{title}</h1>
          <p>
            {isCategories
              ? "Organise products into a catalogue that feels like your shop."
              : "A clear picture of the stock moving through your store."}
          </p>
        </div>
        <button
          className="button primary"
          onClick={() =>
            setDialog(
              isCategories
                ? "Add category"
                : path.includes("purchases")
                  ? "New stock in"
                  : "New adjustment",
            )
          }
        >
          <Plus />
          {isCategories
            ? "Add category"
            : path.includes("purchases")
              ? "New stock in"
              : "New adjustment"}
        </button>
      </div>
      {path.includes("stock") && (
        <div className="stats-grid compact-stats">
          {[
            ["Total units", "1,248"],
            ["Stock value at cost", "₹6,48,200"],
            ["Stock value at MRP", "₹9,84,500"],
            ["Low stock", "8"],
            ["Out of stock", "3"],
          ].map(([a, b]) => (
            <div className="metric-card" key={a}>
              <small>{a}</small>
              <b>{b}</b>
            </div>
          ))}
        </div>
      )}
      <div className="inventory-workspace">
        <aside className="inventory-tabs">
          {groups.map((g) => (
            <button
              key={g}
              className={active === g ? "active" : ""}
              onClick={() => setActive(g)}
            >
              {g}
            </button>
          ))}
        </aside>
        <section className="panel inventory-detail">
          <div className="list-toolbar">
            <div className="search-field">
              <Search />
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder={`Search ${active.toLowerCase()}`}
              />
            </div>
            <button className="button secondary">Filter</button>
          </div>
          {isCategories ? (
            <div className="category-columns">
              {["Departments", "Categories", "Sub-categories"].map((col, i) => (
                <div key={col}>
                  <h3>
                    {col}
                    <button
                      onClick={() => setDialog(`Add ${col.toLowerCase()}`)}
                      aria-label={`Add ${col}`}
                    >
                      <Plus />
                    </button>
                  </h3>
                  {(i === 0
                    ? ["Men's wear", "Kids' wear", "Accessories"]
                    : i === 1
                      ? ["Shirts", "Trousers", "Jackets", "Ethnic wear"]
                      : [
                          "Casual shirts",
                          "Formal shirts",
                          "Chinos",
                          "Winter wear",
                        ]
                  ).map((x, j) => (
                    <button
                      className={`category-item ${j === 0 ? "selected" : ""}`}
                      key={x}
                      onClick={(e) =>
                        e.currentTarget.classList.toggle("selected")
                      }
                    >
                      {x}
                      <span>
                        {i === 0
                          ? `${14 - j} categories`
                          : i === 1
                            ? `${8 - j} products`
                            : ""}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    {path.includes("purchases")
                      ? [
                          "Reference",
                          "Supplier",
                          "Date",
                          "Items",
                          "Total",
                          "Status",
                        ].map((x) => <th key={x}>{x}</th>)
                      : path.includes("suppliers")
                        ? [
                            "Supplier",
                            "Contact",
                            "Purchases",
                            "Last purchase",
                            "Balance",
                          ].map((x) => <th key={x}>{x}</th>)
                        : [
                            "Product / variant",
                            "SKU",
                            "On hand",
                            "Low stock at",
                            "Unit cost",
                            "Value",
                          ].map((x) => <th key={x}>{x}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {path.includes("purchases")
                    ? Array.from({ length: 6 }, (_, i) => (
                        <tr key={i}>
                          <td className="mono">
                            PO/26-27/{String(22 - i).padStart(3, "0")}
                          </td>
                          <td>
                            {
                              [
                                "Shree Garments",
                                "Sai Traders",
                                "Modern Apparels",
                              ][i % 3]
                            }
                          </td>
                          <td>{`${26 - i} Nov 2026`}</td>
                          <td>{5 + i} products</td>
                          <td>{formatINR(124500 + i * 23500)}</td>
                          <td>
                            <span className="status-badge success">
                              Received
                            </span>
                          </td>
                        </tr>
                      ))
                    : path.includes("suppliers")
                      ? [
                          "Shree Garments",
                          "Sai Traders",
                          "Modern Apparels",
                          "Aarav Wholesale",
                        ].map((s, i) => (
                          <tr key={s}>
                            <td>
                              <b>{s}</b>
                            </td>
                            <td>+91 9822{i} 45678</td>
                            <td>{12 - i} orders</td>
                            <td>{26 - i} Nov 2026</td>
                            <td>{formatINR(i * 45900)}</td>
                          </tr>
                        ))
                      : products
                          .filter(
                            (p) =>
                              !term ||
                              p.name.toLowerCase().includes(term.toLowerCase()),
                          )
                          .map((p) => (
                            <tr key={p.id}>
                              <td>
                                <b>{p.name}</b>
                                <small className="sub-cell">
                                  {p.sizes[0]} · {p.colors[0]}
                                </small>
                              </td>
                              <td className="mono">{p.sku}</td>
                              <td>{p.stock} units</td>
                              <td>5 units</td>
                              <td>{formatINR(p.price * 0.46)}</td>
                              <td>{formatINR(p.price * 0.46 * p.stock)}</td>
                            </tr>
                          ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
