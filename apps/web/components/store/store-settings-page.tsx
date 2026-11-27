"use client";

import { useState } from "react";
import { Check, Printer, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const tabs = [
  "Store profile",
  "Billing",
  "Printing",
  "Payments",
  "Taxes",
  "Appearance",
  "Subscription",
];
const themes = ["brown", "sage", "graphite", "olive", "maroon", "terracotta"];

export function StoreSettingsPage() {
  const [tab, setTab] = useState("Store profile");
  const [paper, setPaper] = useState("58 mm");
  const [gst, setGst] = useState(false);
  const [billTitle, setBillTitle] = useState("Cash Memo");
  const [prefix, setPrefix] = useState("BH");
  const [footer, setFooter] = useState("Thank you for shopping with us.");
  const [roundOff, setRoundOff] = useState(true);
  const [showSavedLine, setShowSavedLine] = useState(true);
  const savedAmount = 0;
  const [upiId, setUpiId] = useState("brandhub@okaxis");
  const [storeName, setStoreName] = useState("Brand Hub Mens Wear");
  const [selectedTheme, setSelectedTheme] = useState("brown");
  const tabsContent = (
    <nav className="settings-nav" aria-label="Store settings sections">
      {tabs.map((item) => (
        <button
          className={tab === item ? "active" : ""}
          key={item}
          onClick={() => setTab(item)}
        >
          {item}
        </button>
      ))}
    </nav>
  );

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">SETTINGS</div>
          <h1>Store settings</h1>
          <p>Make StoreDesk work the way your shop does.</p>
        </div>
        <button
          className="button primary"
          onClick={() => toast.success("Settings saved")}
        >
          <Check />
          Save changes
        </button>
      </div>
      <div className="settings-layout">
        {tabsContent}
        <div className="settings-content">
          {tab === "Store profile" && (
            <section className="panel settings-panel">
              <h2>Store profile</h2>
              <p className="muted">
                The details customers see on their bills and receipts.
              </p>
              <div className="settings-fields">
                <label className="form-label">
                  Store name
                  <input
                    value={storeName}
                    onChange={(event) => setStoreName(event.target.value)}
                  />
                </label>
                <label className="form-label">
                  Phone number
                  <input defaultValue="9822345678" inputMode="tel" />
                </label>
                <label className="form-label full-field">
                  Address
                  <input defaultValue="Main Road, Kopargaon, Maharashtra" />
                </label>
              </div>
              <button
                className="upload-box"
                onClick={() => toast("Choose a store logo")}
              >
                <Upload />
                Upload store logo
              </button>
            </section>
          )}
          {tab === "Billing" && (
            <>
              <section className="panel settings-panel">
                <h2>Bill and receipt</h2>
                <p className="muted">
                  Set the text and totals shown on every customer receipt.
                </p>
                <div className="settings-fields">
                  <label className="form-label">
                    Bill title
                    <input
                      value={billTitle}
                      onChange={(event) => setBillTitle(event.target.value)}
                    />
                  </label>
                  <label className="form-label">
                    Bill number prefix
                    <input
                      value={prefix}
                      onChange={(event) => setPrefix(event.target.value)}
                    />
                    <small>Next bill: {prefix || "BH"}/26-27/0143</small>
                  </label>
                  <label className="form-label full-field">
                    Footer note
                    <input
                      value={footer}
                      onChange={(event) => setFooter(event.target.value)}
                    />
                  </label>
                  <label className="switch-setting full-field">
                    <span>
                      Round totals to nearest rupee
                      <small>
                        Show a clear round-off line on customer bills.
                      </small>
                    </span>
                    <Switch
                      checked={roundOff}
                      onCheckedChange={setRoundOff}
                      aria-label="Round totals to nearest rupee"
                    />
                  </label>
                  <label className="switch-setting full-field">
                    <span>
                      Show &apos;You saved&apos; line on bills
                      <small>Only appears when a bill includes a saving.</small>
                    </span>
                    <Switch
                      checked={showSavedLine}
                      onCheckedChange={setShowSavedLine}
                      aria-label="Show You saved line on bills"
                    />
                  </label>
                </div>
              </section>
              <section className="panel receipt-settings">
                <div className="panel-head">
                  <div>
                    <h2>Live receipt preview</h2>
                    <p className="muted">
                      Preview updates as you edit billing details.
                    </p>
                  </div>
                  <Select
                    value={paper}
                    onValueChange={(value) => value && setPaper(value)}
                  >
                    <SelectTrigger aria-label="Receipt paper size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="58 mm">58 mm thermal</SelectItem>
                      <SelectItem value="80 mm">80 mm thermal</SelectItem>
                      <SelectItem value="A5">A5 paper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div
                  className={`receipt-preview receipt-${paper === "A5" ? "a5" : "thermal"}`}
                >
                  <b>{storeName.toUpperCase()}</b>
                  <small>Kopargaon · {billTitle}</small>
                  <small>
                    {prefix || "BH"}/26-27/0143 · 26 Nov 2026, 4:12 pm
                  </small>
                  <hr />
                  <div>
                    <span>Premium Plain Shirt × 1</span>
                    <span>₹499</span>
                  </div>
                  <div>
                    <span>Formal Stretch Trousers × 1</span>
                    <span>₹899</span>
                  </div>
                  {showSavedLine && savedAmount > 0 && (
                    <p className="saved-line">
                      <Check /> You saved ₹{savedAmount} on this bill
                    </p>
                  )}
                  <hr />
                  <div>
                    <b>TOTAL</b>
                    <b>₹1,398</b>
                  </div>
                  <small>{footer}</small>
                </div>
              </section>
            </>
          )}
          {tab === "Printing" && (
            <section className="panel settings-panel">
              <h2>Printing</h2>
              <p className="muted">
                Choose the receipt width used by your thermal printer.
              </p>
              <label className="form-label">
                Paper size
                <Select
                  value={paper}
                  onValueChange={(value) => value && setPaper(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="58 mm">58 mm</SelectItem>
                    <SelectItem value="80 mm">80 mm</SelectItem>
                    <SelectItem value="A5">A5</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <div className="settings-fields">
                <label className="form-label">
                  Printer name
                  <input defaultValue="Default thermal printer" />
                </label>
                <label className="form-label">
                  Connection
                  <input defaultValue="Bluetooth" />
                </label>
              </div>
              <button
                className="button secondary"
                onClick={() => toast.success("Test receipt sent to printer")}
              >
                <Printer />
                Print test receipt
              </button>
            </section>
          )}
          {tab === "Payments" && (
            <section className="panel settings-panel">
              <h2>Payments</h2>
              <p className="muted">Display your UPI details during checkout.</p>
              <label className="form-label">
                UPI ID
                <input
                  value={upiId}
                  onChange={(event) => setUpiId(event.target.value)}
                />
              </label>
              <div className="upi-box">
                <div className="fake-qr">
                  {Array.from({ length: 36 }, (_, index) => (
                    <i key={index} />
                  ))}
                </div>
                <b>Scan to pay</b>
                <small>{upiId || "your-upi@bank"}</small>
              </div>
            </section>
          )}
          {tab === "Taxes" && (
            <section className="panel settings-panel">
              <h2>Taxes</h2>
              <p className="muted">Configure GST for invoices and reports.</p>
              <label className="switch-setting">
                <span>
                  GST registered
                  <small>Enable GST details on bills and tax reports.</small>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  checked={gst}
                  onChange={(event) => setGst(event.target.checked)}
                />
              </label>
              {gst && (
                <div className="settings-fields">
                  <label className="form-label">
                    GSTIN
                    <input
                      placeholder="Enter your 15-character GSTIN"
                      maxLength={15}
                    />
                  </label>
                  <label className="form-label">
                    Default tax rate
                    <Select defaultValue="5%">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["0%", "5%", "12%", "18%", "28%"].map((rate) => (
                          <SelectItem key={rate} value={rate}>
                            {rate}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                </div>
              )}
            </section>
          )}
          {tab === "Appearance" && (
            <section className="panel settings-panel">
              <h2>Appearance</h2>
              <p className="muted">
                Choose one of the palettes allowed for your company.
              </p>
              <div className="theme-picker-grid">
                {themes.map((theme) => (
                  <button
                    key={theme}
                    className="theme-choice"
                    aria-pressed={selectedTheme === theme}
                    onClick={() => {
                      document.documentElement.dataset.theme = theme;
                      setSelectedTheme(theme);
                      toast.success(`${theme} theme applied`);
                    }}
                  >
                    <span className="theme-swatch" data-swatch={theme} />
                    {theme}
                  </button>
                ))}
              </div>
              <button
                className="upload-box"
                onClick={() => toast("Choose a store logo")}
              >
                <Upload />
                Change store logo
              </button>
            </section>
          )}
          {tab === "Subscription" && (
            <section className="panel settings-panel">
              <h2>Subscription</h2>
              <p className="muted">Your plan and current usage.</p>
              <div className="subscription-box">
                <span className="plan-pill pro">Pro</span>
                <h3>Pro plan</h3>
                <p>Renews 12 January 2027 · ₹599 per month</p>
                {[
                  ["Products", 124, "Unlimited"],
                  ["Staff accounts", 4, "10"],
                  ["Stores", 1, "3"],
                ].map(([label, count, limit]) => (
                  <div className="usage-row" key={String(label)}>
                    <div>
                      <span>{label}</span>
                      <b>
                        {count} / {limit}
                      </b>
                    </div>
                    <div className="progress-track">
                      <i
                        style={{
                          width:
                            label === "Products"
                              ? "24%"
                              : `${(Number(count) / Number(limit)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                <button
                  className="button secondary"
                  onClick={() => toast("Your support team will be in touch")}
                >
                  Contact us to upgrade
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
