import { useState, useEffect } from "react";
import { WEEKLY, CARDS } from "../data";
import { MiniCard } from "../components/ui/MiniCard";
import { Panel } from "../components/ui/Panel";
import { genReading } from "../utils";
import { getReadings, type ReadingRecord, type CardReadingPayload } from "../api/client";

interface DisplayCard {
  id: number; name: string; en: string; img: string; col: string; light: string; dark: string;
  reversed: boolean; reading: string;
}

interface DisplayEntry {
  id: string;
  day: string;
  date: string;
  question: string;
  cards: DisplayCard[];
  combinedReading?: string;
  source: "db" | "demo";
}

export function WeeklySection() {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [detailEntry, setDetailEntry] = useState<DisplayEntry | null>(null);
  const [entries, setEntries] = useState<DisplayEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadReadings(); }, []);

  const loadReadings = async () => {
    try {
      const res = await getReadings(1, 50);
      const dbEntries: DisplayEntry[] = res.data.map((r) => {
        const date = new Date(r.created_at);
        const cards: DisplayCard[] = r.cards.map((c) => {
          const card = CARDS.find((cd) => cd.id === c.card_id) || CARDS[0];
          return {
            id: card.id, name: card.name, en: card.en, img: card.img, col: card.col, light: card.light, dark: card.dark,
            reversed: c.reversed, reading: c.reading_text,
          };
        });
        return {
          id: r.id,
          day: date.toLocaleDateString("zh-CN", { weekday: "short" }),
          date: `${date.getMonth() + 1}/${date.getDate()}`,
          question: r.question,
          cards,
          combinedReading: r.combined_reading || undefined,
          source: "db" as const,
        };
      });

      if (dbEntries.length === 0) {
        setEntries(makeDemoEntries());
      } else {
        setEntries(dbEntries);
      }
    } catch {
      setEntries(makeDemoEntries());
    } finally {
      setLoading(false);
    }
  };

  const makeDemoEntries = (): DisplayEntry[] => {
    return WEEKLY.map((w) => ({
      id: `demo-${w.day}`,
      day: w.day,
      date: w.date,
      question: w.q,
      cards: [{
        id: w.card.id, name: w.card.name, en: w.card.en, img: w.card.img, col: w.card.col, light: w.card.light, dark: w.card.dark,
        reversed: w.reversed, reading: genReading(w.card, w.reversed),
      }],
      source: "demo" as const,
    }));
  };

  // Get summary text for accordion display
  const getSummary = (entry: DisplayEntry) => {
    if (entry.cards.length === 1) {
      return entry.cards[0].name;
    }
    return entry.cards.map(c => c.name).join(" · ");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, padding: "16px 16px 100px" }}>
      <div style={{ textAlign: "center", paddingTop: 16, marginBottom: 16 }}>
        <div style={{ fontSize: "8px", color: "#c084fc", letterSpacing: "0.15em" }}>✦ WEEKLY LOG ✦</div>
        <div style={{ fontSize: "12px", color: "#e8deff", marginTop: 8 }}>
          {loading ? "加载中..." : `近${entries.length}条记录`}
        </div>
      </div>

      {/* Accordion */}
      {entries.map((entry, i) => {
        const isOpen = expandedDay === entry.id;
        const firstCard = entry.cards[0];
        return (
          <div key={entry.id} style={{ borderBottom: i < entries.length - 1 ? "1px solid #1a1a2e" : "none" }}>
            <button onClick={() => setExpandedDay(isOpen ? null : entry.id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "12px", background: isOpen ? "#12122a" : "transparent",
              border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
            }}>
              <span style={{ fontSize: "8px", color: "#555", minWidth: 32 }}>{entry.day}</span>
              <span style={{ fontSize: "6px", color: "#3d3570", minWidth: 36 }}>{entry.date}</span>
              <span style={{
                fontSize: "14px", fontFamily: "'VT323', monospace", color: "#e8deff", flex: 1,
                overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
              }}>{entry.question}</span>
              <span style={{ fontSize: "7px", color: firstCard.col, flexShrink: 0 }}>{getSummary(entry)}</span>
              <span style={{
                fontSize: "10px", color: isOpen ? "#c084fc" : "#3d3570",
                transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s",
              }}>▶</span>
            </button>

            {isOpen && (
              <div style={{ padding: "0 12px 12px", animation: "fadeUp 0.2s ease" }}>
                <div
                  onClick={() => setDetailEntry(entry)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                    background: "#0a0a1a", border: `2px solid ${firstCard.col}33`,
                    cursor: "pointer", transition: "border-color 0.2s",
                  }}
                >
                  <span style={{
                    fontSize: "15px", fontFamily: "'VT323', monospace", color: "#e8deff", flex: 1,
                    overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
                  }}>{entry.question}</span>
                  {entry.cards.length > 1 && (
                    <span style={{ fontSize: "6px", color: "#555", flexShrink: 0 }}>{entry.cards.length}张</span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Detail modal */}
      {detailEntry && (
        <div onClick={() => setDetailEntry(null)} style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(5,5,15,0.96)",
          display: "flex", flexDirection: "column", alignItems: "center",
          overflowY: "auto", padding: "24px 16px 60px", gap: 16, cursor: "pointer",
          animation: "fadeUp 0.3s ease forwards",
        }}>
          <div onClick={e => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, width: "100%", maxWidth: 340, cursor: "default" }}>
          <div style={{ fontSize: "7px", color: "#555" }}>
            ✦ {detailEntry.day} · {detailEntry.date} ✦
          </div>

          {/* Question */}
          <div style={{ maxWidth: 340, width: "100%", padding: "10px 14px", background: "#12122a", border: "2px solid #3d3570" }}>
            <div style={{ fontSize: "7px", color: "#555", marginBottom: 4 }}>问题</div>
            <div style={{ fontSize: "16px", fontFamily: "'VT323', monospace", color: "#e8deff", lineHeight: 1.5 }}>{detailEntry.question}</div>
          </div>

          {/* All cards */}
          {detailEntry.cards.map((card, idx) => (
            <div key={card.id + "-" + idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: "100%", maxWidth: 340 }}>
              {detailEntry.cards.length > 1 && (
                <div style={{ fontSize: "7px", color: "#555", letterSpacing: "0.1em" }}>✦ 第 {idx + 1} 张 ✦</div>
              )}

              <MiniCard card={{ ...card, energy: "light" } as any} reversed={card.reversed} size="lg" />

              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "16px", color: card.col, fontFamily: "'VT323', monospace" }}>{card.name}</div>
                <div style={{ fontSize: "8px", color: "#7766bb", marginTop: 4 }}>{card.en}</div>
                {card.reversed && (
                  <div style={{ display: "inline-block", marginTop: 6, background: "#1a0a0a", color: "#dc2626", fontSize: "7px", padding: "2px 8px", border: "2px solid #dc2626" }}>逆位</div>
                )}
              </div>

              <Panel label={detailEntry.cards.length > 1 ? `解读 · 第${idx + 1}张` : "塔罗解读"} color={card.col}>
                <div style={{ padding: 14, fontSize: "16px", fontFamily: "'VT323', monospace", color: "#e8deff", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                  {card.reading || "暂无解读"}
                </div>
              </Panel>
            </div>
          ))}

          {/* Combined reading */}
          {detailEntry.combinedReading && detailEntry.cards.length > 1 && (
            <Panel label="✦ 综合解读" color="#fbbf24">
              <div style={{ padding: 14, fontSize: "16px", fontFamily: "'VT323', monospace", color: "#e8deff", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                {detailEntry.combinedReading}
              </div>
            </Panel>
          )}

          <div style={{ fontSize: "7px", color: "#3d3570" }}>点击关闭</div>
          </div>
        </div>
      )}
    </div>
  );
}
