import type { ReactNode } from "react";

export type BadgeVariant = "sale" | "primary" | "success" | "accent" | "neutral";
export type BadgeSize = "sm" | "md";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  /** Pulse animation (dùng cho badge số lượng giỏ hàng) */
  pulse?: boolean;
};

const variantClasses: Record<BadgeVariant, string> = {
  sale: "bg-sale text-white",
  primary: "bg-primary text-white",
  success: "bg-emerald-500 text-white",
  accent: "bg-accent text-white",
  neutral: "bg-surface-warm text-espresso border border-border-warm",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "text-[10px] font-bold px-1.5 min-w-4 h-4",
  md: "text-[11px] font-extrabold px-2.5 py-1",
};

export function Badge({
  children,
  variant = "primary",
  size = "md",
  pulse = false,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center justify-center rounded-full",
        variantClasses[variant],
        sizeClasses[size],
        pulse && "animate-pulse",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
