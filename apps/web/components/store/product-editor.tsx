"use client";

import { useMemo, useState } from "react";
import { Check, ImagePlus, Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const sizeSets: Record<string, string[]> = {
  "Shirts M–XXL": ["M", "L", "XL", "XXL"],
  "Waist 28–38": ["28", "30", "32", "34", "36", "38"],
  "Kids 2–14Y": ["2Y", "4Y", "6Y", "8Y", "10Y", "12Y", "14Y"],
};
const palette = [
  { name: "White", color: "#F8F6F0" },
  { name: "Black", color: "#282522" },
  { name: "Navy", color: "#283B57" },
  { name: "Sky", color: "#9EC7DF" },
  { name: "Olive", color: "#777B4C" },
  { name: "Maroon", color: "#783D49" },
  { name: "Beige", color: "#D8C6A8" },
];

export function ProductEditorForm({
  route,
}: {
  route: (path: string) => void;
}) {
  const [sizeSet, setSizeSet] = useState("Shirts M–XXL");
  const [sizes, setSizes] = useState(sizeSets[sizeSet]);
  const [colors, setColors] = useState([
    "White",
    "Black",
    "Navy",
    "Sky",
    "Olive",
    "Maroon",
    "Beige",
  ]);
  const [differentPrices, setDifferentPrices] = useState(false);
  const [stock, setStock] = useState<Record<string, string>>({});
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState(["Front view", "Detail"]);
  const variants = useMemo(
    () =>
      colors.flatMap((color) =>
        sizes.map((size) => ({
          color,
          size,
          key: `${color}:${size}`,
          sku: `BH-SH-${color
            .toUpperCase()
            .replace(/[^A-Z]/g, "")
            .slice(0, 3)}-${size.toUpperCase()}`,
        })),
      ),
    [colors, sizes],
  );

  const setAll = (field: "stock" | "price", value: string, color?: string) => {
    const targets = variants.filter(
      (variant) => !color || variant.color === color,
    );
    if (field === "stock")
      setStock((current) =>
        Object.fromEntries([
          ...Object.entries(current),
          ...targets.map((variant) => [variant.key, value]),
        ]),
      );
    else
      setPrices((current) =>
        Object.fromEntries([
          ...Object.entries(current),
          ...targets.map((variant) => [variant.key, value]),
        ]),
      );
  };

  const save = () => {
    toast.success("Product saved");
    route("/store/inventory/products");
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">INVENTORY · PRODUCT DETAILS</div>
          <h1>Add product</h1>
          <p>Describe the item and set up variants for your shelves.</p>
        </div>
      </div>
      <div className="product-editor-grid">
        <section className="panel">
          <h2>Product details</h2>
          <div className="settings-fields">
            <label className="form-label">
              Product name
              <input required defaultValue="Premium Plain Shirt" />
            </label>
            <label className="form-label">
              Brand
              <input defaultValue="Brand Hub" />
            </label>
            <label className="form-label">
              Department
              <Select defaultValue="Men’s wear">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Men’s wear">Men’s wear</SelectItem>
                  <SelectItem value="Kids’ wear">Kids’ wear</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <label className="form-label">
              Category
              <Select defaultValue="Shirts">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Shirts">Shirts</SelectItem>
                  <SelectItem value="Trousers">Trousers</SelectItem>
                  <SelectItem value="Jackets">Jackets</SelectItem>
                  <SelectItem value="Accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <label className="form-label">
              Sub-category
              <Select defaultValue="Casual shirts">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Casual shirts">Casual shirts</SelectItem>
                  <SelectItem value="Formal shirts">Formal shirts</SelectItem>
                  <SelectItem value="Printed shirts">Printed shirts</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <label className="form-label full-field">
              Description
              <textarea
                rows={3}
                defaultValue="Everyday comfort in a clean, versatile fit."
              />
            </label>
          </div>
        </section>
        <section className="panel">
          <h2>Pricing</h2>
          <div className="settings-fields">
            <label className="form-label">
              MRP (₹)
              <input type="number" defaultValue="699" />
            </label>
            <label className="form-label">
              Selling price (₹)
              <input type="number" defaultValue="499" />
            </label>
            <label className="form-label">
              Cost price (₹)
              <input type="number" defaultValue="280" />
            </label>
            <div className="metric-card">
              <small>Gross margin</small>
              <b>43.9%</b>
            </div>
          </div>
        </section>
        <section className="panel variant-editor-panel">
          <div className="panel-head">
            <div>
              <h2>Variants</h2>
              <p className="muted">
                Choose a saved size set and the colours you stock.
              </p>
            </div>
            <label className="variant-toggle">
              <span>Different price per variant</span>
              <Switch
                checked={differentPrices}
                onCheckedChange={setDifferentPrices}
                aria-label="Different price per variant"
              />
            </label>
          </div>
          <label className="form-label size-set-field">
            Size set
            <Select
              value={sizeSet}
              onValueChange={(value) => {
                if (value) {
                  setSizeSet(value);
                  setSizes(sizeSets[value]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(sizeSets).map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <div className="variant-chip-row">
            {sizeSets[sizeSet].map((item) => (
              <button
                type="button"
                key={item}
                className={`size-chip ${sizes.includes(item) ? "chosen" : ""}`}
                onClick={() =>
                  setSizes((current) =>
                    current.includes(item)
                      ? current.filter((size) => size !== item)
                      : [...current, item],
                  )
                }
              >
                {item}
              </button>
            ))}
          </div>
          <div className="product-colors" aria-label="Selected colours">
            {colors.map((color) => (
              <span className="color-choice chosen" key={color}>
                <i
                  style={{
                    background:
                      palette.find((item) => item.name === color)?.color ??
                      "var(--muted)",
                  }}
                />
                {color}
                <button
                  type="button"
                  aria-label={`Remove ${color}`}
                  onClick={() =>
                    setColors((current) => current.filter((item) => item !== color))
                  }
                >
                  <X />
                </button>
              </span>
            ))}
            <Select
              onValueChange={(value) => {
                if (typeof value === "string" && !colors.includes(value))
                  setColors((current) => [...current, value]);
              }}
            >
              <SelectTrigger className="add-color-trigger" aria-label="Add colour">
                <Plus />
                <SelectValue placeholder="Add colour" />
              </SelectTrigger>
              <SelectContent>
                {palette
                  .filter((item) => !colors.includes(item.name))
                  .map((item) => (
                    <SelectItem value={item.name} key={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="variant-grid-scroll">
            <table className="variant-matrix">
              <thead>
                <tr>
                  <th>Colour</th>
                  {sizes.map((item) => (
                    <th key={item}>
                      <span>{item}</span>
                      <button
                        type="button"
                        className="button small ghost"
                        onClick={() => {
                          const targets = variants.filter(
                            (variant) => variant.size === item,
                          );
                          setStock((current) =>
                            Object.fromEntries([
                              ...Object.entries(current),
                              ...targets.map((variant) => [variant.key, "8"]),
                            ]),
                          );
                        }}
                      >
                        Fill column
                      </button>
                    </th>
                  ))}
                  <th>Fill row</th>
                </tr>
              </thead>
              <tbody>
                {colors.map((color) => (
                  <tr key={color}>
                    <th>
                      <i
                        style={{
                          background:
                            palette.find((item) => item.name === color)
                              ?.color ?? "var(--muted)",
                        }}
                      />
                      {color}
                    </th>
                    {sizes.map((size) => {
                      const key = `${color}:${size}`;
                      return (
                        <td key={key}>
                          <label className="sr-only" htmlFor={`stock-${key}`}>
                            {color} {size} stock
                          </label>
                          <input
                            id={`stock-${key}`}
                            type="number"
                            min="0"
                            value={stock[key] ?? ""}
                            placeholder="0"
                            onChange={(event) =>
                              setStock((current) => ({
                                ...current,
                                [key]: event.target.value,
                              }))
                            }
                          />
                          {differentPrices && (
                            <>
                              <label
                                className="sr-only"
                                htmlFor={`price-${key}`}
                              >
                                {color} {size} price
                              </label>
                              <input
                                id={`price-${key}`}
                                className="variant-price-input"
                                type="number"
                                min="0"
                                placeholder="₹ price"
                                value={prices[key] ?? ""}
                                onChange={(event) =>
                                  setPrices((current) => ({
                                    ...current,
                                    [key]: event.target.value,
                                  }))
                                }
                              />
                            </>
                          )}
                          <code>
                            {
                              variants.find((variant) => variant.key === key)
                                ?.sku
                            }
                          </code>
                        </td>
                      );
                    })}
                    <td>
                      <button
                        type="button"
                        className="button small ghost"
                        onClick={() => setAll("stock", "8", color)}
                      >
                        Fill row
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Photos</h2>
              <p className="muted">
                Drag to reorder. First photo is the cover.
              </p>
            </div>

          </div>
          <div className="product-photo-list">
            {photos.map((photo, index) => (
              <div
                className="product-photo-tile"
                draggable
                onDragStart={(event) =>
                  event.dataTransfer.setData("text/plain", String(index))
                }
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  const from = Number(event.dataTransfer.getData("text/plain"));
                  setPhotos((current) => {
                    const next = [...current];
                    const [item] = next.splice(from, 1);
                    next.splice(index, 0, item);
                    return next;
                  });
                }}
                key={photo}
              >
                <div className="photo-thumb">
                  <ImagePlus aria-hidden="true" />
                </div>
                {index === 0 && <span className="cover-badge">Cover</span>}
                <Select defaultValue="Navy">
                  <SelectTrigger aria-label={`Tag ${photo} to colour`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem value={color} key={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  className="photo-remove"
                  type="button"
                  aria-label={`Remove ${photo}`}
                  onClick={() =>
                    setPhotos((current) =>
                      current.filter((item) => item !== photo),
                    )
                  }
                >
                  <X />
                </button>
              </div>
            ))}
            {photos.length < 8 && (
              <button
                className="product-photo-tile add-photo-tile"
                type="button"
                onClick={() =>
                  setPhotos((current) => [...current, `Photo ${current.length + 1}`])
                }
              >
                <span className="photo-thumb"><ImagePlus /></span>
                <span>Add photo</span>
              </button>
            )}
          </div>
        </section>
        <div className="sticky-save">
          <button
            className="button secondary"
            onClick={() => route("/store/inventory/products")}
          >
            Cancel
          </button>
          <button className="button primary" onClick={save}>
            <Check />
            Save product
          </button>
        </div>
      </div>
    </>
  );
}
