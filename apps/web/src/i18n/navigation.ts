import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware navigation primitives. Components import `Link`, `redirect`,
 * `usePathname`, and `useRouter` from here (never directly from `next/*`) so
 * the active locale prefix is preserved automatically.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
