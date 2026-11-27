"use client";
import { toast } from "sonner";

export function PublicBillPage() {
  return (
    <main className="public-bill">
      <div className="public-brand">
        <span className="brand-mark">B</span>
        <span>Brand Hub Mens Wear</span>
      </div>
      <p>Kopargaon, Maharashtra · Cash Memo</p>
      <div className="receipt-preview">
        <b>BRAND HUB MENS WEAR</b>
        <small>BH/26-27/0142 · 26 Nov 2026, 4:12 pm</small>
        <hr />
        {[
          ["Premium Plain Shirt × 1", "₹499"],
          ["Formal Stretch Trousers × 1", "₹899"],
          ["Discount", "−₹379"],
        ].map((x) => (
          <div key={x[0]}>
            <span>{x[0]}</span>
            <span>{x[1]}</span>
          </div>
        ))}
        <hr />
        <div>
          <b>TOTAL PAID</b>
          <b>₹1,019</b>
        </div>
        <small>Paid via UPI · Thank you for shopping with us.</small>
      </div>
      <button
        className="button primary full"
        onClick={() => toast.success("Receipt download started")}
      >
        Download PDF
      </button>
      <button
        className="button secondary full"
        onClick={() => toast.success("Opening WhatsApp")}
      >
        Message shop on WhatsApp
      </button>
      <small className="powered-by">Powered by StoreDesk</small>
    </main>
  );
}
