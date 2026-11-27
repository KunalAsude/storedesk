"use client";

import { useState } from "react";
import { ArrowLeft, MessageCircle, Plus, Wallet } from "lucide-react";
import { toast } from "sonner";
import { bills } from "@/lib/mock/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formatINR = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: paise % 100 ? 2 : 0,
  }).format(paise / 100);
const customers = [
  {
    id: "rahul-patil",
    name: "Rahul Patil",
    mobile: "+91 98223 45678",
    visits: 18,
    spend: 824500,
    due: 0,
  },
  {
    id: "sagar-shinde",
    name: "Sagar Shinde",
    mobile: "+91 98221 23456",
    visits: 12,
    spend: 512000,
    due: 149900,
  },
  {
    id: "amit-kale",
    name: "Amit Kale",
    mobile: "+91 98224 56789",
    visits: 9,
    spend: 362500,
    due: 29900,
  },
  {
    id: "neha-jadhav",
    name: "Neha Jadhav",
    mobile: "+91 98220 11122",
    visits: 6,
    spend: 184500,
    due: 0,
  },
];

export function CustomerDetailPage({
  customerId,
  route,
}: {
  customerId: string;
  route: (path: string) => void;
}) {
  const customer =
    customers.find((item) => item.id === decodeURIComponent(customerId)) ??
    customers[0];
  const [due, setDue] = useState(customer.due);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [payments, setPayments] = useState<string[]>([]);
  const relatedBills = bills.filter((bill) => bill.customer === customer.name);

  const recordPayment = () => {
    const amount = Math.round(Number(paymentAmount) * 100);
    if (!amount || amount > due)
      return toast.error("Enter a payment up to the outstanding amount");
    setDue((current) => Math.max(0, current - amount));
    setPayments((current) => [
      `Today · ${paymentMode} payment · ${formatINR(amount)}`,
      ...current,
    ]);
    setPaymentAmount("");
    setPaymentOpen(false);
    toast.success("Payment recorded");
  };

  return (
    <>
      <div className="page-heading">
        <div className="detail-product-title">
          <button
            className="icon-btn"
            aria-label="Back to customers"
            onClick={() => route("/store/customers")}
          >
            <ArrowLeft />
          </button>
          <span className="company-avatar large">
            {customer.name
              .split(" ")
              .map((word) => word[0])
              .join("")}
          </span>
          <div>
            <div className="eyebrow">PEOPLE · CUSTOMER</div>
            <h1>{customer.name}</h1>
            <p>{customer.mobile}</p>
          </div>
        </div>
        <div className="heading-action">
          <button
            className="button secondary"
            onClick={() => toast("WhatsApp reminder ready")}
          >
            <MessageCircle />
            WhatsApp reminder
          </button>
          <button
            className="button primary"
            disabled={due === 0}
            onClick={() => setPaymentOpen(true)}
          >
            <Plus />
            Record payment
          </button>
        </div>
      </div>
      <div className="stats-grid compact-stats">
        <div className="metric-card">
          <small>Visits</small>
          <b>{customer.visits}</b>
        </div>
        <div className="metric-card">
          <small>Total spent</small>
          <b>{formatINR(customer.spend)}</b>
        </div>
        <div className="metric-card">
          <small>Udhaar outstanding</small>
          <b>{formatINR(due)}</b>
        </div>
        <div className="metric-card">
          <small>Last visit</small>
          <b>26 Nov 2026</b>
        </div>
      </div>
      <div className="dashboard-grid">
        <section className="panel table-panel">
          <div className="panel-head">
            <div>
              <h2>Recent bills</h2>
              <p>Sales associated with {customer.name}.</p>
            </div>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bill no.</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Due</th>
                </tr>
              </thead>
              <tbody>
                {relatedBills.length ? (
                  relatedBills.map((bill) => (
                    <tr key={bill.id}>
                      <td>
                        <button
                          className="text-action mono"
                          onClick={() =>
                            route(`/store/sales/${encodeURIComponent(bill.id)}`)
                          }
                        >
                          {bill.id}
                        </button>
                      </td>
                      <td>{bill.date}</td>
                      <td>{bill.payment}</td>
                      <td>{formatINR(bill.total)}</td>
                      <td>{formatINR(bill.due)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="muted">
                      No bills yet for this customer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Udhaar ledger</h2>
              <p>Outstanding balance and payments.</p>
            </div>
            <Wallet />
          </div>
          {customer.due > 0 && (
            <div className="timeline-item">
              22 Nov 2026 · Bill BH/26-27/0138 · {formatINR(customer.due)}
            </div>
          )}
          {payments.map((payment) => (
            <div className="timeline-item" key={payment}>
              {payment}
            </div>
          ))}
          <div className="timeline-item">
            Today · Balance outstanding · {formatINR(due)}
          </div>
        </section>
      </div>
      {paymentOpen && (
        <div className="overlay" onMouseDown={() => setPaymentOpen(false)}>
          <section
            className="dialog-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 id="payment-title">Record payment</h2>
            <p className="muted">Outstanding balance · {formatINR(due)}</p>
            <label className="form-label">
              Amount received (₹)
              <input
                type="number"
                min="1"
                max={due / 100}
                value={paymentAmount}
                onChange={(event) => setPaymentAmount(event.target.value)}
              />
            </label>
            <label className="form-label">
              Payment mode
              <Select
                value={paymentMode}
                onValueChange={(value) => value && setPaymentMode(value)}
              >
                <SelectTrigger aria-label="Payment mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Bank transfer">Bank transfer</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <div className="dialog-actions">
              <button
                className="button secondary"
                onClick={() => setPaymentOpen(false)}
              >
                Cancel
              </button>
              <button className="button primary" onClick={recordPayment}>
                Save payment
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
