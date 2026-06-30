import type { TCard } from "./types";
import { READING_TEMPLATES } from "./data";

export function genReading(card: TCard, reversed: boolean): string {
  const t = READING_TEMPLATES[Math.floor(Math.random() * READING_TEMPLATES.length)];
  return t
    .replace(/{CARD}/g, card.name)
    .replace(/{POS}/g, reversed ? "逆位" : "正位")
    .replace(/{ASPECT}/g, reversed ? card.dark : card.light);
}
