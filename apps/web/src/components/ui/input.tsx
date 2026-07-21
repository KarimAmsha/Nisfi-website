import type { InputHTMLAttributes, ReactNode } from "react";
import { useId } from "react";
import { cn } from "@/lib/cn";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: ReactNode;
  error?: string | undefined;
  optional?: boolean;
  optionalLabel?: string;
};

export function Field({
  label,
  hint,
  error,
  optional = false,
  optionalLabel,
  className,
  id,
  ...props
}: FieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-ink">
        {label}
        {optional && optionalLabel ? (
          <span className="ms-2 text-xs font-normal text-ink-600">{optionalLabel}</span>
        ) : null}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "h-11 rounded-md border border-border bg-surface px-3.5 text-ink placeholder:text-ink-600/70",
          "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40",
          error && "border-danger focus-visible:border-danger focus-visible:ring-danger/30",
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-ink-600">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
