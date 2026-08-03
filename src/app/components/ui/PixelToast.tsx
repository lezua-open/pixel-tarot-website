import { useState, useEffect, useRef } from "react";

interface ToastState {
  message: string;
  type: "success" | "error";
  phase: "enter" | "visible" | "exit" | "hidden";
}

let showToastFn: ((message: string, type?: "success" | "error") => void) | null = null;

export function showToast(message: string, type: "success" | "error" = "success") {
  showToastFn?.(message, type);
}

export function PixelToast() {
  const [toast, setToast] = useState<ToastState>({ message: "", type: "success", phase: "hidden" });
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    showToastFn = (message, type = "success") => {
      clearTimeout(timerRef.current);
      // 进入动画
      setToast({ message, type, phase: "enter" });
      // 停留
      timerRef.current = setTimeout(() => {
        setToast(prev => ({ ...prev, phase: "visible" }));
      }, 200);
      // 退出动画
      timerRef.current = setTimeout(() => {
        setToast(prev => ({ ...prev, phase: "exit" }));
      }, 2500);
      // 完全隐藏
      timerRef.current = setTimeout(() => {
        setToast(prev => ({ ...prev, phase: "hidden" }));
      }, 2800);
    };
    return () => { showToastFn = null; clearTimeout(timerRef.current); };
  }, []);

  if (toast.phase === "hidden") return null;

  const colors = toast.type === "success"
    ? { border: "#fbbf24", bg: "#1a1a0a", shadow: "#fbbf2466", icon: "✦" }
    : { border: "#f43f5e", bg: "#1a0a0a", shadow: "#f43f5e66", icon: "✕" };

  const animClass = toast.phase === "enter"
    ? "animate-toast-in"
    : toast.phase === "exit"
      ? "animate-toast-out"
      : "";

  return (
    <div className="fixed top-6 left-0 right-0 z-[400] flex justify-center pointer-events-none">
      <div className={animClass}>
        <div
          className="flex items-center gap-3 px-5 py-3 pointer-events-auto"
          style={{
            background: colors.bg,
            border: `3px solid ${colors.border}`,
            boxShadow: `4px 4px 0 #000, 0 0 20px ${colors.shadow}`,
            fontFamily: "'VT323', monospace",
          }}
        >
          <span className="text-lg" style={{ color: colors.border }}>{colors.icon}</span>
          <span className="text-sm whitespace-nowrap" style={{ color: "#e8deff" }}>{toast.message}</span>
        </div>
      </div>

      <style>{`
        @keyframes toastIn {
          0% { opacity: 0; transform: translateY(-16px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toastOut {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-16px) scale(0.95); }
        }
        .animate-toast-in {
          animation: toastIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-toast-out {
          animation: toastOut 0.25s ease-in forwards;
        }
      `}</style>
    </div>
  );
}
