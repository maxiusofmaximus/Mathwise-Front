"use client";

import { useEffect, useState } from "react";
import styles from "./SileoToaster.module.scss";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

const toneClass: Record<ToastType, string> = {
  success: "alert-success",
  error: "alert-danger",
  info: "alert-info",
  warning: "alert-warning",
};

export function SileoToaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const onNotify = (event: Event) => {
      const custom = event as CustomEvent<{ type: ToastType; message: string }>;
      const payload = custom.detail;
      if (!payload?.message) return;

      const id = Date.now() + Math.floor(Math.random() * 1000);
      setItems((prev) => [...prev, { id, ...payload }]);
      setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }, 3500);
    };

    window.addEventListener("sileo:notify", onNotify);
    return () => window.removeEventListener("sileo:notify", onNotify);
  }, []);

  return (
    <div className={`sileo-toaster position-fixed top-0 end-0 p-3 ${styles.container}`}>
      {items.map((item) => (
        <div key={item.id} className={`alert ${toneClass[item.type]} shadow-sm mb-2 ${styles.toast}`} role="alert">
          {item.message}
        </div>
      ))}
    </div>
  );
}
