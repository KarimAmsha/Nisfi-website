import type { ReactNode } from "react";
import { PublicHeader } from "./public-header";
import { PublicFooter } from "./public-footer";

/** Shared shell for public sub-pages (about, contact, legal): header + titled
 * content + footer, on a comfortable reading width. */
export function PublicPage({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <PublicHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <h1 className="text-3xl font-bold tracking-tight text-ink text-balance sm:text-4xl">
            {title}
          </h1>
          {lead ? <p className="mt-4 text-lg text-ink-600">{lead}</p> : null}
          <div className="mt-8">{children}</div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

/** A titled prose section used inside PublicPage. */
export function PublicSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed text-ink-600">{children}</div>
    </section>
  );
}
