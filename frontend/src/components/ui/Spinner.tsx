import { Loader2 } from "lucide-react";

export type SpinnerSize = "sm" | "md" | "lg";

type SpinnerProps = {
  size?: SpinnerSize;
  className?: string;
  /** Hiển thị spinner căn giữa toàn trang */
  fullPage?: boolean;
  /** Text hiển thị bên dưới spinner */
  label?: string;
};

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "w-4 h-4",
  md: "w-7 h-7",
  lg: "w-10 h-10",
};

export function Spinner({ size = "md", className = "", fullPage = false, label }: SpinnerProps) {
  const spinner = (
    <span className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <Loader2
        className={`${sizeClasses[size]} animate-spin text-primary`}
      />
      {label && (
        <span className="text-sm font-medium text-text-sub animate-pulse">{label}</span>
      )}
    </span>
  );

  if (fullPage) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}
