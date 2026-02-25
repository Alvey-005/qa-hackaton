"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
    message: string;
    type?: ToastType;
    duration?: number;
    onClose?: () => void;
}

export default function Toast({ message, type = "info", duration = 3000, onClose }: ToastProps) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        // INTENTIONAL (Chaos): toast fires and disappears fast — may vanish before state update completes
        const t = setTimeout(() => {
            setVisible(false);
            onClose?.();
        }, duration);
        return () => clearTimeout(t);
    }, [duration, onClose]);

    if (!visible) return null;

    const icons = {
        success: <CheckCircle size={18} color="var(--success)" />,
        error: <XCircle size={18} color="var(--danger)" />,
        info: <Info size={18} color="var(--accent)" />,
    };

    return (
        <div className={`toast toast-${type}`}>
            {icons[type]}
            <span style={{ flex: 1 }}>{message}</span>
            <button
                onClick={() => { setVisible(false); onClose?.(); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
            >
                <X size={14} />
            </button>
        </div>
    );
}
