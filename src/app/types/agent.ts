import type { TCard, DrawnCard } from "./card";

/** Agent 调用请求 */
export interface AgentReadingRequest {
  question: string;
  cards: Array<{
    card: TCard;
    reversed: boolean;
    position?: string;
  }>;
  context?: string;  // 用户额外上下文
}

/** Agent 调用响应 */
export interface AgentReadingResponse {
  readings: string[];       // 每张牌的解读
  combinedReading?: string; // 综合解读
  advice?: string;          // 行动建议
  confidence: number;       // 0-1 置信度
}

/** Agent 流式响应 chunk */
export interface AgentStreamChunk {
  type: "reading" | "combined" | "advice" | "done";
  cardIndex?: number;       // reading 类型时有值
  text: string;
}
