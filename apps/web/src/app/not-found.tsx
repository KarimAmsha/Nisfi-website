import { routing } from "@/i18n/routing";

/**
 * Root not-found fallback for paths outside any locale segment. It renders its
 * own minimal document (no locale layout wraps it) and is intentionally
 * bilingual, then points to the default-locale home.
 */
export default function RootNotFound() {
  return (
    <html lang={routing.defaultLocale} dir="rtl">
      <body
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#f7f5f0",
          color: "#1c1b1a",
        }}
      >
        <main style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ fontSize: "3rem", fontWeight: 700, margin: 0, color: "#1f5f4e" }}>404</p>
          <p style={{ marginTop: "0.5rem" }}>الصفحة غير موجودة · Page not found</p>
          <p style={{ marginTop: "1.5rem" }}>
            <a href={`/${routing.defaultLocale}`} style={{ color: "#1f5f4e", fontWeight: 600 }}>
              العودة إلى الرئيسية · Go home
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
