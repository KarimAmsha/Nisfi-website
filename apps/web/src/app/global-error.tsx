"use client";

import { useEffect } from "react";
import { routing } from "@/i18n/routing";

/**
 * Root error boundary. It replaces the whole document when a top-level error
 * escapes the locale layout, so it renders its own <html>/<body> and stays
 * bilingual and dependency-free.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
          <p style={{ fontWeight: 700, fontSize: "1.25rem" }}>حدث خطأ ما · Something went wrong</p>
          <p style={{ marginTop: "0.5rem", color: "#5b5954" }}>حاول مرة أخرى · Please try again.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              height: "2.75rem",
              padding: "0 1.25rem",
              borderRadius: "0.5rem",
              border: "none",
              background: "#1f5f4e",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            إعادة المحاولة · Retry
          </button>
        </main>
      </body>
    </html>
  );
}
