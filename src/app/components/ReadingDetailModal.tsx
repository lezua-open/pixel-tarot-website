import { MiniCard } from "./ui/MiniCard";
import { Panel } from "./ui/Panel";

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

interface ReadingDetailModalProps {
  entry: DisplayEntry;
  onClose: () => void;
}

export function ReadingDetailModal({ entry, onClose }: ReadingDetailModalProps) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] bg-[rgba(5,5,15,0.96)] flex flex-col items-center overflow-y-auto py-6 px-4 pb-[60px] gap-4 cursor-pointer"
      style={{ animation: "fadeUp 0.3s ease forwards" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="flex flex-col items-center gap-4 w-full max-w-[340px] cursor-default"
      >
        <div className="text-[7px] text-[#555]">
          ✦ {entry.day} · {entry.date} ✦
        </div>

        {/* Question */}
        <div className="max-w-[340px] w-full p-[10px_14px] bg-[#12122a] border-2 border-[#3d3570]">
          <div className="text-[7px] text-[#555] mb-1">问题</div>
          <div className="text-[16px] font-['VT323',monospace] text-[#e8deff] leading-[1.5]">{entry.question}</div>
        </div>

        {/* All cards */}
        {entry.cards.map((card, idx) => (
          <div key={card.id + "-" + idx} className="flex flex-col items-center gap-3 w-full max-w-[340px]">
            {entry.cards.length > 1 && (
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

            <Panel label={entry.cards.length > 1 ? `解读 · 第${idx + 1}张` : "塔罗解读"} color={card.col}>
              <div className="p-[14px] text-[16px] font-['VT323',monospace] text-[#e8deff] leading-[1.7] whitespace-pre-line">
                {card.reading || "暂无解读"}
              </div>
            </Panel>
          </div>
        ))}

        {/* Combined reading */}
        {entry.combinedReading && entry.cards.length > 1 && (
          <Panel label="✦ 综合解读" color="#fbbf24">
            <div className="p-[14px] text-[16px] font-['VT323',monospace] text-[#e8deff] leading-[1.7] whitespace-pre-line">
              {entry.combinedReading}
            </div>
          </Panel>
        )}

        <div className="text-[7px] text-[#3d3570]">点击关闭</div>
      </div>
    </div>
  );
}
