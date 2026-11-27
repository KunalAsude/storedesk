"use client";
import { TodoCard } from "@/components/common/todo-card";
import type { Company } from "@/lib/types";
import {
    Check,
    MoreHorizontal,
    Plus
} from "lucide-react";
import { useState } from "react";

export function PlansPage({
  companies,
  filter,
  setFilter,
  route,
  fmt,
  setDialog,
}: any) {
  const [tab, setTab] = useState("Overview");
  const [range, setRange] = useState("Last 30 days");
  const [term, setTerm] = useState("");
  const filtered = companies.filter(
    (c: Company) =>
      (!term ||
        `${c.name} ${c.owner} ${c.city}`
          .toLowerCase()
          .includes(term.toLowerCase())) &&
      (filter === "All" || c.status === filter || c.plan === filter),
  );
  const demoToday = Date.UTC(2026, 10, 26);
  const expiring = companies.filter((c: Company) => {
    const expiresAt = Date.parse(`${c.expiry} 00:00:00 UTC`);
    return (
      ["Active", "Trial"].includes(c.status) &&
      expiresAt >= demoToday &&
      expiresAt <= demoToday + 14 * 86400000
    );
  });
  const pastDue = companies.filter((c: Company) => c.status === "Past due");
    return (
      <>
        <div className="page-heading">
          <div>
            <div className="eyebrow">PLATFORM ADMIN</div>
            <h1>Plans</h1>
            <p>Plans that help every shop find its footing.</p>
          </div>
          <button
            className="button primary"
            onClick={() => setDialog("New plan")}
          >
            <Plus />
            New plan
          </button>
        </div>
        <div className="plan-grid">
          {[
            {
              name: "Free",
              price: "₹0",
              desc: "A simple place to start.",
              features: [
                "1 store",
                "1 user",
                "100 products",
                "Unlimited bills",
                "Basic reports",
              ],
            },
            {
              name: "Plus",
              price: "₹299",
              desc: "For growing neighbourhood shops.",
              features: [
                "1 store",
                "3 users",
                "1,000 products",
                "Unlimited bills",
                "Sales reports",
              ],
            },
            {
              name: "Pro",
              price: "₹599",
              desc: "Everything your business needs.",
              features: [
                "3 stores",
                "10 users",
                "Unlimited products",
                "Unlimited bills",
                "Profit reports & exports",
              ],
            },
          ].map((p: any) => (
            <div
              className={`plan-card ${p.name === "Pro" ? "featured" : ""}`}
              key={p.name}
            >
              <div className="plan-card-top">
                <span className={`plan-pill ${p.name.toLowerCase()}`}>
                  {p.name}
                </span>
                <button
                  className="icon-btn tiny"
                  onClick={() => setDialog(`Edit ${p.name} plan`)}
                >
                  <MoreHorizontal />
                </button>
              </div>
              <h2>
                {p.price}
                <small>/ month</small>
              </h2>
              <p>{p.desc}</p>
              <button
                className="button secondary full"
                onClick={() => setDialog(`Edit ${p.name} plan`)}
              >
                Edit plan
              </button>
              <hr />
              {p.features.map((f: string) => (
                <div className="feature-row" key={f}>
                  <Check />
                  {f}
                </div>
              ))}
            </div>
          ))}
        </div>
        <TodoCard
          title="Coupons and online payments"
          desc="Offer promotions and collect online payments with Razorpay when this capability is ready."
        />
      </>
    );
}
