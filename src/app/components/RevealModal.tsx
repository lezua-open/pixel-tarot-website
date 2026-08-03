import type { DrawnCard } from "../types";
import { MiniCard } from "./ui/MiniCard";

interface RevealModalProps {
  drawn: DrawnCard[];
  revealIdx: number;
  drawCount: 1 | 3;
  streamingText: string;
  isLoading: boolean;
  revealDone: boolean;
  typewriterDone: boolean;
  loadingMsg: string;
  readings: string[];
  displayReadings: string[];
  onNext: () => void;
  onSkipTypewriter: () => void;
}

export function RevealModal({
  drawn, revealIdx, drawCount, streamingText,
  isLoading, revealDone, typewriterDone, loadingMsg,
  readings, displayReadings, onNext, onSkipTypewriter,
}: RevealModalProps) {
  if (revealIdx < 0 || revealIdx >= drawn.length) return null;

  const card = drawn[revealIdx];

  // 三牌阵用打字机显示，单牌用流式显示
  const isTypewriterMode = drawCount === 3;
  const displayText = isTypewriterMode
    ? (displayReadings[revealIdx] || "")
    : (streamingText || readings[revealIdx] || "");

  // 按钮可用条件：打字机模式需要打字完成，流式模式需要 revealDone
  const canProceed = isTypewriterMode ? typewriterDone : revealDone;

  // 光标：打字机模式未完成时显示，流式模式未完成时显示
  const showCursor = isTypewriterMode ? !typewriterDone : !revealDone;

  return (
    <div className="fixed inset-0 z-[200] bg-[rgba(5,5,15,0.96)] flex flex-col items-center p-6 gap-4 overflow-y-auto animate-[fadeUp_0.4s_ease_forwards]">
      {drawCount === 3 && (
        <div className="text-[8px] text-[#555] tracking-[0.15em]">
          ✦ 第 {revealIdx + 1} 张 ✦
        </div>
      )}

      <MiniCard card={card} reversed={card.reversed} size="lg" />

      <div className="text-center">
        <div className="text-[16px] font-['VT323',_monospace]"
          style={{ color: card.col }}
        >{card.name}</div>
        <div className="text-[8px] text-[#7766bb] mt-1">{card.en}</div>
        {card.reversed && (
          <div className="inline-block mt-1.5 bg-[#1a0a0a] text-[#dc2626] text-[7px] py-0.5 px-2 border-2 border-[#dc2626]">逆位</div>
        )}
      </div>

      <div
        className="max-w-[360px] w-full p-4 bg-[#0a0a1a] text-[16px] font-['VT323',_monospace] text-[#e8deff] leading-[1.7] whitespace-pre-line min-h-[120px] max-h-[40vh] overflow-y-auto"
        style={{ border: `2px solid ${card.col}33` }}
        onClick={isTypewriterMode && !typewriterDone ? onSkipTypewriter : undefined}
      >
        {isLoading && !isTypewriterMode ? (
          <div className="text-center py-5">
            <div className="text-[14px] text-[#c084fc] animate-[loadingPulse_2s_ease-in-out_infinite]">
              ✦ {loadingMsg} ✦
            </div>
          </div>
        ) : (
          <>
            {displayText}
            {showCursor && <span className="animate-[blink_0.55s_steps(1)_infinite]">▌</span>}
          </>
        )}
      </div>

      <div className="flex gap-2.5 mt-2">
        {drawn.map((_, i) => (
          <div key={i} className="w-2.5 h-2.5 transition-all duration-300"
            style={{
              background: i < revealIdx ? drawn[i].col : i === revealIdx ? "#fbbf24" : "#2a2244",
              border: `2px solid ${i <= revealIdx ? drawn[i].col : "#3d3570"}`,
            }}
          />
        ))}
      </div>

      {canProceed && (
        <button onClick={onNext}
          className="bg-[#7c3aed] text-[#fbbf24] border-[3px] border-[#fbbf24] shadow-[3px_3px_0_#000] py-2.5 px-7 text-[9px] font-inherit cursor-pointer tracking-[0.05em] mt-2 animate-[fadeUp_0.3s_ease_forwards]"
        >
          {revealIdx < drawn.length - 1 ? "▶ 下一张" : "✦ 查看结果"}
        </button>
      )}
    </div>
  );
}
