import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LockIcon, ShieldCheckIcon } from "@/components/ui/icon";

const SAMPLE = [
  { initial: "أ", age: 29, tone: "bg-linear-to-br from-primary-700 to-primary-600" },
  { initial: "م", age: 33, tone: "bg-linear-to-br from-[#123f34] to-primary-700" },
  { initial: "س", age: 27, tone: "bg-linear-to-br from-primary-600 to-[#177a5f]" },
] as const;

export default function DiscoverPage() {
  const t = useTranslations("Discover");
  const c = useTranslations("Common");

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-ink">{t("title")}</h2>
        <p className="max-w-[52ch] text-sm text-ink-600">{t("subtitle")}</p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="brand">{t("filterCompatibility")}</Badge>
        <Badge>{t("filterAge")}</Badge>
        <Badge>{t("filterCity")}</Badge>
        <Badge tone="success" dot>
          {t("filterVerified")}
        </Badge>
        <span className="ms-auto text-sm text-ink-600 tabular-nums">{t("results")}</span>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SAMPLE.map((m) => (
          <li
            key={m.initial}
            className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-card"
          >
            <div className={`relative flex aspect-[4/3] items-center justify-center ${m.tone}`}>
              <LockIcon size={40} className="text-primary-50/80" />
              <span className="absolute start-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-[rgba(15,30,25,0.62)] px-2.5 py-1 text-xs text-white backdrop-blur-[2px]">
                <span className="size-1.5 rounded-full bg-accent" />
                {c("protectedTitle")}
              </span>
              <span className="absolute bottom-2.5 start-2.5 end-2.5 text-center text-xs text-white/90">
                {c("protectedHint")}
              </span>
            </div>
            <div className="flex flex-col gap-2.5 p-4">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-bold text-ink">
                  {m.initial}. — {m.age}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600">
                  <ShieldCheckIcon size={14} />
                  {c("verified")}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-md bg-primary-50 px-2 py-1 text-xs text-ink-600">
                  {t("signalValues")}
                </span>
                <span className="rounded-md bg-primary-50 px-2 py-1 text-xs text-ink-600">
                  {t("signalCity")}
                </span>
              </div>
              <div className="mt-1 flex gap-2">
                <Button size="sm" block>
                  {c("sendRequest")}
                </Button>
                <Button size="sm" variant="ghost">
                  {c("viewProfile")}
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
