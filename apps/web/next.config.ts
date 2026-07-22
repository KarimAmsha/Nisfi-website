import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isProd = process.env.NODE_ENV === "production";

/**
 * Content-Security-Policy (master spec «Security» / Unit 7.4). Self-first, with
 * the minimum third-party origins the stack needs: Firebase Auth/Firestore/
 * Functions/App Check (Google endpoints + reCAPTCHA) and Cloudinary image
 * delivery (O-002). `object-src 'none'` and `frame-ancestors 'none'` block
 * plugin/embedding attacks. In development we also allow `'unsafe-eval'` and
 * websockets so Turbopack HMR works; production stays tight.
 *
 * NOTE: script-src keeps `'unsafe-inline'` because Next.js injects an inline
 * bootstrap; tightening this to per-request nonces (which forces dynamic
 * rendering) is a documented production follow-up in docs/SECURITY.md.
 */
function contentSecurityPolicy(): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "object-src": ["'none'"],
    "img-src": ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
    "font-src": ["'self'", "data:"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "worker-src": ["'self'", "blob:"],
    "script-src": ["'self'", "'unsafe-inline'", ...(isProd ? [] : ["'unsafe-eval'"])],
    "connect-src": [
      "'self'",
      "https://*.googleapis.com",
      "https://*.firebaseio.com",
      "wss://*.firebaseio.com",
      "https://firebaseinstallations.googleapis.com",
      "https://identitytoolkit.googleapis.com",
      "https://securetoken.googleapis.com",
      "https://content-firebaseappcheck.googleapis.com",
      "https://res.cloudinary.com",
      "https://api.cloudinary.com",
      "https://www.google.com",
      "https://www.gstatic.com",
      ...(isProd ? [] : ["ws://localhost:*", "http://localhost:*"]),
    ],
    "frame-src": ["'self'", "https://*.firebaseapp.com", "https://www.google.com"],
  };
  const body = Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");
  return isProd ? `${body}; upgrade-insecure-requests` : body;
}

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy() },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
