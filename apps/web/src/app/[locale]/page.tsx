import type { Metadata } from "next";
import type { Locale } from "@nisfi/shared";
import { hasLocale, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { buttonVariants } from "@/components/ui/button";
import { ShieldCheckIcon, LockIcon, CompassIcon } from "@/components/ui/icon";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const l = locale as Locale;
  const t = await getTranslations({ locale: l, namespace: "Landing" });
  const home = await getTranslations({ locale: l, namespace: "Home" });
  return {
    title: `${t("brand")} — ${t("tagline")}`,
    description: home("hero.subtitle"),
    alternates: {
      canonical: `/${locale}`,
      languages: { ar: "/ar", en: "/en", tr: "/tr" },
    },
    openGraph: {
      title: `${t("brand")} — ${t("tagline")}`,
      description: home("hero.subtitle"),
      locale,
      type: "website",
    },
  };
}

export default async function LandingPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <PublicHeader />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Principles />
        <Faq />
        <FinalCta />
      </main>
      <PublicFooter />
    </div>
  );
}

function Hero() {
  const t = useTranslations("Home.hero");
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
      <div>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600">
          <span className="text-accent">◆</span> {t("eyebrow")}
        </span>
        <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-ink text-balance sm:text-5xl">
          {t("titleA")}
          <span className="text-primary-700">{t("titleEm")}</span>
          {t("titleB")}
        </h1>
        <p className="mt-5 max-w-[46ch] text-lg text-ink-600">{t("subtitle")}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/app" className={buttonVariants({ size: "lg" })}>
            {t("primaryCta")}
          </Link>
          <a href="#how" className={buttonVariants({ variant: "ghost", size: "lg" })}>
            {t("secondaryCta")}
          </a>
        </div>
        <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-600">
          {[t("trust1"), t("trust2"), t("trust3")].map((label) => (
            <li key={label} className="inline-flex items-center gap-2">
              <ShieldCheckIcon size={16} className="text-primary-600" />
              {label}
            </li>
          ))}
        </ul>
      </div>
      <div className="relative hidden aspect-square overflow-hidden rounded-xl bg-linear-to-br from-primary-700 to-primary-600 shadow-card md:block">
        <svg
          viewBox="0 0 400 400"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 size-full opacity-60"
          aria-hidden
        >
          <defs>
            <pattern
              id="mesh"
              width="56"
              height="56"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <path d="M28 0v56M0 28h56" stroke="#C49A55" strokeWidth="0.7" opacity="0.4" />
              <circle
                cx="28"
                cy="28"
                r="12"
                fill="none"
                stroke="#EDF7F3"
                strokeWidth="0.7"
                opacity="0.35"
              />
            </pattern>
          </defs>
          <rect width="400" height="400" fill="url(#mesh)" />
          <circle
            cx="200"
            cy="200"
            r="120"
            fill="none"
            stroke="#C49A55"
            strokeWidth="1.5"
            opacity="0.55"
          />
          <path
            d="M120 250V150l160 100V150"
            stroke="#fff"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
        </svg>
        <div className="absolute bottom-4 start-4 end-4 flex items-center gap-2.5 rounded-lg border border-white/25 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur">
          <LockIcon size={18} />
          {t("trust2")}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const t = useTranslations("Home.how");
  const steps = [
    { n: "1", t: t("step1Title"), d: t("step1Desc") },
    { n: "2", t: t("step2Title"), d: t("step2Desc") },
    { n: "3", t: t("step3Title"), d: t("step3Desc") },
  ];
  return (
    <section id="how" className="scroll-mt-20 border-y border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <SectionHead title={t("title")} subtitle={t("subtitle")} />
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="rounded-lg border border-border bg-canvas p-6">
              <span className="font-mono text-sm font-bold tabular-nums text-accent">{s.n}</span>
              <h3 className="mt-2 text-lg font-bold text-ink">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Principles() {
  const t = useTranslations("Home.principles");
  const items = [
    { Icon: LockIcon, t: t("p1Title"), d: t("p1Desc") },
    { Icon: ShieldCheckIcon, t: t("p2Title"), d: t("p2Desc") },
    { Icon: CompassIcon, t: t("p3Title"), d: t("p3Desc") },
  ];
  return (
    <section id="principles" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <SectionHead title={t("title")} />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map(({ Icon, t: title, d }) => (
            <div key={title} className="rounded-lg border border-border bg-surface p-6 shadow-card">
              <span className="grid size-11 place-items-center rounded-full bg-primary-50 text-primary-700">
                <Icon size={22} />
              </span>
              <h3 className="mt-4 text-lg font-bold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const t = useTranslations("Home.faq");
  const qa = [
    { q: t("q1"), a: t("a1") },
    { q: t("q2"), a: t("a2") },
    { q: t("q3"), a: t("a3") },
  ];
  return (
    <section id="faq" className="scroll-mt-20 border-t border-border bg-surface">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <SectionHead title={t("title")} />
        <dl className="mt-8 divide-y divide-border">
          {qa.map(({ q, a }) => (
            <div key={q} className="py-5">
              <dt className="font-semibold text-ink">{q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-600">{a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function FinalCta() {
  const t = useTranslations("Home.cta");
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-ink text-balance">{t("title")}</h2>
        <p className="mx-auto mt-3 max-w-[42ch] text-ink-600">{t("subtitle")}</p>
        <div className="mt-7">
          <Link href="/app" className={buttonVariants({ size: "lg" })}>
            {t("button")}
          </Link>
        </div>
      </div>
    </section>
  );
}

function SectionHead({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold tracking-tight text-ink text-balance sm:text-3xl">
        {title}
      </h2>
      {subtitle ? <p className="mt-2 text-ink-600">{subtitle}</p> : null}
    </div>
  );
}
