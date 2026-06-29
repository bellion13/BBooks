import { useToastStore } from "../../store/useToastStore";
import type { Toast } from "../../store/useToastStore";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, dismiss } = useToastStore();

  if (toasts.length === 0) return null;

  const renderIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case "error":
        return <XCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-sky-500 shrink-0" />;
    }
  };

  const getToastStyles = (type: string) => {
    switch (type) {
      case "success":
        return "bg-surface border-l-4 border-emerald-500 text-text-main shadow-md";
      case "error":
        return "bg-surface border-l-4 border-rose-500 text-text-main shadow-md";
      case "warning":
        return "bg-surface border-l-4 border-amber-500 text-text-main shadow-md";
      default:
        return "bg-surface border-l-4 border-sky-500 text-text-main shadow-md";
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-[360px] pointer-events-none">
      {toasts.map((toast: Toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl border border-border-warm/40 animate-slide-up ${getToastStyles(
            toast.type
          )}`}
        >
          <div className="flex items-center gap-3">
            {renderIcon(toast.type)}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="text-text-sub hover:text-text-main transition-colors p-1 cursor-pointer"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
