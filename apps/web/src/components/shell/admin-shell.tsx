"use client";

import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { roleAtLeast, type Role } from "@nisfi/shared";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import {
  BellIcon,
  CompassIcon,
  FlagIcon,
  GaugeIcon,
  InboxIcon,
  LockIcon,
  MenuIcon,
  SearchIcon,
  SettingsIcon,
  ShieldCheckIcon,
  SparkIcon,
  UsersIcon,
} from "@/components/ui/icon";
import type { AdminQueueCounts } from "@/core/ports/admin";
import { useAdmin } from "@/lib/use-admin";

type AdminNav = {
  href: string;
  key:
    | "dashboard"
    | "verifications"
    | "photos"
    | "users"
    | "reports"
    | "questions"
    | "config"
    | "broadcasts"
    | "plans"
    | "audit"
    | "exports"
    | "health";
  Icon: ComponentType<{ size?: number }>;
  countKey?: keyof AdminQueueCounts;
  minRole: Role;
};

const NAV: AdminNav[] = [
  { href: "/admin/dashboard", key: "dashboard", Icon: GaugeIcon, minRole: "moderator" },
  {
    href: "/admin/verifications",
    key: "verifications",
    Icon: ShieldCheckIcon,
    countKey: "pendingVerifications",
    minRole: "moderator",
  },
  {
    href: "/admin/photos",
    key: "photos",
    Icon: LockIcon,
    countKey: "pendingPhotos",
    minRole: "moderator",
  },
  { href: "/admin/users", key: "users", Icon: UsersIcon, minRole: "admin" },
  {
    href: "/admin/reports",
    key: "reports",
    Icon: FlagIcon,
    countKey: "openReports",
    minRole: "moderator",
  },
  { href: "/admin/questions", key: "questions", Icon: SparkIcon, minRole: "admin" },
  { href: "/admin/broadcasts", key: "broadcasts", Icon: BellIcon, minRole: "admin" },
  { href: "/admin/plans", key: "plans", Icon: InboxIcon, minRole: "admin" },
  { href: "/admin/config", key: "config", Icon: SettingsIcon, minRole: "admin" },
  { href: "/admin/exports", key: "exports", Icon: CompassIcon, minRole: "admin" },
  { href: "/admin/health", key: "health", Icon: GaugeIcon, minRole: "moderator" },
  { href: "/admin/audit", key: "audit", Icon: SearchIcon, minRole: "superAdmin" },
];

export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  const t = useTranslations("Admin.nav");
  const rt = useTranslations("Admin.roles");
  const pathname = usePathname();
  const { role, counts } = useAdmin();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const nav = NAV.filter((item) => roleAtLeast(role, item.minRole));

  const [menuOpen, setMenuOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Close the drawer whenever the route changes (a nav item was chosen).
  useEffect(() => setMenuOpen(false), [pathname]);

  // While open: move focus into the drawer and close on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const brand = (
    <div className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-lg bg-accent/90 text-sm font-bold text-primary-700">
        ن
      </span>
      <div className="text-sm font-bold leading-tight">
        نِصفي
        <span className="block text-[0.7rem] font-normal text-white/70">{t("console")}</span>
      </div>
    </div>
  );

  const navList = (
    <nav className="flex flex-col gap-1 px-3 pb-3" aria-label={t("queues")}>
      {nav.map(({ href, key, Icon, countKey }) => {
        const count = countKey ? counts[countKey] : 0;
        return (
          <Link
            key={key}
            href={href}
            aria-current={isActive(href) ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              isActive(href)
                ? "bg-white/15 text-white"
                : "text-white/75 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon size={19} />
            {t(key)}
            {count > 0 ? (
              <span className="ms-auto rounded-full bg-accent px-2 py-0.5 text-[0.7rem] font-semibold text-primary-700 tabular-nums">
                {count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-canvas md:flex md:flex-row">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        {t("skip")}
      </a>

      {/* Desktop sidebar */}
      <aside className="hidden shrink-0 flex-col bg-primary-700 text-white md:flex md:min-h-dvh md:w-60 md:border-e md:border-primary-700">
        <div className="px-5 py-4">{brand}</div>
        {navList}
      </aside>

      {/* Mobile drawer */}
      {menuOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label={t("close")}
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-ink/40"
          />
          <aside
            id="admin-nav"
            className="absolute inset-y-0 start-0 flex w-72 max-w-[85%] flex-col overflow-y-auto bg-primary-700 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-4">
              {brand}
              <button
                ref={closeRef}
                type="button"
                aria-label={t("close")}
                onClick={() => setMenuOpen(false)}
                className="grid size-8 place-items-center rounded-md text-lg text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                ✕
              </button>
            </div>
            {navList}
          </aside>
        </div>
      ) : null}

      {/* Workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-border bg-surface px-4 md:px-6">
          <button
            type="button"
            aria-label={t("menu")}
            aria-expanded={menuOpen}
            aria-controls="admin-nav"
            onClick={() => setMenuOpen(true)}
            className="grid size-9 place-items-center rounded-md border border-border text-ink hover:border-primary hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:hidden"
          >
            <MenuIcon size={20} />
          </button>
          <h1 className="truncate text-base font-bold text-ink">{title}</h1>
          <span className="ms-auto shrink-0 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
            {rt(role)}
          </span>
        </header>
        <main
          id="admin-main"
          tabIndex={-1}
          className="min-w-0 flex-1 p-4 focus:outline-none md:p-6"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
