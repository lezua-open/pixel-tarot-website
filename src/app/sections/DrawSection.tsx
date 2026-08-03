import { useDivination } from "../hooks/useDivination";
import { DECK_COUNT } from "../constants";
import { PixelCatLoader } from "../components/ui/PixelCatLoader";
import { Panel } from "../components/ui/Panel";
import { PixelBtn } from "../components/ui/PixelBtn";
import { RevealModal } from "../components/RevealModal";
import { ShuffleAnimation } from "../components/ShuffleAnimation";
import { ReadingResult } from "../components/ReadingResult";
import { Eye as _IconEye } from "pixelarticons/react";

const IconEye = _IconEye as unknown as React.ComponentType<React.SVGAttributes<SVGSVGElement>>;

export function DrawSection({ onPhaseChange }: { onPhaseChange?: (isDivining: boolean) => void }) {
  const {
    q, setQ, drawCount, setDrawCount,
    phase, animPhase, drawn, drawnIdx,
    readings, displayReadings, sparkles, revealIdx,
    typewriterDone, revealDone,
    isLoading, loadingMsg, streamingText,
    saving, validating,
    combinedReading, combinedLoading, combinedDone,
    draw, nextReveal, reset, handleSave, skipTypewriter,
  } = useDivination(onPhaseChange);

  return (
    <div className="flex flex-col items-center gap-4 p-4 pb-[100px] relative">
      <PixelCatLoader visible={validating} />

      {/* Sparkles */}
      <div className="fixed inset-0 pointer-events-none z-[99]">
        {sparkles.map(s => (
          <div key={s.id} className="absolute w-2 h-2 animate-[spkFloat_2.2s_ease-out_forwards]"
            style={{ left: `${s.x}%`, top: `${s.y}%`, background: s.col, boxShadow: `0 0 6px ${s.col}` }}
          />
        ))}
      </div>

      {/* Full-screen reveal modal (3-card) */}
      <RevealModal
        drawn={drawn}
        revealIdx={revealIdx}
        drawCount={drawCount}
        streamingText={streamingText}
        isLoading={isLoading}
        revealDone={revealDone}
        typewriterDone={typewriterDone}
        loadingMsg={loadingMsg}
        readings={readings}
        displayReadings={displayReadings}
        onNext={nextReveal}
        onSkipTypewriter={skipTypewriter}
      />

      {/* Header */}
      <div className="text-center pt-4">
        <div className="text-[8px] text-[#c084fc] tracking-[0.2em] animate-[blink_3s_steps(1)_infinite]">✦ PIXEL TAROT ✦</div>
        <div className="mt-2.5 flex justify-center"><IconEye className="w-14 h-14 text-[#c084fc]" /></div>
        <div className="text-[12px] text-[#e8deff] mt-2">塔罗</div>
        <div className="text-[7px] text-[#555] mt-1.5">提出问题，寻找答案</div>
      </div>

      {/* Idle state - question input */}
      {phase === "idle" && (
        <>
          <Panel label="输入你的问题">
            <textarea value={q} onChange={e => setQ(e.target.value)} placeholder="想问什么……" rows={3}
              className="w-full bg-[#080812] text-[#e8deff] border-none outline-none p-3 text-[17px] font-['VT323',_monospace] resize-none leading-[1.5]"
            />
          </Panel>

          <div className="flex gap-2 w-full">
            {([1, 3] as const).map(n => (
              <button key={n} onClick={() => setDrawCount(n)}
                className={`flex-1 py-2.5 font-inherit cursor-pointer tracking-[0.05em] text-[8px] border-[3px] ${
                  drawCount === n
                    ? "bg-[#7c3aed] border-[#fbbf24] text-[#fbbf24] shadow-[3px_3px_0_#000]"
                    : "bg-transparent border-[#3d3570] text-[#7766bb] shadow-none"
                }`}
              >{n === 1 ? "✦ 单牌占卜" : "✦ 三牌阵"}</button>
            ))}
          </div>

          <PixelBtn onClick={draw} full disabled={!q.trim() || validating}>
            {validating ? "✦ 思考中..." : q.trim() ? `✦ 抽取${drawCount === 1 ? "命运之牌" : "三张牌"} ✦` : "请先输入你的问题"}
          </PixelBtn>

          <div className="relative h-[150px] w-full flex justify-center items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="absolute w-[88px] h-[130px] flex items-center justify-center"
                style={{
                  background: "repeating-conic-gradient(#12122a 0% 25%, #1c1040 0% 50%) 0 0 / 12px 12px",
                  border: `3px solid ${i === 4 ? "#7c3aed" : "#3d2a6a"}`,
                  boxShadow: i === 4 ? "3px 3px 0 #000, 0 0 24px #7c3aed66" : "none",
                  transform: `rotate(${(i - 2) * 3}deg)`,
                  zIndex: i,
                  fontSize: i === 4 ? "28px" : "0",
                  color: "#fbbf24",
                }}
              >{i === 4 ? "✦" : ""}</div>
            ))}
          </div>
          <div className="text-[7px] text-[#3d3570] -mt-2">22张大阿卡纳 · 随机抽取</div>
        </>
      )}

      {/* Shuffling animation */}
      {phase === "shuffling" && (
        <ShuffleAnimation animPhase={animPhase} drawnIdx={drawnIdx} drawn={drawn} />
      )}

      {/* Revealed - reading results */}
      {phase === "revealed" && drawn.length > 0 && (
        <ReadingResult
          q={q}
          drawn={drawn}
          drawCount={drawCount}
          readings={readings}
          combinedReading={combinedReading}
          combinedLoading={combinedLoading}
          combinedDone={combinedDone}
          loadingMsg={loadingMsg}
          saving={saving}
          onSave={handleSave}
          onReset={reset}
        />
      )}
    </div>
  );
}
