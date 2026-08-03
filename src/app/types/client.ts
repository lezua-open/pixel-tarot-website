/** API 客户端专用类型 - 与后端 Pydantic schema 对齐 (snake_case) */

/** 卡牌解读请求体 */
export interface CardReadingPayload {
  card_id: number;
  card_name: string;
  card_en: string;
  reversed: boolean;
  position?: string;
  reading_text: string;
}

/** 保存占卜记录请求 */
export interface SaveReadingPayload {
  question: string;
  draw_count: number;
  cards: CardReadingPayload[];
  combined_reading?: string;
}

/** 占卜记录（API 响应） */
export interface ReadingRecord {
  id: string;
  question: string;
  draw_count: number;
  combined_reading: string | null;
  cards: CardReadingPayload[];
  created_at: string;
  updated_at: string;
}

/** 占卜列表响应 */
export interface ReadingListResponse {
  success: boolean;
  data: ReadingRecord[];
  total: number;
}
