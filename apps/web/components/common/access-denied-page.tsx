"use client";
import { LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";

export function AccessDeniedPage({ kind }: { kind: "403" | "404" }) {
  const router = useRouter();
  return (
    <main className="access-denied">
      <section className="panel">
        <LockKeyhole />
        <div>
          <h1>{kind === "403" ? "You don’t have access" : "Page not found"}</h1>
          <p>
            {kind === "403"
              ? "This page isn’t available for your account."
              : "The page you’re looking for may have moved."}
          </p>
          <button className="button primary" onClick={() => router.push("/store/dashboard")}>
            Return to dashboard
          </button>
        </div>
      </section>
    </main>
  );
}
