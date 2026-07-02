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

export interface CardReadingPayload {
  card_id: number;
  card_name: string;
  card_en: string;
  reversed: boolean;
  position?: string;
  reading_text: string;
}

export interface SaveReadingPayload {
  question: string;
  draw_count: number;
  cards: CardReadingPayload[];
  combined_reading?: string;
}

export interface ReadingRecord {
  id: string;
  question: string;
  draw_count: number;
  combined_reading: string | null;
  cards: CardReadingPayload[];
  created_at: string;
  updated_at: string;
}

export interface ReadingListResponse {
  success: boolean;
  data: ReadingRecord[];
  total: number;
}

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

    console.log("Agent API response status:", res.status);
    if (!res.ok || !res.body) {
      throw new Error(`Stream error: ${res.status}`);
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
