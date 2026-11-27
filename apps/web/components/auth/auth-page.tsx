"use client";
import {
    ArrowRight,
    Check
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AuthPage({ kind }: { kind: string }) {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const isLogin = kind === "login";
  return (
    <main className="auth-layout">
      <section className="auth-form-side">
        <div className="auth-brand">
          <span className="brand-mark">S</span>
          <span>StoreDesk</span>
        </div>
        <div className="auth-form">
          <div className="eyebrow">
            {isLogin ? "WELCOME BACK" : "ACCOUNT ACCESS"}
          </div>
          <h1>
            {isLogin
              ? "Good to see you again."
              : kind === "forgot-password"
                ? "Reset your password."
                : kind === "accept-invite"
                  ? "Your shop is waiting."
                  : "Choose your store."}
          </h1>
          <p>
            {isLogin
              ? "Sign in to keep your shop running smoothly."
              : "A few details and you’ll be ready to go."}
          </p>
          {sent ? (
            <div className="success-note">
              <Check />
              Check your inbox for the next step.
            </div>
          ) : (
            <>
              <label className="form-label">
                {kind === "accept-invite" ? "Your name" : "Email or phone"}
                <input
                  required
                  placeholder={
                    kind === "accept-invite"
                      ? "Your full name"
                      : "name@example.com or mobile number"
                  }
                />
              </label>
              {kind !== "forgot-password" && (
                <label className="form-label">
                  Password
                  <input
                    type="password"
                    required
                    placeholder="At least 8 characters"
                  />
                </label>
              )}
              {kind === "accept-invite" && (
                <div className="invite-summary">
                  Invited by <b>Kunal</b> to join <b>Brand Hub Mens Wear</b> as{" "}
                  <b>Cashier</b>
                </div>
              )}
              {isLogin && (
                <label className="remember-check">
                  <input type="checkbox" /> Remember me{" "}
                  <button onClick={() => router.push("/forgot-password")}>
                    Forgot password?
                  </button>
                </label>
              )}
              <button
                className="button primary full auth-submit"
                onClick={() =>
                  isLogin ? router.push("/store/dashboard") : setSent(true)
                }
              >
                {isLogin
                  ? "Log in"
                  : kind === "forgot-password"
                    ? "Send reset link"
                    : "Accept invitation"}
                <ArrowRight />
              </button>
            </>
          )}
          <div className="auth-foot">
            Secure access for your store team ·{" "}
            <button onClick={() => router.push("/403")}>Need help?</button>
          </div>
        </div>
      </section>
      <aside className="auth-showcase">
        <div className="showcase-copy">
          <span className="brand-mark">S</span>
          <h2>StoreDesk</h2>
          <p>Billing and stock for your shop.</p>
        </div>
        <div className="showcase-preview">
          <div className="preview-sidebar">
            <b>StoreDesk</b>
            <span>OVERVIEW</span>
            <i>Dashboard</i>
            <span>SELL</span>
            <i>Billing (POS)</i>
            <i>Sales history</i>
            <span>INVENTORY</span>
            <i>Products</i>
            <i>Stock</i>
          </div>
          <div className="preview-dashboard">
            <b>Good evening, Rahul</b>
            <small>Here’s what’s happening today.</small>
            <div className="preview-kpis">
              <i>
                <small>Today’s sales</small>
                <b>₹28,450</b>
              </i>
              <i>
                <small>Bills today</small>
                <b>18</b>
              </i>
            </div>
            <div className="preview-chart">
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
            </div>
            <div className="preview-row" />
            <div className="preview-row short" />
          </div>
        </div>
      </aside>
    </main>
  );
}
