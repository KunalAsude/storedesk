"use client";
import { TodoCard } from "@/components/common/todo-card";
import { useState } from "react";
import { toast } from "sonner";

export function PlatformSettings() {
  const [tab, setTab] = useState("Company info");
  const tabs = ["Company info", "Email", "Subscriptions", "Security"];
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">PLATFORM ADMIN</div>
          <h1>Platform settings</h1>
          <p>Set the defaults that keep StoreDesk running well.</p>
        </div>
        <button
          className="button primary"
          onClick={() => toast.success("Platform settings saved")}
        >
          Save changes
        </button>
      </div>
      <div className="settings-layout">
        <nav className="settings-nav">
          {tabs.map((t) => (
            <button
              className={tab === t ? "active" : ""}
              key={t}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </nav>
        <div className="settings-content">
          <section className="panel settings-panel">
            <h2>{tab}</h2>
            <p className="muted">
              Configure {tab.toLowerCase()} defaults for StoreDesk.
            </p>
            <div className="settings-fields">
              {(tab === "Company info"
                ? ["Platform name", "Business address", "GSTIN for invoices"]
                : tab === "Email"
                  ? ["Sender name", "Reply-to email"]
                  : tab === "Subscriptions"
                    ? [
                        "Default trial days",
                        "Reminder days",
                        "Grace period days",
                      ]
                    : ["Session length"]
              ).map((x) => (
                <label className="form-label" key={x}>
                  {x}
                  <input
                    defaultValue={
                      x === "Platform name"
                        ? "StoreDesk"
                        : x === "Default trial days"
                          ? "14"
                          : x === "Reminder days"
                            ? "7, 3, 1"
                            : x === "Grace period days"
                              ? "7"
                              : ""
                    }
                  />
                </label>
              ))}
            </div>
          </section>
          <TodoCard
            title="Announcements"
            desc="Share important product updates with every shop on the platform."
          />
          <TodoCard
            title="Maintenance mode"
            desc="Let store owners know when scheduled maintenance is coming up."
          />
        </div>
      </div>
    </>
  );
}
