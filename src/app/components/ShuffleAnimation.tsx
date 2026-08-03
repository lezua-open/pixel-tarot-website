import { motion } from "motion/react";
import type { DrawnCard } from "../types";
import type { AnimPhase } from "../hooks/useDivination";
import { DECK_COUNT } from "../constants";

interface ShuffleAnimationProps {
  animPhase: AnimPhase;
  drawnIdx: number;
  drawn: DrawnCard[];
}

export function ShuffleAnimation({ animPhase, drawnIdx, drawn }: ShuffleAnimationProps) {
  const deckCards = Array.from({ length: DECK_COUNT }, (_, i) => {
    const center = (DECK_COUNT - 1) / 2;
    return { idx: i, spreadX: (i - center) * 18, spreadRot: (i - center) * 4 };
  });

  return (
    <div className="flex flex-col items-center gap-4 py-10 w-full">
      <div className="text-[8px] text-[#c084fc] animate-[blink_1s_ease_infinite]">
        ✦ {animPhase === "spread" ? "展开牌组" : animPhase === "gather" ? "收拢牌组" : animPhase === "shuffle" ? "洗牌中" : animPhase === "draw" ? "抽牌中" : "命运已定"} ✦
      </div>

      <div className="relative h-[200px] w-full flex justify-center items-center">
        {deckCards.map(({ idx, spreadX, spreadRot }) => {
          const shufX = ((idx * 41 + 7) % 80) - 40;
          const shufY = ((idx * 29 + 11) % 30) - 15;
          const shufRot = ((idx * 53 + 3) % 30) - 15;
          const delay = idx * 0.05;

          const drawIdx = DECK_COUNT - 1 - idx;
          const isDrawn = animPhase === "draw" && drawnIdx >= drawIdx;
          const isGlowing = animPhase === "glow" && drawnIdx >= drawIdx;

          let x = 0, y = 0, rot = 0, scale = 1;
          let spring = { stiffness: 200, damping: 25 };

          if (animPhase === "spread") { x = spreadX; rot = spreadRot; spring = { stiffness: 180, damping: 18 }; }
          else if (animPhase === "gather") { x = (idx - DECK_COUNT / 2) * 1.5; rot = (idx - DECK_COUNT / 2) * 0.3; spring = { stiffness: 200, damping: 22 }; }
          else if (animPhase === "shuffle") { x = shufX; y = shufY; rot = shufRot; spring = { stiffness: 160, damping: 18 }; }
          else if (animPhase === "draw") {
            if (isDrawn) { const offset = drawIdx * 80 - (drawnIdx) * 40; x = offset; y = -70; scale = 1.15; spring = { stiffness: 120, damping: 14 }; }
            else { x = (idx - DECK_COUNT / 2) * 1.5; rot = (idx - DECK_COUNT / 2) * 0.3; }
          } else if (animPhase === "glow") {
            if (isGlowing) { const offset = drawIdx * 80 - (drawnIdx) * 40; x = offset; y = -70; scale = 1.15; }
            else { x = (idx - DECK_COUNT / 2) * 1.5; rot = (idx - DECK_COUNT / 2) * 0.3; }
          }

          const cardCol = isGlowing && drawn[drawIdx] ? drawn[drawIdx].col : undefined;

          return (
            <motion.div key={idx} animate={{ x, y, rotate: rot, scale }}
              transition={{ type: "spring", ...spring, delay }}
              className="absolute w-[72px] h-[106px] flex items-center justify-center text-[20px] text-[#fbbf24]"
              style={{
                background: "repeating-conic-gradient(#12122a 0% 25%, #1c1040 0% 50%) 0 0 / 10px 10px",
                border: `3px solid ${isGlowing && cardCol ? cardCol : isDrawn ? "#c084fc" : "#3d2a6a"}`,
                boxShadow: isGlowing && cardCol ? `0 0 16px ${cardCol}88, 0 0 32px ${cardCol}44, 3px 3px 0 #000`
                  : isDrawn ? "0 0 12px #c084fc66, 3px 3px 0 #000" : "2px 2px 0 #000",
                zIndex: isDrawn ? 100 : idx,
              }}
            >✦</motion.div>
          );
        })}
      </div>

      <div className="flex gap-2">
        {(["spread", "gather", "shuffle", "draw", "glow"] as const).map((p, i) => (
          <div key={i} className="w-2 h-2 transition-colors duration-300"
            style={{ background: animPhase === p ? "#fbbf24" : "#3d3570" }}
          />
        ))}
      </div>
    </div>
  );
}
