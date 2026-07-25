import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// script-src/style-src keep 'unsafe-inline' rather than a nonce: this app's
// only inline script is the beforeInteractive theme-init in
// src/app/[locale]/layout.tsx, and Tailwind/inline style={{}} usage (e.g.
// Logo.tsx's theme cross-fade) relies on inline styles throughout. A
// nonce-based CSP would need per-request nonce plumbing through proxy.ts
// (which already composes next-intl + Supabase session middleware) — real
// but separate follow-up work, not done here to avoid destabilizing the
// request pipeline in this pass.
// Derived from the env var (not hardcoded) so the CSP never drifts out of
// sync with whichever Supabase project NEXT_PUBLIC_SUPABASE_URL points at.
const SUPABASE_HOST = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
  : "skavgqahgazswhivxltk.supabase.co";
// React dev mode uses eval() for HMR/debugging (never in production builds —
// see https://react.dev) — 'unsafe-eval' is scoped to dev only so the
// production CSP stays strict.
const scriptSrc = `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV !== "production" ? " 'unsafe-eval'" : ""}`;
const CSP = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: https://*.basemaps.cartocdn.com https://${SUPABASE_HOST}`,
  "font-src 'self' data:",
  `connect-src 'self' https://${SUPABASE_HOST} wss://${SUPABASE_HOST}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
