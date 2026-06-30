import {
  Sparkles as IconSparkles, Calendar as IconCalendar,
  Chart as IconChart, Globe as IconGlobe,
} from "pixelarticons/react";

export const GLOBAL_STYLES = `
  @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spkFloat { 0% { transform: scale(1); opacity: 1; } 100% { transform: translateY(-90px) scale(0); opacity: 0; } }
  @keyframes loadingPulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
  textarea::placeholder { color: #3d3570; font-family: 'VT323', monospace; font-size: 16px; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: #0a0a1a; }
  ::-webkit-scrollbar-thumb { background: #3d3570; border: 1px solid #000; }
  * { box-sizing: border-box; }
`;

export const DECK_COUNT = 10;

export const TABS = [
  { label: "占卜", Icon: IconSparkles },
  { label: "周记", Icon: IconCalendar },
  // { label: "趋势", Icon: IconChart },
  // { label: "广场", Icon: IconGlobe },
];

export const STAR_POSITIONS = Array.from({ length: 32 }, (_, i) => ({
  w: i % 3 === 0 ? 4 : 2,
  x: ((i * 37 + 13) % 97) + 1,
  y: ((i * 53 + 7) % 97) + 1,
  col: ["#c084fc", "#60a5fa", "#fbbf24", "#ffffff", "#a3e635"][i % 5],
  dur: 1 + (i % 3) * 0.8,
  delay: i * 0.15,
}));
