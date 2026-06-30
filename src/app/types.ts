// Re-export card types from the types directory
export type {
  TCard,
  DrawnCard,
  EnergyType,
  CardOrientation,
  SpreadPosition,
  CardIconMap,
} from "./types/card";

// LightboxData is app-specific, keep it here
import type { TCard } from "./types/card";
export type LightboxData = { card: TCard; reversed: boolean } | null;
