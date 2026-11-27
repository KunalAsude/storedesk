"use client";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Download,
    Filter,
    Search
} from "lucide-react";
import { toast } from "sonner";

export function HistoryPage() {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">PLATFORM ADMIN</div>
          <h1>History</h1>
          <p>A complete record of changes across StoreDesk.</p>
        </div>
        <button
          className="button secondary"
          onClick={() => toast("Export prepared")}
        >
          <Download />
          Export
        </button>
      </div>
      <div className="list-toolbar">
        <div className="search-field">
          <Search />
          <input placeholder="Search audit history" />
        </div>
        <button className="button secondary">
          <Filter />
          Filters
        </button>
        <Select defaultValue="All companies">
          <SelectTrigger
            className="select-control"
            aria-label="Filter audit log by company"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All companies">All companies</SelectItem>
            <SelectItem value="Brand Hub Mens Wear">
              Brand Hub Mens Wear
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="panel audit-list">
        {[
          [
            "Today, 3:42 pm",
            "Kunal · Super admin",
            "Brand Hub Mens Wear",
            "Changed plan Plus → Pro",
            "Subscription",
          ],
          [
            "Today, 2:12 pm",
            "Rahul Patil · Owner",
            "Brand Hub Mens Wear",
            "Added 12 units of Premium Plain Shirt",
            "Inventory",
          ],
          [
            "Today, 11:08 am",
            "Friend · Admin",
            "Shree Saree Centre",
            "Extended trial by 14 days",
            "Subscription",
          ],
          [
            "Yesterday, 6:20 pm",
            "Pooja Shinde · Cashier",
            "Brand Hub Mens Wear",
            "Completed bill BH/26-27/0142",
            "Billing",
          ],
        ].map((x, i) => (
          <details className="audit-item" key={i}>
            <summary>
              <span className="audit-dot" />
              <span className="audit-time">{x[0]}</span>
              <b>{x[1]}</b>
              <span>{x[2]}</span>
              <strong>{x[3]}</strong>
              <small>{x[4]}</small>
            </summary>
            <div className="audit-diff">
              <code>
                {"{"}"before": "Plus", "after": "Pro"{"}"}
              </code>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
