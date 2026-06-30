import { CARDS_ICONS } from "../../data";

export function CardIcon({ id, size, color }: { id: number; size: number; color: string }) {
  const Icon = CARDS_ICONS[id];
  return Icon ? <Icon style={{ width: size, height: size, color, flexShrink: 0 }} /> : null;
}
