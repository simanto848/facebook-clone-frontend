"use client";

import React, { createContext, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextType {
  toast: (options: { type?: ToastType; title: string; description?: string }) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = ({ type = "info", title, description }: { type?: ToastType; title: string; description?: string }) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, type, title, description };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icons = {
    success: <CheckCircle2 size={18} className="text-green-400 shrink-0" />,
    error: <AlertCircle size={18} className="text-red-400 shrink-0" />,
    warning: <AlertTriangle size={18} className="text-yellow-400 shrink-0" />,
    info: <Info size={18} className="text-blue-400 shrink-0" />,
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Floating Toaster Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-2xl border border-[#374151] bg-[#111827]/95 p-4 text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200"
            )}
          >
            {icons[t.type]}
            <div className="flex-1 space-y-0.5">
              <h5 className="text-xs font-bold text-white">{t.title}</h5>
              {t.description && <p className="text-[11px] text-slate-400 leading-normal">{t.description}</p>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
