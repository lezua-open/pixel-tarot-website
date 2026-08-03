import type { DrawnCard } from "../types";
import { MiniCard } from "./ui/MiniCard";
import { Panel } from "./ui/Panel";
import { PixelBtn } from "./ui/PixelBtn";

interface ReadingResultProps {
  q: string;
  drawn: DrawnCard[];
  drawCount: 1 | 3;
  readings: string[];
  combinedReading: string;
  combinedLoading: boolean;
  combinedDone: boolean;
  loadingMsg: string;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}

export function ReadingResult({
  q, drawn, drawCount, readings, combinedReading,
  combinedLoading, combinedDone, loadingMsg, saving,
  onSave, onReset,
}: ReadingResultProps) {
  return (
    <div className="flex flex-col items-center gap-4 w-full animate-[fadeUp_0.4s_ease_forwards]">
      <div className="text-[8px] text-[#fbbf24] animate-[blink_2s_steps(1)_infinite]">✦ 命运之牌揭晓 ✦</div>

      <div className="max-w-[340px] w-full py-2.5 px-3.5 bg-[#12122a] border-2 border-[#3d3570]">
        <div className="text-[7px] text-[#555] mb-1">你的问题</div>
        <div className="text-[16px] font-['VT323',_monospace] text-[#e8deff] leading-[1.5]">{q}</div>
      </div>

      {drawn.map((card, idx) => (
        <div key={card.id + "-" + idx} className="flex flex-col items-center gap-3 w-full"
          style={{ animation: `fadeUp 0.4s ease ${idx * 0.15}s both` }}
        >
          {drawCount === 3 && (
            <div className="text-[7px] text-[#555] tracking-[0.1em]">✦ 第 {idx + 1} 张 ✦</div>
          )}
          <MiniCard card={card} reversed={card.reversed} size="lg" />
          <div className="text-center">
            <div className="text-[14px]" style={{ color: card.col }}>{card.name}</div>
            <div className="text-[7px] text-[#7766bb] mt-1">{card.en}</div>
            {card.reversed && (
              <div className="inline-block mt-1.5 bg-[#1a0a0a] text-[#dc2626] text-[7px] py-0.5 px-2 border-2 border-[#dc2626]">逆位</div>
            )}
          </div>
          <Panel label={drawCount === 3 ? `解读 · 第${idx + 1}张` : "塔罗解读"} color={card.col}>
            <div className="p-3.5 text-[17px] font-['VT323',_monospace] text-[#e8deff] leading-[1.7] whitespace-pre-line min-h-[60px]">
              {readings[idx] || "等待解读..."}
            </div>
          </Panel>
        </div>
      ))}

      {drawCount === 3 && (
        <Panel label="✦ 综合解读" color="#fbbf24">
          <div className="p-3.5 text-[16px] font-['VT323',_monospace] text-[#e8deff] leading-[1.7] whitespace-pre-line">
            {combinedLoading ? (
              <div className="text-center">
                <div className="text-[14px] text-[#c084fc] animate-[loadingPulse_2s_ease-in-out_infinite]">
                  ✦ {loadingMsg} ✦
                </div>
              </div>
            ) : (
              <>
                {combinedReading || "综合解读生成中..."}
                {!combinedDone && combinedReading && <span className="animate-[blink_0.55s_steps(1)_infinite]">▌</span>}
              </>
            )}
          </div>
        </Panel>
      )}

      <PixelBtn onClick={onSave} full disabled={saving || (drawCount === 3 && (combinedLoading || !combinedDone))}>
        {saving ? "✦ 保存中..." : drawCount === 3 && combinedLoading ? "✦ 综合解读生成中... ✦" : "✦ 牌案归册 ✦"}
      </PixelBtn>

      <PixelBtn onClick={onReset} variant="ghost" full>↩ 再问一次</PixelBtn>
    </div>
  );
}
