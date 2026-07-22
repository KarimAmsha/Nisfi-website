"use client";

import type { ComponentType, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import {
  BellIcon,
  ChatIcon,
  CompassIcon,
  InboxIcon,
  SettingsIcon,
  ShieldCheckIcon,
} from "@/components/ui/icon";
import { ProfileCompletionBanner } from "@/components/profile/completion-banner";
import { useNotifications } from "@/lib/use-notifications";

type NavItem = {
  href: string;
  key: "discover" | "requests" | "matches" | "verification" | "notifications" | "settings";
  Icon: ComponentType<{ size?: number }>;
  primary?: boolean;
};

const NAV: NavItem[] = [
  { href: "/app/discover", key: "discover", Icon: CompassIcon, primary: true },
  { href: "/app/requests", key: "requests", Icon: InboxIcon, primary: true },
  { href: "/app/matches", key: "matches", Icon: ChatIcon, primary: true },
  { href: "/app/verification", key: "verification", Icon: ShieldCheckIcon, primary: true },
  { href: "/app/notifications", key: "notifications", Icon: BellIcon },
  { href: "/app/settings", key: "settings", Icon: SettingsIcon },
];

function BrandMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 34 34" fill="none" aria-hidden>
      <rect x="1" y="1" width="32" height="32" rx="9" fill="#0A4D3C" />
      <path
        d="M11 23V11l12 12V11"
        stroke="#C49A55"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MemberShell({ title, children }: { title?: string; children: ReactNode }) {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const { unread } = useNotifications();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="min-h-dvh bg-canvas">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link href="/app/discover" className="flex items-center gap-2.5 font-bold text-ink">
            <BrandMark />
            <span className="text-lg">نِصفي</span>
          </Link>
          {title ? (
            <>
              <span className="text-border" aria-hidden>
                /
              </span>
              <h1 className="text-sm font-semibold text-ink-600">{title}</h1>
            </>
          ) : null}
          <Link
            href="/app/notifications"
            aria-label={t("notifications")}
            className="relative ms-auto grid size-10 place-items-center rounded-full text-ink-600 hover:bg-primary-50 hover:text-primary-700"
          >
            <BellIcon />
            {unread > 0 ? (
              <span className="absolute end-1.5 top-1.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[0.62rem] font-bold text-white tabular-nums">
                {unread > 9 ? "9+" : unread}
              </span>
            ) : null}
          </Link>
        </div>
      </header>

      <ProfileCompletionBanner />

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="sticky top-24 flex flex-col gap-1" aria-label={t("primary")}>
            {NAV.map(({ href, key, Icon }) => (
              <Link
                key={key}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(href)
                    ? "bg-primary-50 text-primary-700"
                    : "text-ink-600 hover:bg-primary-50/60 hover:text-ink",
                )}
              >
                <Icon size={19} />
                {t(key)}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 pb-24 md:pb-0">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t border-border bg-surface/95 backdrop-blur md:hidden"
        aria-label={t("primary")}
      >
        {NAV.filter((n) => n.primary).map(({ href, key, Icon }) => (
          <Link
            key={key}
            href={href}
            aria-current={isActive(href) ? "page" : undefined}
            className={cn(
              "flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 py-2 text-[0.7rem] font-medium",
              isActive(href) ? "text-primary-700" : "text-ink-600",
            )}
          >
            <Icon size={22} />
            {t(key)}
          </Link>
        ))}
      </nav>
    </div>
  );
}
