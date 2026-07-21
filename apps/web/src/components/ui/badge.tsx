import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full text-xs font-semibold border px-2.5 py-1",
  {
    variants: {
      tone: {
        neutral: "text-ink-600 bg-canvas border-border",
        brand: "text-primary-700 bg-primary-50 border-primary/25",
        pending: "text-warning bg-warning/10 border-warning/25",
        info: "text-info bg-info/10 border-info/25",
        success: "text-success bg-success/10 border-success/25",
        danger: "text-danger bg-danger/10 border-danger/25",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants> & { dot?: boolean };

export function Badge({ className, tone, dot = false, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot ? <span className="size-1.5 rounded-full bg-current" aria-hidden /> : null}
      {children}
    </span>
  );
}
