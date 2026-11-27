"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Download,
  Printer,
  RotateCcw,
  Share2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { bills } from "@/lib/mock/data";

const formatINR = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: paise % 100 ? 2 : 0,
  }).format(paise / 100);

export function SaleDetailPage({
  billId,
  route,
  isOwner,
}: {
  billId: string;
  route: (path: string) => void;
  isOwner: boolean;
}) {
  const bill =
    bills.find((item) => item.id === decodeURIComponent(billId)) ?? bills[0];
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelled, setCancelled] = useState(bill.status === "Cancelled");
  const [reason, setReason] = useState("");

  return (
    <>
      {cancelled && (
        <div className="banner error-banner">
          <X />
          This bill was cancelled and no longer counts toward sales.
        </div>
      )}
      <div className="page-heading">
        <div className="detail-product-title">
          <button
            className="icon-btn"
            aria-label="Back to sales"
            onClick={() => route("/store/sales")}
          >
            <ArrowLeft />
          </button>
          <div>
            <div className="eyebrow">SALES · BILL DETAILS</div>
            <h1 className="mono">{bill.id}</h1>
            <p>{bill.date}</p>
          </div>
        </div>
        <div className="heading-action">
          <button
            className="button secondary"
            onClick={() => toast("Print dialog opened")}
          >
            <Printer />
            Print
          </button>
          <button
            className="button secondary"
            onClick={() => toast("PDF receipt prepared")}
          >
            <Download />
            PDF
          </button>
          <button
            className="button secondary"
            onClick={() => toast("WhatsApp receipt ready")}
          >
            <Share2 />
            WhatsApp
          </button>
        </div>
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="receipt-preview">
            <b>BRAND HUB MENS WEAR</b>
            <small>Kopargaon · Cash Memo</small>
            <small>
              {bill.id} · {bill.date}
            </small>
            <hr />
            <div>
              <span>Premium Plain Shirt · L · Navy × 1</span>
              <span>{formatINR(49900)}</span>
            </div>
            <div>
              <span>Formal Stretch Trousers · 32 × 1</span>
              <span>{formatINR(89900)}</span>
            </div>
            <hr />
            <div>
              <span>Discount</span>
              <span>−{formatINR(37900)}</span>
            </div>
            <div>
              <b>TOTAL</b>
              <b>{formatINR(bill.total)}</b>
            </div>
            <small>
              {bill.status === "Paid"
                ? `Paid via ${bill.payment}`
                : `Due ${formatINR(bill.due)}`}
            </small>
          </div>
        </section>
        <section className="panel">
          <h2>Bill details</h2>
          <div className="info-grid">
            <span>
              Customer<b>{bill.customer}</b>
            </span>
            <span>
              Payment<b>{bill.payment}</b>
            </span>
            <span>
              Staff
              <b>
                {bill.customer === "Walk-in customer"
                  ? "Rahul Patil"
                  : "Pooja Shinde"}
              </b>
            </span>
            <span>
              Status<b>{cancelled ? "Cancelled" : bill.status}</b>
            </span>
            <span>
              Amount paid<b>{formatINR(bill.total - bill.due)}</b>
            </span>
            <span>
              Due<b>{formatINR(bill.due)}</b>
            </span>
          </div>
          <div className="panel-head">
            <h2>Payments</h2>
            <button
              className="button secondary"
              onClick={() => toast("Payment record opened")}
            >
              Record payment
            </button>
          </div>
          <p className="timeline-item">
            {bill.date} · {bill.payment} · {formatINR(bill.total - bill.due)}
          </p>
          <label className="form-label">
            Staff note
            <textarea rows={3} placeholder="Add a note about this bill" />
          </label>
        </section>
      </div>
      <div className="detail-actions">
        <button
          className="button secondary"
          onClick={() => toast("Return items flow opened")}
        >
          <RotateCcw />
          Return items
        </button>
        {isOwner && !cancelled && (
          <button
            className="button danger-outline"
            onClick={() => setCancelOpen(true)}
          >
            Cancel bill
          </button>
        )}
      </div>
      {cancelOpen && (
        <div className="overlay" onMouseDown={() => setCancelOpen(false)}>
          <section
            className="dialog-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="dialog-close"
              aria-label="Close dialog"
              onClick={() => setCancelOpen(false)}
            >
              <X />
            </button>
            <h2 id="cancel-title">Cancel bill</h2>
            <p className="muted">
              This will mark {bill.id} as cancelled. Add a reason for the audit
              history.
            </p>
            <label className="form-label">
              Reason
              <input
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="e.g. Duplicate bill"
              />
            </label>
            <div className="dialog-actions">
              <button
                className="button secondary"
                onClick={() => setCancelOpen(false)}
              >
                Keep bill
              </button>
              <button
                className="button danger-outline"
                disabled={!reason.trim()}
                onClick={() => {
                  setCancelled(true);
                  setCancelOpen(false);
                  toast.success("Bill cancelled");
                }}
              >
                Confirm cancellation
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
