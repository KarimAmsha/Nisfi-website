"use client";

import type { ComponentType, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { roleAtLeast, type Role } from "@nisfi/shared";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import {
  BellIcon,
  FlagIcon,
  GaugeIcon,
  InboxIcon,
  LockIcon,
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
    | "plans";
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
];

export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  const t = useTranslations("Admin.nav");
  const rt = useTranslations("Admin.roles");
  const pathname = usePathname();
  const { role, counts } = useAdmin();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const nav = NAV.filter((item) => roleAtLeast(role, item.minRole));

  return (
    <div className="flex min-h-dvh flex-col bg-canvas md:flex-row">
      {/* Queue-first sidebar */}
      <aside className="shrink-0 border-b border-border bg-primary-700 text-white md:min-h-dvh md:w-60 md:border-b-0 md:border-e md:border-primary-700">
        <div className="flex items-center gap-2.5 px-5 py-4">
          <span className="grid size-8 place-items-center rounded-lg bg-accent/90 text-sm font-bold text-primary-700">
            ن
          </span>
          <div className="text-sm font-bold leading-tight">
            نِصفي
            <span className="block text-[0.7rem] font-normal text-white/70">{t("console")}</span>
          </div>
        </div>
        <nav
          className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible"
          aria-label={t("queues")}
        >
          {nav.map(({ href, key, Icon, countKey }) => {
            const count = countKey ? counts[countKey] : 0;
            return (
              <Link
                key={key}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
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
      </aside>

      {/* Workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-border bg-surface px-6">
          <h1 className="text-base font-bold text-ink">{title}</h1>
          <span className="ms-auto rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
            {rt(role)}
          </span>
        </header>
        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
