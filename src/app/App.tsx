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
    <div className="font-['Press_Start_2P',monospace] bg-[#0a0a1a] min-h-screen max-w-[430px] mx-auto relative overflow-x-hidden">
      <style>{GLOBAL_STYLES}</style>

      {/* Pixel starfield */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden max-w-[430px] mx-auto">
        {STAR_POSITIONS.map((s, i) => (
          <div key={i} className="absolute" style={{
            width: s.w, height: s.w,
            background: s.col,
            left: `${s.x}%`, top: `${s.y}%`,
            animation: `blink ${s.dur}s steps(1) ${s.delay}s infinite`,
          }} />
        ))}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,0,0,0.06) 4px, rgba(0,0,0,0.06) 5px)",
        }} />
      </div>

      {/* Page content */}
      <LightboxProvider>
        <div className="relative z-[1]">
          {tab === 0 && <DrawSection />}
          {tab === 1 && <WeeklySection />}
          {tab === 2 && <TrendsSection />}
          {tab === 3 && <PlazaSection />}
        </div>
      </LightboxProvider>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[#080812] border-t-[3px] border-t-[#3d3570] shadow-[0_-4px_0_#000] flex z-[100]">
        {TABS.map((t, i) => (
          <button key={t.label} onClick={() => setTab(i)}
            className={`flex-1 flex flex-col items-center gap-1 pt-2.5 pb-4 border-none cursor-pointer font-inherit transition-[color,border-color] duration-100 ${
              tab === i
                ? "bg-[#12122a] border-t-[3px] border-t-[#9d4edd] text-[#fbbf24]"
                : "bg-transparent border-t-[3px] border-t-transparent text-[#3d3570]"
            }`}
          >
            <t.Icon className="w-5 h-5" />
            <span className="text-[10px]">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
