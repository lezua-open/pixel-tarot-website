import type { TCard } from "../../types";
import { useLightbox } from "../../context";

const sizeClasses = {
  sm: "w-[52px] h-[78px]",
  md: "w-[72px] h-[108px]",
  lg: "w-[110px] h-[165px]",
} as const;

export function MiniCard({ card, reversed, size = "md" }: { card: TCard; reversed: boolean; size?: "sm" | "md" | "lg" }) {
  const openLightbox = useLightbox();
  return (
    <div
      onClick={() => openLightbox(card, reversed)}
      className={[
        sizeClasses[size],
        "border-[3px] border-solid shrink-0 relative overflow-hidden cursor-pointer bg-[#0a0a1a]",
        reversed ? "rotate-180" : "",
      ].join(" ")}
      style={{
        borderColor: card.col,
        boxShadow: `3px 3px 0 #000, 0 0 14px ${card.col}55`,
      }}
    >
      <img
        src={card.img}
        alt={card.name}
        className="block w-full h-full object-cover [image-rendering:pixelated]"
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.14) 3px, rgba(0,0,0,0.14) 4px)",
        }}
      />
    </div>
  );
}
