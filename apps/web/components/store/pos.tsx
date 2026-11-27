"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  FileText,
  Minus,
  Plus,
  Printer,
  Search,
  ShoppingBag,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { products } from "@/lib/mock/data";
import type { Product } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CartLine = {
  key: string;
  product: string;
  price: number;
  qty: number;
  size: string;
  color: string;
  stock: number;
  discount: number;
};

const formatINR = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: paise % 100 ? 2 : 0,
  }).format(paise / 100);

const swatches: Record<string, string> = {
  White: "#F8F6F0",
  Black: "#282522",
  Navy: "#283B57",
  Sky: "#9EC7DF",
  Olive: "#777B4C",
  Maroon: "#783D49",
  Beige: "#D8C6A8",
  Blue: "#426D99",
  Charcoal: "#55565A",
};

function variantStock(product: Product, size: string, color: string) {
  if (!product.stock) return 0;
  const sizeIndex = product.sizes.indexOf(size);
  const colorIndex = product.colors.indexOf(color);
  const count = product.sizes.length * product.colors.length;
  const base = Math.floor(product.stock / count);
  const remainder = product.stock % count;
  const index =
    Math.max(0, colorIndex) * product.sizes.length + Math.max(0, sizeIndex);
  return base + (index < remainder ? 1 : 0);
}

