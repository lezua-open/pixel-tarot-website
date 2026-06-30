import { useState } from "react";
import type { ReactNode } from "react";

export function PixelBtn({ children, onClick, variant = "primary", full = false, disabled = false }: {
  children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost"; full?: boolean; disabled?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  const active = !disabled && pressed;
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onPointerDown={() => !disabled && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        background: variant === "primary" ? (disabled ? "#2a2244" : "#7c3aed") : "transparent",
        color: variant === "primary" ? (disabled ? "#554477" : "#fbbf24") : "#7766bb",
        border: `3px solid ${variant === "primary" ? (disabled ? "#3d2a6a" : "#fbbf24") : "#3d3570"}`,
        boxShadow: active ? "none" : "4px 4px 0 #000",
        transform: active ? "translate(4px,4px)" : undefined,
        padding: "11px 20px",
        fontSize: "9px",
        fontFamily: "inherit",
        cursor: disabled ? "not-allowed" : "pointer",
        width: full ? "100%" : undefined,
        transition: "box-shadow 0.05s, transform 0.05s",
        letterSpacing: "0.05em",
      }}
    >{children}</button>
  );
}
