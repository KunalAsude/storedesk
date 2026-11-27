"use client";
import { SimpleTable } from "@/components/common/simple-table";
import { ProductEditorForm } from "@/components/store/product-editor";
import { products } from "@/lib/mock/data";
import { formatINR } from "@storedesk/shared";
import {
    ArrowDownToLine,
    Filter,
    Plus,
    Search,
    SlidersHorizontal
} from "lucide-react";
import { useState } from "react";

export function ProductsPage({
  fmt = formatINR,
  route,
  setDialog,
  pathname = "",
}: any) {
  const [mode, setMode] = useState("Grid");
  const [term, setTerm] = useState("");
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(term.toLowerCase()),
  );
  if (pathname.endsWith("/new") || pathname.endsWith("/edit"))
    return <ProductEditorForm route={route} />;
  if (
    pathname.includes("/products/") &&
    !pathname.endsWith("/new") &&
    !pathname.endsWith("/edit")
  ) {
    const selected =
      products.find((p) => pathname.endsWith(p.id)) || products[0];
    return (
      <>
        <div className="page-heading">
          <div>
            <div className="eyebrow">INVENTORY · PRODUCT</div>
            <h1>{selected.name}</h1>
            <p>
              {selected.sku} · {selected.category}
            </p>
          </div>
          <div className="heading-action">
            <button
              className="button secondary"
              onClick={() => setDialog("Stock in")}
            >
              Stock in
            </button>
            <button
              className="button primary"
              onClick={() =>
                route(`/store/inventory/products/${selected.id}/edit`)
              }
            >
              Edit product
            </button>
          </div>
        </div>
        <div className="stats-grid compact-stats">
          <div className="metric-card">
            <small>Selling price</small>
            <b>{fmt(selected.price)}</b>
          </div>
          <div className="metric-card">
            <small>Stock on hand</small>
            <b>{selected.stock} units</b>
          </div>
          <div className="metric-card">
            <small>Variants</small>
            <b>{selected.sizes.length * selected.colors.length}</b>
          </div>
        </div>
        <div className="dashboard-grid">
          <div className="panel">
            <h2>Variants and stock</h2>
            <div className="table-scroll">
              <SimpleTable
                headers={["Size", "Colour", "SKU", "Stock", "Status"]}
                rows={selected.sizes
                  .slice(0, 5)
                  .map((size, i) => [
                    size,
                    selected.colors[i % selected.colors.length],
                    `${selected.sku}-${size}`,
                    Math.max(0, selected.stock - i * 3),
                    selected.stock > i * 3 ? "In stock" : "Out",
                  ])}
              />
            </div>
          </div>
          <div className="panel">
            <h2>Product history</h2>
            {[
              "Sale · BH/26-27/0142 · −1 unit",
              "Purchase · PO/26-27/022 · +12 units",
              "Stock count · +2 units",
            ].map((x) => (
              <p className="timeline-item" key={x}>
                {x}
              </p>
            ))}
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">INVENTORY</div>
          <h1>Products</h1>
          <p>Keep your catalogue and stock in good order.</p>
        </div>
        <div className="heading-action">
          <button
            className="button secondary"
            onClick={() => setDialog("Import CSV")}
          >
            <ArrowDownToLine />
            Import CSV
          </button>
          <button
            className="button primary"
            onClick={() => route("/store/inventory/products/new")}
          >
            <Plus />
            Add product
          </button>
        </div>
      </div>
      <div className="stats-grid compact-stats">
        <div className="metric-card">
          <small>Total products</small>
          <b>124</b>
        </div>
        <div className="metric-card">
          <small>Low stock</small>
          <b>8</b>
        </div>
        <div className="metric-card">
          <small>Out of stock</small>
          <b>3</b>
        </div>
      </div>
      <div className="panel table-panel">
        <div className="list-toolbar">
          <div className="search-field">
            <Search />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search products"
            />
          </div>
          <button className="button secondary">
            <Filter />
            Category
          </button>
          <button className="button secondary">
            <SlidersHorizontal />
            Stock status
          </button>
          <div className="view-toggle">
            {["Grid", "Table"].map((m) => (
              <button
                className={mode === m ? "active" : ""}
                onClick={() => setMode(m)}
                key={m}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        {mode === "Table" ? (
          <SimpleTable
            headers={["Product", "Category", "SKU", "Price", "Stock", "Status"]}
            rows={filtered.map((p) => [
              p.name,
              p.category,
              p.sku,
              fmt(p.price),
              `${p.stock} units`,
              p.stock ? "Active" : "Out of stock",
            ])}
          />
        ) : (
          <div className="inventory-grid">
            {filtered.map((p) => (
              <button
                className="inventory-card"
                key={p.id}
                onClick={() => route(`/store/inventory/products/${p.id}`)}
              >
                <div className="inventory-thumb">
                  {p.name
                    .split(" ")
                    .map((a) => a[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="inventory-card-body">
                  <span className="muted">{p.category}</span>
                  <b>{p.name}</b>
                  <span className="mono muted">{p.sku}</span>
                  <div className="inventory-price">
                    <strong>{fmt(p.price)}</strong>
                    <span className={`stock-tag ${p.stock < 8 ? "low" : ""}`}>
                      {p.stock === 0
                        ? "Out of stock"
                        : p.stock < 8
                          ? `${p.stock} left`
                          : `${p.stock} in stock`}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        <div className="pagination">
          <span>Showing {filtered.length} of 124 products</span>
          <div>
            <button className="icon-btn tiny">‹</button>
            <button className="page-number active">1</button>
            <button className="icon-btn tiny">›</button>
          </div>
        </div>
      </div>
    </>
  );
}
