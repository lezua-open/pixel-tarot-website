import { useState } from "react";
import { LightboxProvider } from "./context";
import { GLOBAL_STYLES, TABS, STAR_POSITIONS } from "./constants";
import { DrawSection } from "./sections/DrawSection";
import { WeeklySection } from "./sections/WeeklySection";
import { TrendsSection } from "./sections/TrendsSection";
import { PlazaSection } from "./sections/PlazaSection";

export default function App() {
  const [tab, setTab] = useState(0);

  return (
    <div style={{ fontFamily: "'Press Start 2P', monospace", background: "#0a0a1a", minHeight: "100vh", maxWidth: 430, margin: "0 auto", position: "relative", overflowX: "hidden" }}>
      <style>{GLOBAL_STYLES}</style>

      {/* Pixel starfield */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden", maxWidth: 430, margin: "0 auto" }}>
        {STAR_POSITIONS.map((s, i) => (
          <div key={i} style={{
            position: "absolute",
            width: s.w, height: s.w,
            background: s.col,
            left: `${s.x}%`, top: `${s.y}%`,
            animation: `blink ${s.dur}s steps(1) ${s.delay}s infinite`,
          }} />
        ))}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,0,0,0.06) 4px, rgba(0,0,0,0.06) 5px)", pointerEvents: "none" }} />
      </div>

      {/* Page content */}
      <LightboxProvider>
        <div style={{ position: "relative", zIndex: 1 }}>
          {tab === 0 && <DrawSection />}
          {tab === 1 && <WeeklySection />}
          {tab === 2 && <TrendsSection />}
          {tab === 3 && <PlazaSection />}
        </div>
      </LightboxProvider>

      {/* Bottom nav */}
      <nav style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430,
        background: "#080812",
        borderTop: "3px solid #3d3570",
        boxShadow: "0 -4px 0 #000",
        display: "flex", zIndex: 100,
      }}>
        {TABS.map((t, i) => (
          <button key={t.label} onClick={() => setTab(i)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            padding: "10px 0 16px",
            background: tab === i ? "#12122a" : "transparent",
            border: "none",
            borderTop: `3px solid ${tab === i ? "#9d4edd" : "transparent"}`,
            color: tab === i ? "#fbbf24" : "#3d3570",
            cursor: "pointer", fontFamily: "inherit",
            transition: "color 0.1s, border-color 0.1s",
          }}>
            <t.Icon style={{ width: 20, height: 20 }} />
            <span style={{ fontSize: "10px" }}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
