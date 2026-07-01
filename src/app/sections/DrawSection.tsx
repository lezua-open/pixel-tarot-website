import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { DrawnCard } from "../types";
import { CARDS } from "../data";
import { DECK_COUNT } from "../constants";
import { MiniCard } from "../components/ui/MiniCard";
import { Panel } from "../components/ui/Panel";
import { PixelBtn } from "../components/ui/PixelBtn";
import { Eye as _IconEye } from "pixelarticons/react";
import { saveReading, streamAgentReading } from "../api/client";

const IconEye = _IconEye as unknown as React.ComponentType<React.SVGAttributes<SVGSVGElement>>;

// 有趣的等待提示
const LOADING_MESSAGES = [
  "正在观察星星眨眼...",
  "偷听小猫的悄悄话...",
  "正在问癞疙宝...",
  "正在问同行....",
  "正在偷偷发会呆...",
  "月亮正在塞小纸条...",
  "正在摇骰子...",
  "正在擦水晶球...",
];

export function DrawSection() {
  const [q, setQ] = useState("");
  const [drawCount, setDrawCount] = useState<1 | 3>(1);
  const [phase, setPhase] = useState<"idle" | "shuffling" | "revealed">("idle");
  const [animPhase, setAnimPhase] = useState<"spread" | "gather" | "shuffle" | "draw" | "glow" | null>(null);
  const [drawn, setDrawn] = useState<DrawnCard[]>([]);
  const [drawnIdx, setDrawnIdx] = useState(-1);
  const [readings, setReadings] = useState<string[]>([]);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; col: string }[]>([]);

  // Modal reveal state
  const [revealIdx, setRevealIdx] = useState(-1);
  const [revealDone, setRevealDone] = useState(false);

  // Agent streaming state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const streamTextRef = useRef("");

  // Combined reading (for 3-card spread)
  const [combinedReading, setCombinedReading] = useState("");
  const [combinedLoading, setCombinedLoading] = useState(false);
  const [combinedDone, setCombinedDone] = useState(false);

  // Loading message rotation (random)
  useEffect(() => {
    if (!isLoading && !combinedLoading) return;
    const pick = () => LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
    setLoadingMsg(pick());
    const t = setInterval(() => setLoadingMsg(pick()), 2500);
    return () => clearInterval(t);
  }, [isLoading, combinedLoading]);

  // When revealIdx changes, fetch agent reading for that card
  useEffect(() => {
    if (revealIdx < 0 || revealIdx >= drawn.length) return;
    fetchCardReading(q, drawn[revealIdx], revealIdx);
  }, [revealIdx]);

  const draw = () => {
    if (!q.trim() || phase !== "idle") return;
    setPhase("shuffling");
    setAnimPhase("spread");
    setDrawn([]);
    setDrawnIdx(-1);
    setReadings([]);
    setRevealIdx(-1);
    setRevealDone(false);
    setIsLoading(false);
    setStreamingText("");
    streamTextRef.current = "";
    setCombinedReading("");
    setCombinedDone(false);
    setCombinedLoading(false);

    // Pre-pick the cards
    const picked: DrawnCard[] = [];
    const available = [...CARDS];
    for (let i = 0; i < drawCount; i++) {
      const idx = Math.floor(Math.random() * available.length);
      const card = available.splice(idx, 1)[0];
      picked.push({ ...card, reversed: Math.random() > 0.72 });
    }
    setDrawn(picked);
    setReadings(picked.map(() => ""));

    const palette = ["#fbbf24", "#c084fc", "#60a5fa", "#f43f5e", "#34d399", "#a3e635"];
    setSparkles(Array.from({ length: 18 }, (_, i) => ({
      id: Date.now() + i,
      x: 5 + Math.random() * 90, y: 5 + Math.random() * 90,
      col: palette[Math.floor(Math.random() * palette.length)],
    })));
    setTimeout(() => setSparkles([]), 5000);

    // Animation phases
    setTimeout(() => setAnimPhase("gather"), 1000);
    setTimeout(() => setAnimPhase("shuffle"), 1800);
    setTimeout(() => { setAnimPhase("draw"); setDrawnIdx(0); }, 3200);
    if (drawCount >= 2) setTimeout(() => setDrawnIdx(1), 3900);
    if (drawCount >= 3) setTimeout(() => setDrawnIdx(2), 4600);
    setTimeout(() => setAnimPhase("glow"), 3200 + drawCount * 700);

    // Open modal/reveal
    setTimeout(() => {
      setAnimPhase(null);
      if (drawCount === 3) {
        setRevealIdx(0); // This triggers useEffect to fetch reading
      } else {
        setPhase("revealed");
        // For single card, fetch reading directly
        fetchCardReading(q, picked[0], 0);
      }
    }, 4200 + drawCount * 700);
  };

  // Fetch agent reading for a single card
  const fetchCardReading = async (question: string, card: DrawnCard, cardIdx: number) => {
    setIsLoading(true);
    setStreamingText("");
    streamTextRef.current = "";
    setRevealDone(false);

    const payload = {
      card_id: card.id,
      card_name: card.name,
      card_en: card.en,
      reversed: card.reversed,
      reading_text: "",
    };

    await streamAgentReading(
      question,
      [payload],
      (chunk) => {
        streamTextRef.current += chunk;
        setStreamingText(streamTextRef.current);
        setIsLoading(false);
      },
      () => {
        const finalText = streamTextRef.current;
        setReadings(prev => { const n = [...prev]; n[cardIdx] = finalText; return n; });
        setRevealDone(true);
        setIsLoading(false);

        // If this is the last card in 3-card spread, fetch combined reading
        if (drawCount === 3 && cardIdx === drawn.length - 1) {
          fetchCombinedReading(question, drawn);
        }
      },
      (err) => {
        console.error("Agent error:", err);
        setIsLoading(false);
        setRevealDone(true);
      },
      drawCount,
      cardIdx,
    );
  };

  // Fetch combined reading for 3-card spread
  const fetchCombinedReading = async (question: string, cards: DrawnCard[]) => {
    setCombinedLoading(true);
    setCombinedDone(false);

    const payloads = cards.map((c, i) => ({
      card_id: c.id, card_name: c.name, card_en: c.en,
      reversed: c.reversed, reading_text: readings[i] || "",
    }));

    let fullText = "";
    await streamAgentReading(
      question,
      payloads,
      (chunk) => { fullText += chunk; setCombinedReading(fullText); setCombinedLoading(false); },
      () => { setCombinedDone(true); setCombinedLoading(false); },
      (err) => { console.error("Combined error:", err); setCombinedLoading(false); setCombinedDone(true); },
      3,     // totalCards
      2,     // currentIndex (last card)
      true,  // isCombined
    );
  };

  // Advance to next card or close modal
  const nextReveal = () => {
    if (revealIdx < drawn.length - 1) {
      setRevealIdx(revealIdx + 1); // This triggers useEffect to fetch next card's reading
    } else {
      setRevealIdx(-1);
      setPhase("revealed");
    }
  };

  const reset = () => {
    setPhase("idle"); setAnimPhase(null); setDrawn([]); setQ("");
    setReadings([]); setRevealIdx(-1); setRevealDone(false);
    setIsLoading(false); setStreamingText(""); streamTextRef.current = "";
    setCombinedReading(""); setCombinedDone(false); setCombinedLoading(false);
  };

  const deckCards = Array.from({ length: DECK_COUNT }, (_, i) => {
    const center = (DECK_COUNT - 1) / 2;
    return { idx: i, spreadX: (i - center) * 18, spreadRot: (i - center) * 4 };
  });

  return (
    <div className="flex flex-col items-center gap-4 p-4 pb-[100px] relative">
      {/* Sparkles */}
      <div className="fixed inset-0 pointer-events-none z-[99]">
        {sparkles.map(s => (
          <div key={s.id} className="absolute w-2 h-2 animate-[spkFloat_2.2s_ease-out_forwards]"
            style={{ left: `${s.x}%`, top: `${s.y}%`, background: s.col, boxShadow: `0 0 6px ${s.col}` }}
          />
        ))}
      </div>

      {/* ── Full-screen reveal modal (3-card) ── */}
      {revealIdx >= 0 && revealIdx < drawn.length && (
        <div className="fixed inset-0 z-[200] bg-[rgba(5,5,15,0.96)] flex flex-col items-center p-6 gap-4 overflow-y-auto animate-[fadeUp_0.4s_ease_forwards]">
          {/* Card number label */}
          {drawCount === 3 && (
            <div className="text-[8px] text-[#555] tracking-[0.15em]">
              ✦ 第 {revealIdx + 1} 张 ✦
            </div>
          )}

          <MiniCard card={drawn[revealIdx]} reversed={drawn[revealIdx].reversed} size="lg" />

          <div className="text-center">
            <div className="text-[16px] font-['VT323',_monospace]"
              style={{ color: drawn[revealIdx].col }}
            >{drawn[revealIdx].name}</div>
            <div className="text-[8px] text-[#7766bb] mt-1">{drawn[revealIdx].en}</div>
            {drawn[revealIdx].reversed && (
              <div className="inline-block mt-1.5 bg-[#1a0a0a] text-[#dc2626] text-[7px] py-0.5 px-2 border-2 border-[#dc2626]">逆位</div>
            )}
          </div>

          {/* Reading area with scroll */}
          <div className="max-w-[360px] w-full p-4 bg-[#0a0a1a] text-[16px] font-['VT323',_monospace] text-[#e8deff] leading-[1.7] whitespace-pre-line min-h-[120px] max-h-[40vh] overflow-y-auto"
            style={{ border: `2px solid ${drawn[revealIdx].col}33` }}
          >
            {isLoading ? (
              <div className="text-center py-5">
                <div className="text-[14px] text-[#c084fc] animate-[loadingPulse_2s_ease-in-out_infinite]">
                  ✦ {loadingMsg} ✦
                </div>
              </div>
            ) : (
              <>
                {streamingText || readings[revealIdx] || ""}
                {!revealDone && <span className="animate-[blink_0.55s_steps(1)_infinite]">▌</span>}
              </>
            )}
          </div>

          {/* Progress dots */}
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

          {/* Next button */}
          {revealDone && (
            <button onClick={nextReveal}
              className="bg-[#7c3aed] text-[#fbbf24] border-[3px] border-[#fbbf24] shadow-[3px_3px_0_#000] py-2.5 px-7 text-[9px] font-inherit cursor-pointer tracking-[0.05em] mt-2 animate-[fadeUp_0.3s_ease_forwards]"
            >
              {revealIdx < drawn.length - 1 ? "▶ 下一张" : "✦ 查看结果"}
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="text-center pt-4">
        <div className="text-[8px] text-[#c084fc] tracking-[0.2em] animate-[blink_3s_steps(1)_infinite]">✦ PIXEL TAROT ✦</div>
        <div className="mt-2.5 flex justify-center"><IconEye className="w-14 h-14 text-[#c084fc]" /></div>
        <div className="text-[12px] text-[#e8deff] mt-2">塔罗</div>
        <div className="text-[7px] text-[#555] mt-1.5">提出问题，寻找答案</div>
      </div>

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

          <PixelBtn onClick={draw} full disabled={!q.trim()}>
            {q.trim() ? `✦ 抽取${drawCount === 1 ? "命运之牌" : "三张牌"} ✦` : "请先输入你的问题"}
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

      {phase === "shuffling" && (
        <div className="flex flex-col items-center gap-4 py-10 w-full">
          <div className="text-[8px] text-[#c084fc] animate-[blink_1s_ease_infinite]">
            ✦ {animPhase === "spread" ? "展开牌组" : animPhase === "gather" ? "收拢牌组" : animPhase === "shuffle" ? "洗牌中" : animPhase === "draw" ? "抽牌中" : "命运已定"} ✦
          </div>

          <div className="relative h-[200px] w-full flex justify-center items-center">
            {deckCards.map(({ idx, spreadX, spreadRot }) => {
              const shufX = ((idx * 41 + 7) % 80) - 40;
              const shufY = ((idx * 29 + 11) % 30) - 15;
              const shufRot = ((idx * 53 + 3) % 30) - 15;
              const delay = idx * 0.05;

              const drawIdx = DECK_COUNT - 1 - idx;
              const isDrawn = animPhase === "draw" && drawnIdx >= drawIdx;
              const isGlowing = animPhase === "glow" && drawnIdx >= drawIdx;

              let x = 0, y = 0, rot = 0, scale = 1;
              let spring = { stiffness: 200, damping: 25 };

              if (animPhase === "spread") { x = spreadX; rot = spreadRot; spring = { stiffness: 180, damping: 18 }; }
              else if (animPhase === "gather") { x = (idx - DECK_COUNT / 2) * 1.5; rot = (idx - DECK_COUNT / 2) * 0.3; spring = { stiffness: 200, damping: 22 }; }
              else if (animPhase === "shuffle") { x = shufX; y = shufY; rot = shufRot; spring = { stiffness: 160, damping: 18 }; }
              else if (animPhase === "draw") {
                if (isDrawn) { const offset = drawIdx * 80 - (drawnIdx) * 40; x = offset; y = -70; scale = 1.15; spring = { stiffness: 120, damping: 14 }; }
                else { x = (idx - DECK_COUNT / 2) * 1.5; rot = (idx - DECK_COUNT / 2) * 0.3; }
              } else if (animPhase === "glow") {
                if (isGlowing) { const offset = drawIdx * 80 - (drawnIdx) * 40; x = offset; y = -70; scale = 1.15; }
                else { x = (idx - DECK_COUNT / 2) * 1.5; rot = (idx - DECK_COUNT / 2) * 0.3; }
              }

              const cardCol = isGlowing && drawn[drawIdx] ? drawn[drawIdx].col : undefined;

              return (
                <motion.div key={idx} animate={{ x, y, rotate: rot, scale }}
                  transition={{ type: "spring", ...spring, delay }}
                  className="absolute w-[72px] h-[106px] flex items-center justify-center text-[20px] text-[#fbbf24]"
                  style={{
                    background: "repeating-conic-gradient(#12122a 0% 25%, #1c1040 0% 50%) 0 0 / 10px 10px",
                    border: `3px solid ${isGlowing && cardCol ? cardCol : isDrawn ? "#c084fc" : "#3d2a6a"}`,
                    boxShadow: isGlowing && cardCol ? `0 0 16px ${cardCol}88, 0 0 32px ${cardCol}44, 3px 3px 0 #000`
                      : isDrawn ? "0 0 12px #c084fc66, 3px 3px 0 #000" : "2px 2px 0 #000",
                    zIndex: isDrawn ? 100 : idx,
                  }}
                >✦</motion.div>
              );
            })}
          </div>

          <div className="flex gap-2">
            {(["spread", "gather", "shuffle", "draw", "glow"] as const).map((p, i) => (
              <div key={i} className="w-2 h-2 transition-colors duration-300"
                style={{ background: animPhase === p ? "#fbbf24" : "#3d3570" }}
              />
            ))}
          </div>
        </div>
      )}

      {phase === "revealed" && drawn.length > 0 && (
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

          {/* Combined reading for 3-card spread */}
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

          <PixelBtn onClick={async () => {
            try {
              await saveReading({
                question: q, draw_count: drawCount,
                cards: drawn.map((c, i) => ({
                  card_id: c.id, card_name: c.name, card_en: c.en, reversed: c.reversed,
                  reading_text: readings[i] || "",
                })),
                combined_reading: combinedReading || undefined,
              });
              alert("已保存到牌案！");
            } catch (e) { console.error(e); alert("保存失败"); }
          }} full disabled={drawCount === 3 && (combinedLoading || !combinedDone)}>
            {drawCount === 3 && combinedLoading ? "✦ 综合解读生成中... ✦" : "✦ 牌案归册 ✦"}
          </PixelBtn>

          <PixelBtn onClick={reset} variant="ghost" full>↩ 再问一次</PixelBtn>
        </div>
      )}
    </div>
  );
}
