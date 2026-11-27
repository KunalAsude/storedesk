// Money is always integer paise (49900 = ₹499). Never use floats for money.

/** ₹1,02,500 or ₹53.65 (Indian grouping, no ".00"). */
export function formatINR(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: paise % 100 ? 2 : 0,
  }).format(paise / 100);
}

export function toPaise(rupees: number | string): number {
  const n = typeof rupees === "string" ? Number(rupees) : rupees;
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}
