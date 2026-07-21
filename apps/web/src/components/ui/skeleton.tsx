import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Loading placeholder that resembles the final layout (master spec Section 14.5). */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-ink/10 motion-reduce:animate-none", className)}
      aria-hidden
      {...props}
    />
  );
}
