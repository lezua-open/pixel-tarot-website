import type { ReactNode } from "react";

export function Panel({ children, label, color = "#3d3570" }: { children: ReactNode; label?: string; color?: string }) {
  return (
    <div style={{ border: `3px solid ${color}`, boxShadow: "4px 4px 0 #000", background: "#0a0a1a", width: "100%" }}>
      {label && (
        <div style={{ padding: "6px 12px", background: "#12122a", borderBottom: `2px solid ${color}` }}>
          <span style={{ fontSize: "8px", color: "#c084fc" }}>▶ {label}</span>
        </div>
      )}
      {children}
    </div>
  );
}
