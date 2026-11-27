"use client";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ArrowRight,
    BarChart3
} from "lucide-react";
import { toast } from "sonner";

export function ReportsPage() {
  const rows = [
    ["Sales summary", "Revenue, bills and average bill value."],
    ["By payment mode", "See how customers are paying."],
    ["By staff", "Compare team sales and activity."],
    ["Best sellers", "Find your most popular products."],
    ["By category", "Understand category performance."],
    ["By size", "Popular sizes by quantity."],
    ["By colour", "Explore your colour mix."],
    ["Dead stock", "Products with no sales in 60 or 90 days."],
    ["Profit", "Gross margin and profit by product."],
  ];
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">INSIGHTS</div>
          <h1>Reports</h1>
          <p>Useful answers for your next business decision.</p>
        </div>
        <Select defaultValue="Last 30 days">
          <SelectTrigger
            className="select-control"
            aria-label="Report date range"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Last 30 days">Last 30 days</SelectItem>
            <SelectItem value="Last 7 days">Last 7 days</SelectItem>
            <SelectItem value="This year">This year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="report-grid">
        {rows.map((x, i) => (
          <button
            className={`report-card ${i === 8 ? "locked" : ""}`}
            key={x[0]}
            onClick={() =>
              toast(
                i === 8
                  ? "Profit reports are included in Pro"
                  : "Report opened",
              )
            }
          >
            <span className="report-icon">
              {i === 8 ? <span>₹</span> : <BarChart3 />}
            </span>
            <b>{x[0]}</b>
            <p>{x[1]}</p>
            <ArrowRight className="report-arrow" />
          </button>
        ))}
      </div>
    </>
  );
}
