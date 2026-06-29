import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
  wrapperClassName?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      prefixIcon,
      suffixIcon,
      wrapperClassName = "",
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-bold text-espresso"
          >
            {label}
          </label>
        )}
        <div
          className={[
            "flex items-center gap-2 border rounded-xl px-3.5 h-11 bg-surface transition-all",
            error
              ? "border-sale focus-within:ring-1 focus-within:ring-sale"
              : "border-border-warm focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/30",
          ].join(" ")}
        >
          {prefixIcon && (
            <span className="text-text-sub shrink-0">{prefixIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              "flex-1 border-0 outline-none text-sm text-text-main placeholder-text-sub bg-transparent",
              className,
            ].join(" ")}
            {...props}
          />
          {suffixIcon && (
            <span className="text-text-sub shrink-0">{suffixIcon}</span>
          )}
        </div>
        {error && (
          <p className="text-xs font-semibold text-sale">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-text-sub">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
