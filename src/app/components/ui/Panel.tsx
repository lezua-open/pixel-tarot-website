import type { ReactNode } from "react";

export function Panel({ children, label, color = "#3d3570" }: { children: ReactNode; label?: string; color?: string }) {
  return (
    <div
      className="w-full border-[3px] border-solid border-[var(--panel-color)] bg-[#0a0a1a] shadow-[4px_4px_0_#000]"
      style={{ "--panel-color": color } as React.CSSProperties}
    >
      {label && (
        <div className="border-b-[2px] border-b-[var(--panel-color)] border-b-solid bg-[#12122a] px-3 py-1.5">
          <span className="text-[8px] text-[#c084fc]">▶ {label}</span>
        </div>
      )}
      {children}
    </div>
  );
}
