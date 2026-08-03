import type { ReadingRecordUI, WeeklyEntry, PlazaEntry } from "./reading";
import type { ReadingRecord } from "./client";

/** API 通用响应结构 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

/** 保存占卜记录 - 请求 */
export interface SaveReadingRequest {
  question: string;
  drawCount: 1 | 3;
  cards: Array<{
    cardId: number;
    reversed: boolean;
    position?: string;
    reading: string;
  }>;
  combinedReading?: string;
}

/** 保存占卜记录 - 响应 */
export type SaveReadingResponse = ApiResponse<ReadingRecord>;

/** 获取周记列表 - 响应 */
export type GetWeeklyResponse = ApiResponse<WeeklyEntry[]>;

/** 获取广场列表 - 请求 */
export interface GetPlazaRequest {
  page?: number;
  limit?: number;
}

/** 获取广场列表 - 响应 */
export interface GetPlazaResponse {
  success: boolean;
  data: PlazaEntry[];
  total: number;
  page: number;
}

/** 点赞 - 请求 */
export interface LikeRequest {
  entryId: number;
}
