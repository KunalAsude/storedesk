"use client";
import { MiniTheme } from "@/components/admin/mini-theme";
import { SimpleTable } from "@/components/common/simple-table";
import { StatusBadge } from "@/components/common/status-badge";
import { TodoCard } from "@/components/common/todo-card";
import {
    ArrowRight,
    Plus
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function CompanyDetail({ company, tab, setTab, setDialog }: any) {
  const [paused, setPaused] = useState(company.status === "Paused");
  const [allowedThemes, setAllowedThemes] = useState<string[]>([
    "brown",
    "sage",
    "graphite",
    "olive",
    "maroon",
    "terracotta",
  ]);
  const [defaultTheme, setDefaultTheme] = useState("brown");
  const [services, setServices] = useState<Record<string, boolean>>({
    Inventory: true,
    Billing: true,
    Sales: true,
    Returns: true,
    Customers: true,
    Reports: true,
    Profit: false,
    "CSV import": false,
    Branches: false,
    Offers: false,
    "Online store": false,
  });
  const [noteDraft, setNoteDraft] = useState("");
  const [members, setMembers] = useState([
    { name: company.owner, contact: company.email, role: "Owner", lastLogin: "Today, 3:22 pm", status: "Active" },
    { name: "Pooja Shinde", contact: "pooja.shinde@gmail.com", role: "Cashier", lastLogin: "Today, 2:40 pm", status: "Active" },
    { name: "Ganesh Kale", contact: "+91 98224 12345", role: "Stock staff", lastLogin: "Yesterday", status: "Active" },
  ]);
  const [notes, setNotes] = useState([
    {
      author: "Kunal · Super admin",
      date: "Today, 3:48 pm",
      text: "Owner requested a follow-up about adding a second branch next quarter.",
    },
  ]);
  const tabs = [
    "Overview",
    "Subscription",
    "Services",
    "Stores",
    "Users",
    "Appearance",
    "Activity",
    "Notes",
  ];
  return (
    <>
      <div className="detail-heading">
        <button
          className="icon-btn"
          onClick={() => history.back()}
          aria-label="Go back"
        >
          <ArrowRight className="back-icon" />
        </button>
        <span className="company-avatar large">
          {company.name.slice(0, 2).toUpperCase()}
        </span>
        <div className="detail-title">
          <h1>{company.name}</h1>
          <div>
            <StatusBadge status={paused ? "Paused" : company.status} />
            <span className={`plan-pill ${company.plan.toLowerCase()}`}>
              {company.plan}
            </span>
            <span className="muted">
              Expires {company.expiry} · Owner: {company.owner}
            </span>
          </div>
        </div>
        <button
          className="button secondary"
          onClick={() => setDialog("Change plan")}
        >
          Change plan
        </button>
        <button
          className="button secondary"
          onClick={() => toast("Subscription extended")}
        >
          Extend
        </button>
        <button
          className="button secondary"
          onClick={() => {
            setPaused((value: boolean) => !value);
            toast.success(paused ? "Subscription resumed" : "Subscription paused");
          }}
        >
          {paused ? "Resume" : "Pause"}
        </button>
        <button
          className="button danger-outline"
          onClick={() => setDialog("Stop subscription")}
        >
          Stop subscription
        </button>
      </div>
      <div className="tabs-row">
        {tabs.map((t) => (
          <button
            className={tab === t ? "active" : ""}
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Overview" ? (
        <>
          <div className="stats-grid compact-stats">
            {[
              ["Bills 30d", "486"],
              ["Sales 30d", "₹4,82,550"],
              ["Products", "124"],
              ["Users", "4"],
            ].map(([a, b]) => (
              <div className="metric-card" key={a}>
                <small>{a}</small>
                <b>{b}</b>
              </div>
            ))}
          </div>
          <div className="dashboard-grid">
            <div className="panel">
              <h2>Business information</h2>
              <div className="info-grid">
                <span>
                  Company name<b>{company.name}</b>
                </span>
                <span>
                  City<b>{company.city}, Maharashtra</b>
                </span>
                <span>
                  Owner<b>{company.owner}</b>
                </span>
                <span>
                  Email<b>{company.email}</b>
                </span>
                <span>
                  Phone<b>+91 98223 45678</b>
                </span>
                <span>
                  GST registered<b>No</b>
                </span>
              </div>
            </div>
            <div className="panel">
              <h2>Usage vs plan limits</h2>
              {[
                ["Stores", 1, 3],
                ["Users", 4, 10],
                ["Products", 124, 500],
                ["Bills this month", 486, 1500],
                ["Storage", 2.4, 10],
              ].map(([n, a, b]: any) => (
                <div className="usage-row" key={n}>
                  <div>
                    <span>{n}</span>
                    <b>
                      {a} / {b}
                    </b>
                  </div>
                  <div className="progress-track">
                    <i style={{ width: `${Math.min((a / b) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : tab === "Appearance" ? (
        <>
          <div className="theme-card-grid">
            {["brown", "sage", "graphite", "olive", "maroon", "terracotta"].map(
              (t: string) => (
                <div className="theme-admin-card" data-theme={t} key={t}>
                  <MiniTheme name={t} />
                  <div className="theme-admin-info">
                    <label>
                      <input
                        type="checkbox"
                        checked={allowedThemes.includes(t)}
                        onChange={(event) => {
                          if (!event.target.checked && defaultTheme === t) {
                            toast.error("Choose another default theme first");
                            return;
                          }
                          setAllowedThemes((current) =>
                            event.target.checked
                              ? [...current, t]
                              : current.filter((item) => item !== t),
                          );
                        }}
                        aria-label={`Allow ${t} theme`}
                      />
                      <b>{t}</b>
                    </label>
                    <button
                      className="text-action"
                      disabled={!allowedThemes.includes(t)}
                      onClick={() => {
                        setDefaultTheme(t);
                        toast.success(`${t} set as the default theme`);
                      }}
                    >
                      {defaultTheme === t ? "Default theme" : "Set as default"}
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>
          <div className="panel service-list">
            <h2>Store preview</h2>
            <MiniTheme name={defaultTheme} />
          </div>
        </>
      ) : tab === "Services" ? (
        <div className="panel service-list">
          {Object.keys(services).map((s, i) => (
            <div className="service-row" key={s}>
              <span>
                {s}
                <small>{i < 6 ? "Included in plan" : "Added manually"}</small>
              </span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={services[s]}
                  onChange={(event) =>
                    setServices((current) => ({
                      ...current,
                      [s]: event.target.checked,
                    }))
                  }
                  role="switch"
                  aria-label={`Enable ${s}`}
                />
                <span />
              </label>
            </div>
          ))}
        </div>
      ) : tab === "Users" ? (
        <div className="panel">
          <div className="panel-head">
            <h2>Members</h2>
            <button
              className="button primary"
              onClick={() => setDialog("Invite user")}
            >
              <Plus />
              Invite user
            </button>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  {["Name", "Email / phone", "Role", "Last login", "Status", "Actions"].map((heading) => (
                    <th key={heading}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.contact}>
                    <td>{member.name}</td>
                    <td>{member.contact}</td>
                    <td>{member.role}</td>
                    <td>{member.lastLogin}</td>
                    <td><StatusBadge status={member.status} /></td>
                    <td>
                      {member.role !== "Owner" ? (
                        <div className="row-actions">
                          <button
                            className="text-action"
                            onClick={() => toast.success(`Password reset sent to ${member.contact}`)}
                          >
                            Reset password
                          </button>
                          <button
                            className="text-action"
                            onClick={() => {
                              setMembers((current) => current.map((item) =>
                                item.contact === member.contact
                                  ? { ...item, status: item.status === "Active" ? "Inactive" : "Active" }
                                  : item,
                              ));
                              toast.success(`${member.name} ${member.status === "Active" ? "deactivated" : "reactivated"}`);
                            }}
                          >
                            {member.status === "Active" ? "Deactivate" : "Reactivate"}
                          </button>
                        </div>
                      ) : <span className="muted">Primary owner</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : tab === "Subscription" ? (
        <div className="dashboard-grid">
          <div className="panel">
            <h2>Pro plan</h2>
            <p className="muted">₹599 per month · Started 12 Jan 2026</p>
            <div className="metric-card">
              <small>Next renewal</small>
              <b>12 Jan 2027</b>
            </div>
            <button
              className="button primary"
              onClick={() => setDialog("Record payment")}
            >
              Record payment
            </button>
          </div>
          <div className="panel">
            <h2>Subscription timeline</h2>
            {[
              "12 Jan 2026 · Trial started",
              "26 Jan 2026 · Upgraded to Pro",
              "12 Oct 2026 · Payment recorded",
            ].map((x) => (
              <p className="timeline-item" key={x}>
                {x}
              </p>
            ))}
          </div>
        </div>
      ) : tab === "Stores" ? (
        <>
          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>Stores</h2>
                <p className="muted">Locations belonging to {company.name}.</p>
              </div>
              <span className="status-badge neutral">{company.stores} store</span>
            </div>
            <SimpleTable
              headers={["Store", "City", "Manager", "Status"]}
              rows={[[company.name, `${company.city}, Maharashtra`, company.owner, "Active"]]}
            />
          </div>
          <TodoCard
            title="Add another branch"
            desc="Branch creation is planned; existing store locations can be reviewed here."
          />
        </>
      ) : tab === "Activity" ? (
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Company activity</h2>
              <p className="muted">Recent changes and events for {company.name}.</p>
            </div>
          </div>
          <div className="audit-list">
            {[
              ["Today, 3:42 pm", "Kunal · Super admin", "Changed plan Plus → Pro", "Subscription"],
              ["Today, 2:12 pm", company.owner, "Added 12 units of Premium Plain Shirt", "Inventory"],
              ["12 Oct 2026", "Kunal · Super admin", "Payment recorded · ₹599", "Billing"],
            ].map(([date, actor, action, entity]) => (
              <div className="audit-item" key={`${date}-${action}`}>
                <div className="audit-dot" />
                <span className="audit-time">{date}</span>
                <b>{actor}</b>
                <span>{action}</span>
                <small>{entity}</small>
              </div>
            ))}
          </div>
        </div>
      ) : tab === "Notes" ? (
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Internal notes</h2>
              <p className="muted">Visible only to the StoreDesk platform team.</p>
            </div>
          </div>
          <form
            className="note-composer"
            onSubmit={(event) => {
              event.preventDefault();
              const text = noteDraft.trim();
              if (!text) return;
              setNotes((current) => [
                { author: "Kunal · Super admin", date: "Just now", text },
                ...current,
              ]);
              setNoteDraft("");
              toast.success("Internal note added");
            }}
          >
            <label className="form-label">
              Add a note
              <input
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                placeholder="Write a note for your team…"
                maxLength={500}
              />
            </label>
            <button className="button primary" type="submit" disabled={!noteDraft.trim()}>
              <Plus />
              Add note
            </button>
          </form>
          <div className="note-list">
            {notes.map((note, index) => (
              <article className="note-entry" key={`${note.date}-${index}`}>
                <div className="note-meta">
                  <b>{note.author}</b>
                  <time>{note.date}</time>
                </div>
                <p>{note.text}</p>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="panel">
          <h2>{tab}</h2>
          <p className="muted">Recent activity and notes for {company.name}.</p>
        </div>
      )}
    </>
  );
}
