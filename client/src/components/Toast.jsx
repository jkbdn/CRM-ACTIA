import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export default function Toast({ toast, onClose }) {
  if (!toast) return null;
  const Icon = toast.type === "error" ? XCircle : CheckCircle2;

  return (
    <div className={`toast ${toast.type}`} role="status">
      <Icon size={18} />
      <span>{toast.message}</span>
      <button type="button" onClick={onClose} aria-label="Cerrar mensaje">
        ×
      </button>
    </div>
  );
}
