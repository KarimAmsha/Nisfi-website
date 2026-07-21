import type { SVGProps } from "react";

/**
 * One coherent outline icon family (master spec Section 14.3), stroked with
 * `currentColor`. Icons inherit size from `width`/`height` (default 20) and
 * color from the surrounding text color.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export function CompassIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" />
    </svg>
  );
}

export function InboxIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 13l2.5-7h11L20 13v5H4v-5z" />
      <path d="M4 13h4l1.5 2.5h5L16 13h4" />
    </svg>
  );
}

export function ChatIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M20 12a7 7 0 01-9.5 6.5L4 20l1.5-4.5A7 7 0 1120 12z" />
    </svg>
  );
}

export function ShieldCheckIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3l7 2.5V11c0 5-3.4 8-7 9.5C8.4 19 5 16 5 11V5.5L12 3z" />
      <path d="M9 11.5l2 2 4-4" />
    </svg>
  );
}

export function BellIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M6 10a6 6 0 0112 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6z" />
      <path d="M10 20a2 2 0 004 0" />
    </svg>
  );
}

export function SettingsIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2m0 14v2M5 5l1.5 1.5M17.5 17.5L19 19M3 12h2m14 0h2M5 19l1.5-1.5M17.5 6.5L19 5" />
    </svg>
  );
}

export function SearchIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="11" cy="11" r="7" />
      <path d="M16 16l4 4" />
    </svg>
  );
}

export function MenuIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function UsersIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 19a6 6 0 0112 0" />
      <path d="M16 6a3 3 0 010 6m5 7a5 5 0 00-4-5" />
    </svg>
  );
}

export function FlagIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M6 21V4m0 1h11l-2 3 2 3H6" />
    </svg>
  );
}

export function GaugeIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 16a8 8 0 1116 0" />
      <path d="M12 16l4-4" />
    </svg>
  );
}

export function SparkIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
      <path d="M18 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" />
    </svg>
  );
}

export function LockIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 018 0v3" />
    </svg>
  );
}
