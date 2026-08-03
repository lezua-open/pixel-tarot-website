import {
  Sparkles as IconSparkles, Calendar as IconCalendar,
  Chart as IconChart, Globe as IconGlobe,
} from "pixelarticons/react";

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
