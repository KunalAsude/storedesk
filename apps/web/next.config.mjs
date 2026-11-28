/** @type {import('next').NextConfig} */
// The browser only talks to this site: /api/* is proxied to the API, so the refresh
// cookie is first-party and CSP connect-src 'self' holds (docs/DEPLOY.md).
// API_URL is set per Vercel environment; locally it defaults to the dev API.
const apiUrl = (process.env.API_URL ?? (process.env.NODE_ENV === "development" ? "http://localhost:4000" : "")).replace(/\/$/, "");
// Rewrites are fixed at build time: a Vercel build without API_URL would 404 every /api call.
if (process.env.VERCEL && !apiUrl) throw new Error("API_URL is not set for this Vercel environment (docs/DEPLOY.md step 3)");

const nextConfig = {
  transpilePackages: ["@storedesk/shared"],
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return apiUrl ? [{ source: "/api/:path*", destination: `${apiUrl}/:path*` }] : [];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value:
              "default-src 'self'; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
