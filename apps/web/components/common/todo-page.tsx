"use client";
import {
    ShoppingBag
} from "lucide-react";
import { toast } from "sonner";

export function TodoPage({ title }: { title: string }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">COMING SOON</div>
          <h1>{title}</h1>
          <p>A little more room to grow your business.</p>
        </div>
        <span className="planned-badge">Planned</span>
      </div>
      <div className="coming-soon">
        <span className="coming-icon">
          <ShoppingBag />
        </span>
        <h2>{title}, thoughtfully on the way</h2>
        <p>
          We’re working on a simple way to bring {title.toLowerCase()} into your
          daily shop routine. This space will be ready soon.
        </p>
        <button
          className="button secondary"
          onClick={() => toast.success("We’ll let you know when this is ready")}
        >
          Notify me when ready
        </button>
      </div>
    </>
  );
}
