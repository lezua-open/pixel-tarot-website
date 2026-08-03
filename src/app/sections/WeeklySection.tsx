import { useState, useEffect } from "react";
import { WEEKLY, CARDS } from "../data";
import { getReadings, type ReadingRecord } from "../api/client";
import { genReading } from "../utils";
import { ReadingDetailModal } from "../components/ReadingDetailModal";

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

function mapReadingToEntry(r: ReadingRecord): DisplayEntry {
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
    source: "db",
  };
}

function makeDemoEntries(): DisplayEntry[] {
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
}

export function WeeklySection() {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [detailEntry, setDetailEntry] = useState<DisplayEntry | null>(null);
  const [entries, setEntries] = useState<DisplayEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getReadings(1, 50);
        setEntries(res.data.length > 0 ? res.data.map(mapReadingToEntry) : makeDemoEntries());
      } catch {
        setEntries(makeDemoEntries());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getSummary = (entry: DisplayEntry) =>
    entry.cards.length === 1 ? entry.cards[0].name : entry.cards.map(c => c.name).join(" · ");

  return (
    <div className="flex flex-col px-4 pt-4 pb-[100px]">
      <div className="text-center pt-4 mb-4">
        <div className="text-[8px] text-[#c084fc] tracking-[0.15em]">✦ WEEKLY LOG ✦</div>
        <div className="text-xs text-[#e8deff] mt-2">
          {loading ? "加载中..." : `近${entries.length}条记录`}
        </div>
      </div>

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

      {detailEntry && (
        <ReadingDetailModal entry={detailEntry} onClose={() => setDetailEntry(null)} />
      )}
    </div>
  );
}
