"use client";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Check,
    Plus
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ProductEditor({ route, setDialog }: any) {
  const [saved, setSaved] = useState(false);
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
                <SelectTrigger className="select-control">
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
                <SelectTrigger className="select-control">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Shirts">Shirts</SelectItem>
                  <SelectItem value="Trousers">Trousers</SelectItem>
                  <SelectItem value="Jackets">Jackets</SelectItem>
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
              MRP
              <input type="number" defaultValue="699" />
            </label>
            <label className="form-label">
              Selling price
              <input type="number" defaultValue="499" />
            </label>
            <label className="form-label">
              Cost price
              <input type="number" defaultValue="280" />
            </label>
            <div className="metric-card">
              <small>Gross margin</small>
              <b>43.9%</b>
            </div>
          </div>
        </section>
        <section className="panel">
          <h2>Variants</h2>
          <p className="muted">Choose the sizes and colours you stock.</p>
          <label className="form-label">
            Size set
            <input defaultValue="M, L, XL, XXL" />
          </label>
          <label className="form-label">
            Colours
            <input defaultValue="White, Black, Navy, Sky, Olive, Maroon, Beige" />
          </label>
          <div className="variant-preview">
            {["White", "Black", "Navy", "Sky", "Olive", "Maroon", "Beige"].map(
              (c, i) => (
                <span key={c}>
                  <b>{c}</b>
                  <small>SKU: BH-SH-00{i + 1}</small>
                  <input
                    type="number"
                    aria-label={`${c} stock`}
                    defaultValue={8 - i}
                  />
                </span>
              ),
            )}
          </div>
        </section>
        <section className="panel">
          <h2>Photos</h2>
          <button
            className="upload-box"
            onClick={() => toast("Choose product photos")}
          >
            <Plus />
            Add up to 8 product photos
          </button>
        </section>
        <div className="sticky-save">
          <button
            className="button secondary"
            onClick={() => route("/store/inventory/products")}
          >
            Cancel
          </button>
          <button
            className="button primary"
            onClick={() => {
              setSaved(true);
              toast.success("Product saved");
              route("/store/inventory/products");
            }}
          >
            <Check />
            Save product
          </button>
        </div>
      </div>
    </>
  );
}