export function PosPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [product, setProduct] = useState<Product | null>(null);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [held, setHeld] = useState<CartLine[][]>([[], []]);
  const [chargeOpen, setChargeOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [payment, setPayment] = useState("Cash");
  const [customer, setCustomer] = useState("Walk-in customer");
  const [cash, setCash] = useState("");
  const [splitCash, setSplitCash] = useState("0");
  const [splitUpi, setSplitUpi] = useState("0");
  const [quickName, setQuickName] = useState("");
  const [quickSize, setQuickSize] = useState("");
  const [quickColor, setQuickColor] = useState("");
  const [quickQuantity, setQuickQuantity] = useState("1");
  const [quickPrice, setQuickPrice] = useState("");
  const [billDiscount, setBillDiscount] = useState(0);
  const [discountMode, setDiscountMode] = useState<"₹" | "%">("₹");
  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const updateViewport = () => setIsMobile(media.matches);
    updateViewport();
    media.addEventListener("change", updateViewport);
    return () => media.removeEventListener("change", updateViewport);
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(products.map((item) => item.category))),
  ];
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty - item.discount,
    0,
  );
  const discountValue =
    discountMode === "%"
      ? Math.round((subtotal * billDiscount) / 100)
      : billDiscount * 100;
  const total = Math.max(0, subtotal - discountValue);
  const splitCashCents = Math.max(
    0,
    Math.round(Number(splitCash || 0) * 100),
  );
  const splitUpiCents = Math.max(
    0,
    Math.round(Number(splitUpi || 0) * 100),
  );
  const splitRemaining = total - splitCashCents - splitUpiCents;
  const units = cart.reduce((sum, item) => sum + item.qty, 0);
  const availableColors = product?.colors ?? [];
  const availableSizes = product?.sizes ?? [];
  const chosenStock =
    product && size && color ? variantStock(product, size, color) : 0;
  const visibleProducts = useMemo(
    () =>
      products.filter(
        (item) =>
          (category === "All" || item.category === category) &&
          item.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [category, search],
  );

  const chooseProduct = (item: Product) => {
    setProduct(item);
    setSize(item.sizes[0] ?? "One size");
    setColor(item.colors[0] ?? "Default");
    setQuantity(1);
  };

  const addToCart = () => {
    if (!product || !size || !color || chosenStock < 1) return;
    const key = `${product.id}:${size}:${color}`;
    setCart((current) => {
      const existing = current.find((line) => line.key === key);
      if (existing)
        return current.map((line) =>
          line.key === key
            ? { ...line, qty: Math.min(line.qty + quantity, line.stock) }
            : line,
        );
      return [
        ...current,
        {
          key,
          product: product.name,
          price: product.price,
          qty: Math.min(quantity, chosenStock),
          size,
          color,
          stock: chosenStock,
          discount: 0,
        },
      ];
    });
    toast.success(`${product.name} added to bill`);
    setProduct(null);
  };

  const updateLine = (key: string, patch: Partial<CartLine>) =>
    setCart((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );

  const holdBill = () => {
    if (!cart.length) return toast.error("Add items before holding this bill");
    setHeld((current) => [cart, ...current].slice(0, 5));
    setCart([]);
    toast.success("Bill held for later");
  };

  const restoreHeld = (index: number) => {
    const restored = held[index];
    setHeld((current) => current.filter((_, i) => i !== index));
    if (restored) setCart((current) => [...current, ...restored]);
    setCartOpen(false);
  };

  const completeSale = () => {
    setSuccess(true);
    toast.success("Payment recorded");
  };

  const resetSale = () => {
    setCart([]);
    setBillDiscount(0);
    setSuccess(false);
    setChargeOpen(false);
  };

  return (
    <div className="pos-page">
      <section className="pos-catalog">
        <div className="pos-head">
          <div>
            <div className="eyebrow">BRAND HUB MENS WEAR</div>
            <h1>Billing</h1>
          </div>
          <button
            className="button secondary"
            onClick={() => setQuickOpen(true)}
          >
            <Plus />
            Quick item
          </button>
        </div>
        <div className="pos-search">
          <Search />
          <input
            id="pos-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search product or scan barcode"
          />
          <button
            aria-label="Scan barcode"
            onClick={() => toast("Barcode scanner ready")}
          >
            <ShoppingBag />
          </button>
        </div>
        <div className="chip-row">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`filter-chip ${category === item ? "selected" : ""}`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="product-grid">
          {visibleProducts.map((item) => (
            <button
              key={item.id}
              className={`catalog-product ${item.stock === 0 ? "out-of-stock" : ""}`}
              onClick={() => item.stock > 0 && chooseProduct(item)}
              disabled={item.stock === 0}
            >
              <span className="catalog-photo">
                {item.name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)}
              </span>
              <span className="catalog-name">{item.name}</span>
              <strong>{formatINR(item.price)}</strong>
              <small>
                {item.stock ? `${item.stock} in stock` : "Out of stock"}
              </small>
              <span className="product-plus">
                <Plus />
              </span>
            </button>
          ))}
        </div>
      </section>

      <aside className="cart-panel">
        <div className="cart-title">
          <div>
            <h2>Current bill</h2>
            <p>BH/26-27/0143 · Today, 4:12 pm</p>
          </div>
          <button
            className="icon-btn"
            aria-label="Clear cart"
            onClick={() => setCart([])}
          >
            <X />
          </button>
        </div>
        <Select value={customer} onValueChange={(value) => value && setCustomer(value)}>
          <SelectTrigger className="customer-select" aria-label="Select customer">
            <span className="customer-initials">
              {customer
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </span>
            <span>
              {customer}
              <small>{customer === "Walk-in customer" ? "Choose a customer" : "Customer selected"}</small>
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="Walk-in customer">Walk-in customer</SelectItem>
              <SelectItem value="Rahul Patil">Rahul Patil</SelectItem>
              <SelectItem value="Sagar Shinde">Sagar Shinde</SelectItem>
              <SelectItem value="Amit Kale">Amit Kale</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="held-row">
          <button onClick={holdBill}>Hold bill</button>
          <button onClick={() => setCartOpen(true)}>
            <FileText />
            Held bills <b>{held.length}</b>
          </button>
        </div>
        <div className="cart-lines">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag />
              <b>Your bill is empty</b>
              <span>Add a product to get started</span>
            </div>
          ) : (
            cart.map((item) => (
              <div className="cart-line" key={item.key}>
                <span className="line-photo">{item.product.slice(0, 1)}</span>
                <span className="line-details">
                  <b>{item.product}</b>
                  <small>
                    {item.size} · {item.color}
                  </small>
                  <div className="qty-control">
                    <button
                      aria-label="Decrease quantity"
                      onClick={() =>
                        updateLine(item.key, { qty: Math.max(1, item.qty - 1) })
                      }
                    >
                      −
                    </button>
                    <span>{item.qty}</span>
                    <button
                      aria-label="Increase quantity"
                      disabled={item.qty >= item.stock}
                      onClick={() =>
                        updateLine(item.key, {
                          qty: Math.min(item.stock, item.qty + 1),
                        })
                      }
                    >
                      +
                    </button>
                  </div>
                  <label className="line-edit">
                    Price{" "}
                    <input
                      aria-label={`Price for ${item.product}`}
                      type="number"
                      min="0"
                      value={item.price / 100}
                      onChange={(event) =>
                        updateLine(item.key, {
                          price: Math.round(
                            Number(event.target.value || 0) * 100,
                          ),
                        })
                      }
                    />
                  </label>
                  <label className="line-edit">
                    Discount ₹{" "}
                    <input
                      aria-label={`Discount for ${item.product}`}
                      type="number"
                      min="0"
                      value={item.discount / 100}
                      onChange={(event) =>
                        updateLine(item.key, {
                          discount: Math.min(
                            item.price * item.qty,
                            Math.round(Number(event.target.value || 0) * 100),
                          ),
                        })
                      }
                    />
                  </label>
                </span>
                <b className="line-price">
                  {formatINR(
                    Math.max(0, item.price * item.qty - item.discount),
                  )}
                </b>
                <button
                  className="remove-line"
                  aria-label={`Remove ${item.product}`}
                  onClick={() =>
                    setCart((current) =>
                      current.filter((line) => line.key !== item.key),
                    )
                  }
                >
                  <Trash2 />
                </button>
              </div>
            ))
          )}
        </div>
        <div className="discount-row">
          <Tag />
          Bill discount{" "}
          <Select
            value={discountMode}
            onValueChange={(value) =>
              value && setDiscountMode(value as "₹" | "%")
            }
          >
            <SelectTrigger aria-label="Discount type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="₹">₹</SelectItem>
              <SelectItem value="%">%</SelectItem>
            </SelectContent>
          </Select>
          <input
            aria-label="Bill discount amount"
            type="number"
            min="0"
            value={billDiscount}
            onChange={(event) =>
              setBillDiscount(Number(event.target.value || 0))
            }
          />
        </div>
        <div className="bill-totals">
          <div>
            <span>Items ({units})</span>
            <b>
              {formatINR(
                cart.reduce((sum, line) => sum + line.price * line.qty, 0),
              )}
            </b>
          </div>
          <div>
            <span>Discount</span>
            <b>
              −{" "}
              {formatINR(
                discountValue +
                  cart.reduce((sum, line) => sum + line.discount, 0),
              )}
            </b>
          </div>
          <div>
            <span>Round off</span>
            <b>{formatINR(0)}</b>
          </div>
          <div className="total-row">
            <span>Total</span>
            <strong>{formatINR(total)}</strong>
          </div>
        </div>
        <button
          className="button primary charge-btn"
          disabled={!cart.length}
          onClick={() => {
            setSuccess(false);
            setSplitCash("0");
            setSplitUpi((total / 100).toFixed(2));
            setChargeOpen(true);
          }}
        >
          Charge {formatINR(total)} <span aria-hidden="true">→</span>
        </button>
        <small className="shortcut-hint">Press F4 to charge</small>
      </aside>

      <button
        type="button"
        className="mobile-cart-bar"
        onClick={() => setCartOpen(true)}
        aria-label={`View cart with ${units} items, total ${formatINR(total)}`}
      >
        <span>
          {units} items · {formatINR(total)}
        </span>
        <b>View cart →</b>
      </button>

      <Sheet
        open={Boolean(product)}
        onOpenChange={(open) => !open && setProduct(null)}
      >
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className="pos-sheet"
        >
          <SheetHeader>
            <SheetTitle>{product?.name ?? "Choose variant"}</SheetTitle>
            <SheetDescription>
              Choose a size and colour to check stock.
            </SheetDescription>
          </SheetHeader>
          {product && (
            <div className="variant-picker">
              <div>
                <b>Size</b>
                <div className="variant-chip-row">
                  {availableSizes.map((item) => (
                    <button
                      key={item}
                      className={size === item ? "chosen" : ""}
                      onClick={() => setSize(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <b>Colour</b>
                <div className="variant-chip-row">
                  {availableColors.map((item) => (
                    <button
                      key={item}
                      className={`color-choice ${color === item ? "chosen" : ""}`}
                      onClick={() => setColor(item)}
                    >
                      <i
                        style={{ background: swatches[item] ?? "var(--muted)" }}
                      />
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <p
                className={
                  chosenStock ? "stock-available" : "stock-unavailable"
                }
              >
                {chosenStock
                  ? `${chosenStock} left for ${size} · ${color}`
                  : `Sold out · ${size} · ${color}`}
              </p>
              <div className="variant-qty">
                <span>Quantity</span>
                <div className="qty-control">
                  <button
                    aria-label="Decrease quantity"
                    onClick={() =>
                      setQuantity((value) => Math.max(1, value - 1))
                    }
                  >
                    <Minus />
                  </button>
                  <b>{quantity}</b>
                  <button
                    aria-label="Increase quantity"
                    disabled={quantity >= chosenStock}
                    onClick={() =>
                      setQuantity((value) => Math.min(chosenStock, value + 1))
                    }
                  >
                    <Plus />
                  </button>
                </div>
              </div>
              <button
                className="button primary full"
                disabled={!chosenStock}
                onClick={addToCart}
              >
                Add · {formatINR(product.price * quantity)}
              </button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent side="bottom" className="pos-cart-sheet">
          <SheetHeader>
            <SheetTitle>Cart · {units} items</SheetTitle>
            <SheetDescription>
              Review this bill or restore a held bill.
            </SheetDescription>
          </SheetHeader>
          {held.length > 0 && (
            <div className="held-list">
              {held.map((bill, index) => (
                <button key={index} onClick={() => restoreHeld(index)}>
                  Held bill {index + 1} · {bill.length} lines{" "}
                  <b>
                    {formatINR(
                      bill.reduce(
                        (sum, line) => sum + line.price * line.qty,
                        0,
                      ),
                    )}
                  </b>
                </button>
              ))}
            </div>
          )}
          <div className="cart-sheet-lines">
            {cart.map((item) => (
              <div key={item.key}>
                <span>
                  {item.product} · {item.size} · {item.color} × {item.qty}
                </span>
                <b>{formatINR(item.price * item.qty - item.discount)}</b>
              </div>
            ))}
          </div>
          <div className="sheet-total">
            Total <b>{formatINR(total)}</b>
          </div>
          <button
            className="button primary full"
            disabled={!cart.length}
            onClick={() => {
              setCartOpen(false);
              setSplitCash("0");
              setSplitUpi((total / 100).toFixed(2));
              setChargeOpen(true);
            }}
          >
            Charge {formatINR(total)}
          </button>
        </SheetContent>
      </Sheet>

      <Sheet open={chargeOpen} onOpenChange={setChargeOpen}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className="pos-sheet"
        >
          <SheetHeader>
            <SheetTitle>
              {success ? "Sale complete" : `Charge ${formatINR(total)}`}
            </SheetTitle>
            <SheetDescription>
              {success
                ? "The payment has been recorded."
                : "Choose a payment method to complete this sale."}
            </SheetDescription>
          </SheetHeader>
          {success ? (
            <div className="pos-success">
              <div className="success-icon">
                <Check />
              </div>
              <div className="receipt-preview">
                <b>BRAND HUB MENS WEAR</b>
                <small>BH/26-27/0143 · 26 Nov 2026, 4:12 pm</small>
                <hr />
                {cart.map((item) => (
                  <div key={item.key}>
                    <span>
                      {item.product} · {item.size} · {item.color} × {item.qty}
                    </span>
                    <span>
                      {formatINR(item.price * item.qty - item.discount)}
                    </span>
                  </div>
                ))}
                <hr />
                <div>
                  <b>TOTAL</b>
                  <b>{formatINR(total)}</b>
                </div>
                <small>
                  Paid via {payment} · Thank you for shopping with us.
                </small>
              </div>
              <button
                className="button secondary full"
                onClick={() => toast("Print dialog opened")}
              >
                <Printer />
                Print 58 mm
              </button>
              <button
                className="button secondary full"
                onClick={() => toast("PDF receipt prepared")}
              >
                Download PDF
              </button>
              <button
                className="button secondary full"
                onClick={() => toast("WhatsApp receipt ready")}
              >
                WhatsApp
              </button>
              <button className="button primary full" onClick={resetSale}>
                New bill
              </button>
            </div>
          ) : (
            <div className="charge-content">
              <div className="payment-options">
                {["Cash", "UPI", "Card", "Udhaar", "Split"].map((item) => (
                  <button
                    key={item}
                    className={payment === item ? "chosen" : ""}
                    onClick={() => setPayment(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
              {payment === "Cash" && (
                <label className="form-label">
                  Cash received
                  <input
                    type="number"
                    min={total / 100}
                    value={cash || String(Math.ceil(total / 100))}
                    onChange={(event) => setCash(event.target.value)}
                  />
                  <small>
                    Change due ·{" "}
                    {formatINR(
                      Math.max(
                        0,
                        Math.round(
                          Number(cash || Math.ceil(total / 100)) * 100,
                        ) - total,
                      ),
                    )}
                  </small>
                </label>
              )}
              {payment === "UPI" && (
                <div className="upi-box">
                  <div className="fake-qr">
                    {Array.from({ length: 36 }, (_, index) => (
                      <i key={index} />
                    ))}
                  </div>
                  <b>Scan to pay {formatINR(total)}</b>
                  <small>brandhub@okaxis</small>
                </div>
              )}
              {payment === "Card" && (
                <div className="field-card">
                  Card payment · {formatINR(total)}
                  <small>Record the transaction on your card terminal.</small>
                </div>
              )}
              {payment === "Udhaar" && (
                <div className="field-card">
                  {customer === "Walk-in customer"
                    ? "Choose a named customer from the bill before recording credit."
                    : `Add this amount to ${customer}’s outstanding balance.`}
                </div>
              )}
              {payment === "Split" && (
                <div className="split-fields">
                  <label className="form-label">
                    Cash amount
                    <input
                      type="number"
                      min="0"
                      max={total / 100}
                      step="0.01"
                      value={splitCash}
                      onChange={(event) => setSplitCash(event.target.value)}
                    />
                  </label>
                  <label className="form-label">
                    UPI amount
                    <input
                      type="number"
                      min="0"
                      max={total / 100}
                      step="0.01"
                      value={splitUpi}
                      onChange={(event) => setSplitUpi(event.target.value)}
                    />
                  </label>
                  <div
                    className="split-remaining"
                    aria-live="polite"
                    data-balanced={splitRemaining === 0}
                  >
                    {splitRemaining === 0
                      ? "Split balanced"
                      : splitRemaining > 0
                        ? `₹ left · ${formatINR(splitRemaining)}`
                        : `Over by · ${formatINR(Math.abs(splitRemaining))}`}
                  </div>
                </div>
              )}
              <button
                className="button primary full"
                disabled={
                  (payment === "Cash" &&
                    Math.round(Number(cash || Math.ceil(total / 100)) * 100) <
                      total) ||
                  (payment === "Split" && splitRemaining !== 0) ||
                  (payment === "Udhaar" && customer === "Walk-in customer")
                }
                onClick={completeSale}
              >
                <Check />
                Complete sale
              </button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={quickOpen} onOpenChange={setQuickOpen}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className="pos-sheet"
        >
          <SheetHeader>
            <SheetTitle>Quick item</SheetTitle>
            <SheetDescription>
              Add an item that is not in your catalogue.
            </SheetDescription>
          </SheetHeader>
          <div className="quick-item-fields">
            <label className="form-label">
              Item name
              <input
                value={quickName}
                onChange={(event) => setQuickName(event.target.value)}
                placeholder="Item name"
              />
            </label>
            <label className="form-label">
              Size
              <input
                value={quickSize}
                onChange={(event) => setQuickSize(event.target.value)}
                placeholder="e.g. L"
              />
            </label>
            <label className="form-label">
              Colour
              <input
                value={quickColor}
                onChange={(event) => setQuickColor(event.target.value)}
                placeholder="e.g. Navy"
              />
            </label>
            <label className="form-label">
              Quantity
              <input
                type="number"
                min="1"
                step="1"
                value={quickQuantity}
                onChange={(event) => setQuickQuantity(event.target.value)}
              />
            </label>
            <label className="form-label">
              Price (₹)
              <input
                type="number"
                min="0"
                value={quickPrice}
                onChange={(event) => setQuickPrice(event.target.value)}
                placeholder="0.00"
              />
            </label>
            <button
              className="button primary full"
              onClick={() => {
                const quantityValue = Number(quickQuantity);
                if (
                  !quickName.trim() ||
                  !Number.isFinite(Number(quickPrice)) ||
                  Number(quickPrice) <= 0 ||
                  !Number.isInteger(quantityValue) ||
                  quantityValue < 1
                )
                  return toast.error(
                    "Enter an item name, valid price, and whole-number quantity",
                  );
                setCart((current) => [
                  ...current,
                  {
                    key: `quick-${Date.now()}`,
                    product: quickName.trim(),
                    price: Math.round(Number(quickPrice) * 100),
                    qty: quantityValue,
                    size: quickSize.trim() || "One size",
                    color: quickColor.trim() || "Unspecified",
                    stock: quantityValue,
                    discount: 0,
                  },
                ]);
                setQuickOpen(false);
                setQuickName("");
                setQuickSize("");
                setQuickColor("");
                setQuickQuantity("1");
                setQuickPrice("");
                toast.success("Quick item added");
              }}
            >
              Add to bill
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
