import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-br from-accent to-primary-hover text-white shadow-[0_16px_35px_rgba(245,158,11,0.2)] hover:shadow-[0_20px_40px_rgba(245,158,11,0.3)] hover:-translate-y-0.5",
  secondary:
    "bg-espresso text-surface-warm hover:bg-espresso/90 hover:-translate-y-0.5",
  outline:
    "border-2 border-primary text-primary hover:bg-primary hover:text-white hover:-translate-y-0.5",
  ghost:
    "bg-transparent text-espresso hover:bg-surface-warm hover:-translate-y-0.5",
  danger:
    "bg-transparent border-2 border-sale text-sale hover:bg-sale hover:text-white hover:-translate-y-0.5",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-xs font-bold",
  md: "h-11 px-5 text-sm font-extrabold",
  lg: "h-[52px] px-7 text-sm font-extrabold",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      children,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          "inline-flex items-center justify-center gap-2 rounded-full transition-all duration-200 cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(" ")}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          icon && iconPosition === "left" && (
            <span className="shrink-0">{icon}</span>
          )
        )}
        {children}
        {!loading && icon && iconPosition === "right" && (
          <span className="shrink-0">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
