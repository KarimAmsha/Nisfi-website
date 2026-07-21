"use client";

import type { ComponentType, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { FlagIcon, GaugeIcon, ShieldCheckIcon, UsersIcon } from "@/components/ui/icon";

type AdminNav = {
  href: string;
  key: "dashboard" | "verifications" | "users" | "reports";
  Icon: ComponentType<{ size?: number }>;
  count?: number;
};

const NAV: AdminNav[] = [
  { href: "/admin/dashboard", key: "dashboard", Icon: GaugeIcon },
  { href: "/admin/verifications", key: "verifications", Icon: ShieldCheckIcon, count: 12 },
  { href: "/admin/users", key: "users", Icon: UsersIcon },
  { href: "/admin/reports", key: "reports", Icon: FlagIcon, count: 3 },
];

export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  const t = useTranslations("Admin.nav");
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

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
          {NAV.map(({ href, key, Icon, count }) => (
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
              {count ? (
                <span className="ms-auto rounded-full bg-accent px-2 py-0.5 text-[0.7rem] font-semibold text-primary-700 tabular-nums">
                  {count}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center border-b border-border bg-surface px-6">
          <h1 className="text-base font-bold text-ink">{title}</h1>
        </header>
        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
