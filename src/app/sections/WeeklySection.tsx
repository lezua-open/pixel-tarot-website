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
    <div className="flex flex-col px-4 pt-4 pb-[100px]">
      {/* Header */}
      <div className="text-center pt-4 mb-4">
        <div className="text-[8px] text-[#c084fc] tracking-[0.15em]">✦ WEEKLY LOG ✦</div>
        <div className="text-xs text-[#e8deff] mt-2">
          {loading ? "加载中..." : `近${entries.length}条记录`}
        </div>
      </div>

      {/* Accordion */}
      {entries.map((entry, i) => {
        const isOpen = expandedDay === entry.id;
        const firstCard = entry.cards[0];
        return (
          <div key={entry.id} className={i < entries.length - 1 ? "border-b border-[#1a1a2e]" : ""}>
            <button
              onClick={() => setExpandedDay(isOpen ? null : entry.id)}
              className={`w-full flex items-center gap-[10px] p-3 border-none cursor-pointer font-inherit text-left ${isOpen ? "bg-[#12122a]" : "bg-transparent"}`}
            >
              <span className="text-[8px] text-[#555] min-w-8">{entry.day}</span>
              <span className="text-[6px] text-[#3d3570] min-w-9">{entry.date}</span>
              <span className="text-[14px] font-['VT323',monospace] text-[#e8deff] flex-1 overflow-hidden whitespace-nowrap text-ellipsis">
                {entry.question}
              </span>
              <span className="text-[7px] flex-shrink-0" style={{ color: firstCard.col }}>{getSummary(entry)}</span>
              <span className={`text-[10px] transition-transform duration-200 ${isOpen ? "text-[#c084fc] rotate-90" : "text-[#3d3570] rotate-0"}`}>▶</span>
            </button>

            {isOpen && (
              <div className="px-3 pb-3" style={{ animation: "fadeUp 0.2s ease" }}>
                <div
                  onClick={() => setDetailEntry(entry)}
                  className="flex items-center gap-[10px] p-[10px_12px] bg-[#0a0a1a] border-2 cursor-pointer transition-[border-color] duration-200"
                  style={{ borderColor: `${firstCard.col}33` }}
                >
                  <span className="text-[15px] font-['VT323',monospace] text-[#e8deff] flex-1 overflow-hidden whitespace-nowrap text-ellipsis">
                    {entry.question}
                  </span>
                  {entry.cards.length > 1 && (
                    <span className="text-[6px] text-[#555] flex-shrink-0">{entry.cards.length}张</span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Detail modal */}
      {detailEntry && (
        <div
          onClick={() => setDetailEntry(null)}
          className="fixed inset-0 z-[200] bg-[rgba(5,5,15,0.96)] flex flex-col items-center overflow-y-auto py-6 px-4 pb-[60px] gap-4 cursor-pointer"
          style={{ animation: "fadeUp 0.3s ease forwards" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="flex flex-col items-center gap-4 w-full max-w-[340px] cursor-default"
          >
            <div className="text-[7px] text-[#555]">
              ✦ {detailEntry.day} · {detailEntry.date} ✦
            </div>

            {/* Question */}
            <div className="max-w-[340px] w-full p-[10px_14px] bg-[#12122a] border-2 border-[#3d3570]">
              <div className="text-[7px] text-[#555] mb-1">问题</div>
              <div className="text-[16px] font-['VT323',monospace] text-[#e8deff] leading-[1.5]">{detailEntry.question}</div>
            </div>

            {/* All cards */}
            {detailEntry.cards.map((card, idx) => (
              <div key={card.id + "-" + idx} className="flex flex-col items-center gap-3 w-full max-w-[340px]">
                {detailEntry.cards.length > 1 && (
                  <div className="text-[7px] text-[#555] tracking-[0.1em]">✦ 第 {idx + 1} 张 ✦</div>
                )}

                <MiniCard card={{ ...card, energy: "light" } as any} reversed={card.reversed} size="lg" />

                <div className="text-center">
                  <div className="text-[16px] font-['VT323',monospace]" style={{ color: card.col }}>{card.name}</div>
                  <div className="text-[8px] text-[#7766bb] mt-1">{card.en}</div>
                  {card.reversed && (
                    <div className="inline-block mt-[6px] bg-[#1a0a0a] text-[#dc2626] text-[7px] px-2 py-[2px] border-2 border-[#dc2626]">逆位</div>
                  )}
                </div>

                <Panel label={detailEntry.cards.length > 1 ? `解读 · 第${idx + 1}张` : "塔罗解读"} color={card.col}>
                  <div className="p-[14px] text-[16px] font-['VT323',monospace] text-[#e8deff] leading-[1.7] whitespace-pre-line">
                    {card.reading || "暂无解读"}
                  </div>
                </Panel>
              </div>
            ))}

            {/* Combined reading */}
            {detailEntry.combinedReading && detailEntry.cards.length > 1 && (
              <Panel label="✦ 综合解读" color="#fbbf24">
                <div className="p-[14px] text-[16px] font-['VT323',monospace] text-[#e8deff] leading-[1.7] whitespace-pre-line">
                  {detailEntry.combinedReading}
                </div>
              </Panel>
            )}

            <div className="text-[7px] text-[#3d3570]">点击关闭</div>
          </div>
        </div>
      )}
    </div>
  );
}
