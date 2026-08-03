import type { CardReadingPayload, SaveReadingPayload, ReadingRecord, ReadingListResponse } from "../types/client";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// ── Readings API ──────────────────────────────────────────────────────────────

export type { CardReadingPayload, SaveReadingPayload, ReadingRecord, ReadingListResponse };

export async function saveReading(payload: SaveReadingPayload): Promise<ReadingRecord> {
  return request<ReadingRecord>("/api/readings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getReadings(page = 1, limit = 20): Promise<ReadingListResponse> {
  return request<ReadingListResponse>(`/api/readings?page=${page}&limit=${limit}`);
}

export async function getReading(id: string): Promise<ReadingRecord> {
  return request<ReadingRecord>(`/api/readings/${id}`);
}

export async function deleteReading(id: string): Promise<void> {
  await request(`/api/readings/${id}`, { method: "DELETE" });
}

// ── 问题验证 ─────────────────────────────────────────────────────────────────

export async function validateQuestion(question: string): Promise<{ valid: boolean; message?: string }> {
  const res = await fetch(`${API_BASE}/api/agent/validate-question`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { valid: false, message: data.detail || "请想清楚后再问" };
  }

  return { valid: true };
}

// ── Agent API (批量) ────────────────────────────────────────────────────────

export async function batchReading(
  question: string,
  cards: CardReadingPayload[],
): Promise<string[]> {
  const res = await fetch(`${API_BASE}/api/agent/reading/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      cards,
      total_cards: cards.length,
      current_index: 0,
      is_combined: false,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `批量解读失败: ${res.status}`);
  }

  const result = await res.json();
  return result.readings;
}

// ── Agent API (SSE) ──────────────────────────────────────────────────────────

export async function streamAgentReading(
  question: string,
  cards: CardReadingPayload[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: Error) => void,
  totalCards: number = 1,
  currentIndex: number = 0,
  isCombined: boolean = false,
): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/api/agent/reading/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, cards, total_cards: totalCards, current_index: currentIndex, is_combined: isCombined }),
    });

    if (!res.ok) {
      // 尝试从响应体提取错误信息
      try {
        const errorData = await res.json();
        throw new Error(errorData.detail || `请求失败: ${res.status}`);
      } catch (e) {
        if (e instanceof Error && e.message !== `请求失败: ${res.status}`) throw e;
        throw new Error(`请求失败: ${res.status}`);
      }
    }
    if (!res.body) {
      throw new Error("响应体为空");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let chunkCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") {
            onDone();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            // MiMo 返回格式: {"text": "内容"} 或 {"text": [{"thinking": "...", "type": "thinking"}]}
            if (parsed.text) {
              if (typeof parsed.text === "string") {
                // 直接是文本内容
                chunkCount++;
                onChunk(parsed.text);
              } else if (Array.isArray(parsed.text)) {
                // 思考过程数组，提取 content 类型的
                for (const item of parsed.text) {
                  if (item.type === "content" && item.text) {
                    chunkCount++;
                    onChunk(item.text);
                  }
                  // 跳过 thinking 类型
                }
              }
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    }
    onDone();
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}
