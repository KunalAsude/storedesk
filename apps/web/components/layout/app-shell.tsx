"use client";
import { ShellContext } from "@/components/layout/shell-context";
import {
    companies
} from "@/lib/mock/data";
import { hasPermission } from "@/lib/permissions";
import type { ThemeName, UserRole } from "@/lib/types";
import {
    Activity,
    ArrowRight,
    BarChart3,
    Bell,
    Boxes,
    Building2,
    CalendarDays,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CircleHelp,
    ClipboardList,
    CreditCard,
    FileClock,
    FileText,
    LayoutDashboard,
    LockKeyhole,
    Menu,
    Moon,
    Package,
    Search,
    Settings,
    ShoppingBag,
    ShoppingCart,
    SlidersHorizontal,
    Sparkles,
    Sun,
    Tag,
    Truck,
    Users,
    Wallet,
    X
} from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const themes: ThemeName[] = [
  "brown",
  "sage",
  "graphite",
  "olive",
  "maroon",
  "terracotta",
];

const fmt = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: paise % 100 ? 2 : 0,
  }).format(paise / 100);

const nice = (s: string) =>
  s
    .split(/[/-]/)
    .filter(Boolean)
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
    .join(" ");

const navGroups: {
  title: string;
  items: [string, string, typeof Activity][];
}[] = [
  {
    title: "ADMIN",
    items: [
      ["Analytics", "/admin/analytics", BarChart3],
      ["Companies", "/admin/companies", Building2],
      ["Plans", "/admin/plans", CreditCard],
      ["Users & invites", "/admin/users", Users],
      ["History", "/admin/history", FileClock],
      ["Themes", "/admin/themes", Tag],
      ["Platform settings", "/admin/settings", Settings],
    ],
  },
  {
    title: "OVERVIEW",
    items: [["Dashboard", "/store/dashboard", LayoutDashboard]],
  },
  {
    title: "SELL",
    items: [
      ["Billing (POS)", "/store/billing", ShoppingCart],
      ["Sales history", "/store/sales", FileText],
    ],
  },
  {
    title: "INVENTORY",
    items: [
      ["Products", "/store/inventory/products", Package],
      ["Categories", "/store/inventory/categories", Boxes],
      ["Stock", "/store/inventory/stock", ClipboardList],
      ["Purchases", "/store/inventory/purchases", Truck],
      ["Adjustments", "/store/inventory/adjustments", SlidersHorizontal],
      ["Suppliers", "/store/inventory/suppliers", Building2],
    ],
  },
  {
    title: "PEOPLE",
    items: [
      ["Customers", "/store/customers", Users],
      ["Staff", "/store/staff", Users],
    ],
  },
  { title: "INSIGHTS", items: [["Reports", "/store/reports", BarChart3]] },
  {
    title: "SETTINGS",
    items: [["Store settings", "/store/settings", Settings]],
  },
  {
    title: "COMING SOON",
    items: [
      ["Offers", "/store/offers", Tag],
      ["Online store", "/store/online-store", ShoppingBag],
      ["Enquiries", "/store/enquiries", CircleHelp],
      ["Expenses", "/store/expenses", Wallet],
      ["Branches", "/store/branches", Building2],
      ["Integrations", "/store/integrations", Sparkles],
    ],
  },
];

const roleTypes: UserRole[] = [
  "Super admin",
  "Owner",
  "Cashier",
  "Stock staff",
];

