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
      className={[
        "px-5 py-[11px] text-[9px] font-inherit tracking-[0.05em] border-[3px] border-solid transition-[box-shadow,transform] duration-[0.05s]",
        variant === "primary"
          ? disabled
            ? "bg-[#2a2244] text-[#554477] border-[#3d2a6a]"
            : "bg-[#7c3aed] text-[#fbbf24] border-[#fbbf24]"
          : "bg-transparent text-[#7766bb] border-[#3d3570]",
        active
          ? "shadow-none translate-x-[4px] translate-y-[4px]"
          : "shadow-[4px_4px_0_#000]",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        full ? "w-full" : "",
      ].join(" ")}
    >{children}</button>
  );
}
