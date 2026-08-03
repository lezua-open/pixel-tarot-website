import type { TCard, SpreadPosition } from "./card";

/** 单张牌的解读 (UI 层) */
export interface CardReading {
  cardId: number;
  cardName: string;
  reversed: boolean;
  position?: SpreadPosition;
  text: string;           // 解读文本
}

/** 完整的占卜记录（UI 层，camelCase） */
export interface ReadingRecordUI {
  id: string;             // UUID
  question: string;       // 用户问题
  drawCount: 1 | 3;      // 抽牌数量
  cards: CardReading[];   // 每张牌的解读
  combinedReading?: string; // 三牌阵综合解读
  createdAt: string;      // ISO 时间戳
  updatedAt: string;
}

/** 周记条目 */
export interface WeeklyEntry {
  id: string;
  day: string;            // MON, TUE, ...
  date: string;           // 6/24, 6/25, ...
  question: string;
  card: TCard;
  reversed: boolean;
  reading: string;
}

/** 广场条目 */
export interface PlazaEntry {
  id: number;
  user: string;
  question: string;
  card: TCard;
  reversed: boolean;
  likes: number;
  time: string;
}
