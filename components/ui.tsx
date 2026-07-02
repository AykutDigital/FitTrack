"use client";

import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-5 ${className}`}
      style={{ boxShadow: "var(--shadow)" }}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  unit,
  accent = "var(--accent)",
  hint,
}: {
  label: string;
  value: string | number;
  unit?: string;
  accent?: string;
  hint?: string;
}) {
  return (
    <Card className="animate-in">
      <p className="text-sm font-medium text-text-muted">{label}</p>
      <p className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-bold tracking-tight" style={{ color: accent }}>
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-text-muted">{unit}</span>}
      </p>
      {hint && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
    </Card>
  );
}

type Variant = "primary" | "ghost" | "danger";

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const styles: Record<Variant, string> = {
    primary:
      "bg-accent text-white hover:opacity-90 active:scale-[0.98] disabled:opacity-40",
    ghost:
      "bg-surface-2 text-text hover:bg-border active:scale-[0.98]",
    danger:
      "bg-transparent text-danger hover:bg-danger/10 active:scale-[0.98]",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-text-muted">{label}</span>
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text outline-none transition placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/25 ${props.className ?? ""}`}
    />
  );
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-text-muted">
      {text}
    </div>
  );
}
