import type { TCard } from "../../types";
import { useLightbox } from "../../context";

export function MiniCard({ card, reversed, size = "md" }: { card: TCard; reversed: boolean; size?: "sm" | "md" | "lg" }) {
  const openLightbox = useLightbox();
  const w = size === "sm" ? 52 : size === "lg" ? 110 : 72;
  const h = size === "sm" ? 78 : size === "lg" ? 165 : 108;
  return (
    <div onClick={() => openLightbox(card, reversed)} style={{
      width: w, height: h,
      border: `3px solid ${card.col}`,
      boxShadow: `3px 3px 0 #000, 0 0 14px ${card.col}55`,
      background: "#0a0a1a",
      transform: reversed ? "rotate(180deg)" : undefined,
      flexShrink: 0, position: "relative", overflow: "hidden", cursor: "pointer",
    }}>
      <img src={card.img} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", imageRendering: "pixelated" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.14) 3px, rgba(0,0,0,0.14) 4px)", pointerEvents: "none" }} />
    </div>
  );
}
