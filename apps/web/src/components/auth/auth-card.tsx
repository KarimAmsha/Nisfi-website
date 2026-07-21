import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BrandMark } from "@/components/ui/brand-mark";

/** Quiet, focused auth container (master spec Section 14.6): brand, title,
 * subtitle, and the form — no marketing clutter. */
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const brand = useTranslations("Landing")("brand");
  return (
    <div className="w-full max-w-md">
      <Link href="/" className="mx-auto flex w-fit items-center gap-2.5 font-bold text-ink">
        <BrandMark />
        <span className="text-lg">{brand}</span>
      </Link>
      <div className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-card sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
        <p className="mt-1 text-sm text-ink-600">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
