import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Locale normalization and prefix handling (master spec Section 9: "proxy.ts
 * handles locale normalization and early session-presence routing").
 * Session/auth guards are added in their approved units; this scaffold only
 * establishes locale routing.
 */
export default createMiddleware(routing);

export const config = {
  // Run on all paths except Next internals, API routes, and files with an extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
