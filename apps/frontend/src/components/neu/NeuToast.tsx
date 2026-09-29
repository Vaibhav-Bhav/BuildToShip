import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from "lucide-react";
import { cn } from "../../lib/cn";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info", title?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((item) => (
          <NeuToastItem key={item.id} item={item} onDismiss={() => removeToast(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const NeuToastItem: React.FC<{ item: ToastItem; onDismiss: () => void }> = ({ item, onDismiss }) => {
  useEffect(() => {
    // Errors stay until closed; others auto-dismiss in 5s
    if (item.type === "error") return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);
    return () => clearTimeout(timer);
  }, [item.type, onDismiss]);

  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-[var(--success)] shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-[var(--warning)] shrink-0" />,
    error: <AlertOctagon className="w-5 h-5 text-[var(--danger)] shrink-0" />,
    info: <Info className="w-5 h-5 text-[var(--info)] shrink-0" />,
  };

  return (
    <div
      role="alert"
      className={cn(
        "pointer-events-auto flex items-start gap-3 p-4 rounded-[16px]",
        "bg-[var(--bg)] shadow-[var(--neu-raised)] border border-[var(--input-border)]/60 text-[var(--text)]",
        "animate-in slide-in-from-top-2 fade-in duration-200"
      )}
    >
      <div className="pt-0.5">{iconMap[item.type]}</div>
      <div className="flex-1 min-w-0">
        {item.title && <h4 className="text-sm font-bold text-[var(--text)]">{item.title}</h4>}
        <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed break-words">{item.message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="p-1 rounded-[8px] text-[var(--text-muted)] hover:text-[var(--text)] active:shadow-[var(--neu-inset-sm)] transition-all cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
