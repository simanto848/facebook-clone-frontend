"use client";

import React, { createContext, useContext, useState, type ReactNode } from "react";
import { Toaster, type ToastProps } from "@/components/ui/toaster";

interface ToastContextType {
  toast: (props: Omit<ToastProps, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function GlobalToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toast = (props: Omit<ToastProps, "id">) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast: ToastProps = { ...props, id, onClose: () => removeToast(id) };
    setToasts((prev) => [...prev, newToast]);
  };

  const success = (title: string, description?: string) => {
    toast({ title, description, variant: "success" });
  };

  const error = (title: string, description?: string) => {
    toast({ title, description, variant: "danger" });
  };

  return (
    <ToastContext.Provider value={{ toast, success, error }}>
      {children}
      <Toaster toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within GlobalToastProvider");
  }
  return context;
}