let activePreviewRole: UserRole = "Super admin";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/store/dashboard";
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<UserRole>(activePreviewRole);
  const [compact, setCompact] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const [storeSearch, setStoreSearch] = useState("");
  const [activeCompanyId, setActiveCompanyId] = useState(companies[0].id);
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState("");
  const [filter, setFilter] = useState("All");
  const onAdmin = pathname.startsWith("/admin");
  const current = navGroups
    .flatMap((g) => g.items)
    .find((i) => pathname === i[1] || pathname.startsWith(i[1] + "/"));
  const title = current?.[0] || nice(pathname.split("/").pop() || "Dashboard");
  const company =
    companies.find((item) => item.id === activeCompanyId) ?? companies[0];
  const canAdmin =
    role === "Super admin" || role === "Admin" || role === "Support";
  const currentNav = navGroups
    .map((g) => ({
      ...g,
      items: g.items.filter(([, path]) => {
        if (path.startsWith("/admin")) return canAdmin;
        if (canAdmin) return true;
        if (path === "/store/dashboard")
          return hasPermission(role, "dashboard.view");
        if (path === "/store/billing")
          return hasPermission(role, "billing.create");
        if (path.startsWith("/store/sales"))
          return hasPermission(role, "sales.view");
        if (path.startsWith("/store/inventory/"))
          return hasPermission(role, "inventory.view");
        if (path.startsWith("/store/customers"))
          return hasPermission(role, "customers.view");
        if (path === "/store/reports")
          return hasPermission(role, "reports.view");
        if (path === "/store/staff") return hasPermission(role, "staff.manage");
        if (path === "/store/settings")
          return hasPermission(role, "settings.manage");
        return role === "Owner" || role === "Manager";
      }),
    }))
    .filter((g) => g.items.length);
  useEffect(() => {
    setMounted(true);
    setCompact(localStorage.getItem("storedesk-sidebar") === "1");
  }, []);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "F2") {
        e.preventDefault();
        document.getElementById("pos-search")?.focus();
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setDialog("");
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);
  const toggleCompact = () =>
    setCompact((v) => {
      localStorage.setItem("storedesk-sidebar", v ? "0" : "1");
      return !v;
    });
  const route = (path: string) => {
    router.push(path);
    setMobileOpen(false);
    setStoreOpen(false);
  };
  const banner = pathname === "/store/dashboard" && role === "Owner";
  const requiredPermission = pathname.startsWith("/admin")
    ? "admin.view"
    : pathname.startsWith("/store/inventory/")
      ? "inventory.view"
      : pathname.startsWith("/store/sales")
        ? "sales.view"
        : pathname.startsWith("/store/billing")
          ? "billing.create"
          : pathname.startsWith("/store/customers")
            ? "customers.view"
            : pathname === "/store/reports"
              ? "reports.view"
              : pathname === "/store/staff"
                ? "staff.manage"
                : pathname === "/store/settings"
                  ? "settings.manage"
                  : "dashboard.view";
  if (
    (pathname.startsWith("/admin") && !canAdmin) ||
    (pathname.startsWith("/store") && !hasPermission(role, requiredPermission))
  )
    return (
      <main className="access-denied">
        <section className="panel">
          <LockKeyhole />
          <div>
            <h1>You don&apos;t have access</h1>
            <p>This page isn&apos;t available for the current preview role.</p>
            <button
              className="button primary"
              onClick={() => route("/store/dashboard")}
            >
              Return to dashboard
            </button>
          </div>
        </section>
      </main>
    );
  return (
    <ShellContext.Provider
      value={{ pathname, title, role, route, fmt, setDialog, filter, setFilter }}
    >
    <div className="app-shell">
      <aside
        className={`sidebar ${compact ? "sidebar-compact" : ""} ${mobileOpen ? "sidebar-mobile-open" : ""}`}
      >
        <button className="brand" onClick={() => route("/store/dashboard")}>
          <span className="brand-mark">S</span>
          {!compact && <span>StoreDesk</span>}
        </button>
        <div className="side-scroll">
          {currentNav.map((group) => (
            <section className="nav-group" key={group.title}>
              <div className="nav-label">{!compact && group.title}</div>
              {group.items.map(([label, path, Icon]) => (
                <button
                  title={compact ? label : undefined}
                  key={path}
                  onClick={() => route(path)}
                  className={`nav-link ${pathname === path || pathname.startsWith(path + "/") ? "active" : ""}`}
                >
                  <Icon />
                  <span>{label}</span>
                  {group.title === "COMING SOON" && (
                    <span className="nav-soon">Soon</span>
                  )}
                </button>
              ))}
            </section>
          ))}
        </div>
        {!compact && (
          <div className="plan-badge">
            <span className="plan-dot" />
            <div>
              <b>Pro plan</b>
              <small>Renews 12 Jan 2027</small>
            </div>
            <ChevronRight />
          </div>
        )}
        <button
          className="collapse-btn"
          onClick={toggleCompact}
          aria-label="Collapse sidebar"
        >
          <ChevronLeft />
        </button>
      </aside>
      {mobileOpen && (
        <button
          className="scrim"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <main className="main-area">
        <header className="topbar">
          <button
            className="icon-btn mobile-menu"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu />
          </button>
          <div className="breadcrumb">
            <span>
              {canAdmin && pathname.startsWith("/admin") ? "Admin" : "Store"}
            </span>
            <ChevronRight />
            <b>{title}</b>
          </div>
          <div className="top-actions">
            <button
              className="search-trigger"
              onClick={() => setSearchOpen(true)}
            >
              <Search />
              <span>Search…</span>
              <kbd>⌘ K</kbd>
            </button>
            <div className="menu-wrap">
              <button
                className="store-trigger"
                onClick={() => setStoreOpen(!storeOpen)}
              >
                <span className="store-avatar">
                  {onAdmin ? "PL" : company.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="store-name">
                  {onAdmin ? "Platform" : company.name}
                </span>
                <ChevronDown />
              </button>
              {storeOpen && (
                <div className="menu-pop store-pop">
                  <small>MY STORES</small>
                  {canAdmin && (
                    <button
                      onClick={() => {
                        setStoreOpen(false);
                        route("/store/dashboard");
                      }}
                    >
                      <span className="mini-avatar">{company.name.slice(0, 2)}</span>
                      <span>
                        {company.name}
                        <small>{company.city} · {company.plan}</small>
                      </span>
                    </button>
                  )}
                  {canAdmin && <small>OPEN A STORE</small>}
                  <label className="store-search">
                    <Search aria-hidden="true" />
                    <input
                      aria-label="Search stores"
                      value={storeSearch}
                      onChange={(event) => setStoreSearch(event.target.value)}
                      placeholder="Search stores"
                    />
                  </label>
                  {companies
                    .filter((item) =>
                      `${item.name} ${item.city}`
                        .toLowerCase()
                        .includes(storeSearch.trim().toLowerCase()),
                    )
                    .map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setActiveCompanyId(c.id);
                          setStoreSearch("");
                          setStoreOpen(false);
                          route("/store/dashboard");
                        }}
                      >
                        <span className="mini-avatar">{c.name.slice(0, 2)}</span>
                        <span>
                          {c.name}
                          <small>
                            {c.city} · {c.plan}
                          </small>
                        </span>
                      </button>
                    ))}
                  {companies.every(
                    (item) =>
                      !`${item.name} ${item.city}`
                        .toLowerCase()
                        .includes(storeSearch.trim().toLowerCase()),
                  ) && <p className="store-search-empty">No stores found.</p>}
                </div>
              )}
            </div>
            <div className="menu-wrap">
              <button
                aria-label="Notifications"
                className="icon-btn notify"
                onClick={() => setBellOpen(!bellOpen)}
              >
                <Bell />
                <i />
              </button>
              {bellOpen && (
                <div className="menu-pop notification-pop">
                  <b>Notifications</b>
                  <p>
                    <span className="notification-dot" /> 3 items are running
                    low in stock
                  </p>
                  <p>
                    <span className="notification-dot warm" /> Shree Saree
                    Centre trial ends in 14 days
                  </p>
                  <p>
                    <span className="notification-dot green" /> Pooja accepted
                    your invite
                  </p>
                  <button
                    className="text-action"
                    onClick={() => {
                      setBellOpen(false);
                      toast.success("All caught up");
                    }}
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </div>
            <div className="menu-wrap">
              <button
                className="icon-btn"
                aria-label="Theme settings"
                onClick={() => setThemeOpen(!themeOpen)}
              >
                {mounted && theme === "dark" ? <Moon /> : <Sun />}
              </button>
              {themeOpen && (
                <div className="menu-pop theme-pop">
                  <b>Appearance</b>
                  <div className="mode-row">
                    {["light", "dark", "system"].map((m) => (
                      <button
                        key={m}
                        className={theme === m ? "selected" : ""}
                        onClick={() => setTheme(m)}
                      >
                        {m === "light" ? (
                          <Sun />
                        ) : m === "dark" ? (
                          <Moon />
                        ) : (
                          <Sparkles />
                        )}
                        {nice(m)}
                      </button>
                    ))}
                  </div>
                  <small>COLOUR THEME</small>
                  {themes.map((t) => (
                    <button
                      className="theme-row"
                      key={t}
                      onClick={() => {
                        document.documentElement.dataset.theme = t;
                        setThemeOpen(false);
                      }}
                    >
                      <span className="theme-swatch" data-swatch={t} />
                      {nice(t)}
                      {document.documentElement.dataset.theme === t && (
                        <Check />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="menu-wrap">
              <button
                className="profile-trigger"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <span className="profile-avatar">
                  {role === "Cashier"
                    ? "PS"
                    : role === "Stock staff"
                      ? "GK"
                      : role === "Owner"
                        ? "RP"
                        : "KN"}
                </span>
                <ChevronDown />
              </button>
              {profileOpen && (
                <div className="menu-pop profile-pop">
                  <b>
                    {role === "Owner"
                      ? "Rahul Patil"
                      : role === "Cashier"
                        ? "Pooja Shinde"
                        : role === "Stock staff"
                          ? "Ganesh Kale"
                          : "Kunal"}
                  </b>
                  <small>
                    {role === "Owner"
                      ? "rahul.patil@gmail.com"
                      : "kunal@storedesk.in"}
                  </small>
                  <span className="role-pill">{role}</span>
                  <hr />
                  <small>PREVIEW AS</small>
                  {roleTypes.map((r) => (
                    <button
                      key={r}
                      className="role-option"
                      onClick={() => {
                        activePreviewRole = r;
                        setRole(r);
                        setProfileOpen(false);
                        if (
                          !["Super admin", "Admin", "Support"].includes(r) &&
                          pathname.startsWith("/admin")
                        )
                          route("/store/dashboard");
                        toast.success(`Previewing as ${r}`);
                      }}
                    >
                      {r}
                      {role === r && <Check />}
                    </button>
                  ))}
                  <hr />
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setDialog("My profile");
                    }}
                  >
                    My profile
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setDialog("Change password");
                    }}
                  >
                    Change password
                  </button>
                  <button
                    onClick={() => toast("You are signed out in this demo")}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        {banner && (
          <div className="banner trial-banner">
            <CalendarDays />
            Your Pro plan renews on 12 Jan 2027.
            <button onClick={() => route("/store/settings")}>
              Manage plan <ArrowRight />
            </button>
          </div>
        )}
        {pathname.startsWith("/store") &&
          ["Super admin", "Admin", "Support"].includes(role) && (
            <div className="banner support-banner">
              <LockKeyhole />
              Support view — you are viewing Brand Hub as StoreDesk support
              <button onClick={() => route("/admin/companies")}>
                Back to admin <ArrowRight />
              </button>
            </div>
          )}
        <div className="content-area">
          {children}
        </div>
      </main>
      {searchOpen && (
        <div className="overlay" onMouseDown={() => setSearchOpen(false)}>
          <div className="command-box" onMouseDown={(e) => e.stopPropagation()}>
            <div className="command-input">
              <Search />
              <input
                autoFocus
                placeholder="Search pages, products, bills…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button onClick={() => setSearchOpen(false)}>Esc</button>
            </div>
            <small>QUICK NAVIGATION</small>
            {[
              ["Dashboard", "/store/dashboard"],
              ["Billing (POS)", "/store/billing"],
              ["Sales history", "/store/sales"],
              ["Products", "/store/inventory/products"],
              ["Companies", "/admin/companies"],
              ["Analytics", "/admin/analytics"],
            ]
              .filter(
                (x) =>
                  !query || x[0].toLowerCase().includes(query.toLowerCase()),
              )
              .map(([n, p]) => (
                <button
                  className="command-option"
                  key={p}
                  onClick={() => {
                    setSearchOpen(false);
                    route(p);
                  }}
                >
                  <span>
                    <LayoutDashboard />
                    {n}
                  </span>
                  <ArrowRight />
                </button>
              ))}
            <div className="command-footer">
              ↑↓ to navigate <span>↵ to select</span>
            </div>
          </div>
        </div>
      )}
      {dialog && (
        <div className="overlay" onMouseDown={() => setDialog("")}>
          <div className="dialog-card" onMouseDown={(e) => e.stopPropagation()}>
            <button
              className="dialog-close"
              onClick={() => setDialog("")}
              aria-label="Close"
            >
              <X />
            </button>
            <>
                <h2>{dialog}</h2>
                <p className="muted">
                  Complete the details below. Changes are saved in this demo.
                </p>
                {dialog === "Change password" ? (
                  <>
                    <label className="form-label">
                      Current password
                      <input type="password" autoComplete="current-password" />
                    </label>
                    <label className="form-label">
                      New password
                      <input type="password" autoComplete="new-password" />
                    </label>
                    <label className="form-label">
                      Confirm new password
                      <input type="password" autoComplete="new-password" />
                    </label>
                  </>
                ) : (
                  <>
                    <label className="form-label">
                      Name
                      <input placeholder="Enter a name" />
                    </label>
                    <label className="form-label">
                      Email or phone
                      <input placeholder="name@example.com" />
                    </label>
                  </>
                )}
                <div className="dialog-actions">
                  <button
                    className="button secondary"
                    onClick={() => setDialog("")}
                  >
                    Cancel
                  </button>
                  <button
                    className="button primary"
                    onClick={() => {
                      setDialog("");
                      toast.success("Saved successfully");
                    }}
                  >
                    Save changes
                  </button>
                </div>
              </>
          </div>
        </div>
      )}
    </div>
    </ShellContext.Provider>
  );
}
