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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "16px 16px 100px", position: "relative" }}>
      {/* Sparkles */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 99 }}>
        {sparkles.map(s => (
          <div key={s.id} style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`, width: 8, height: 8, background: s.col, boxShadow: `0 0 6px ${s.col}`, animation: "spkFloat 2.2s ease-out forwards" }} />
        ))}
      </div>

      {/* ── Full-screen reveal modal (3-card) ── */}
      {revealIdx >= 0 && revealIdx < drawn.length && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(5,5,15,0.96)",
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: 24, gap: 16,
          overflowY: "auto",
          animation: "fadeUp 0.4s ease forwards",
        }}>
          {/* Card number label */}
          {drawCount === 3 && (
            <div style={{ fontSize: "8px", color: "#555", letterSpacing: "0.15em" }}>
              ✦ 第 {revealIdx + 1} 张 ✦
            </div>
          )}

          <MiniCard card={drawn[revealIdx]} reversed={drawn[revealIdx].reversed} size="lg" />

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "16px", color: drawn[revealIdx].col, fontFamily: "'VT323', monospace" }}>{drawn[revealIdx].name}</div>
            <div style={{ fontSize: "8px", color: "#7766bb", marginTop: 4 }}>{drawn[revealIdx].en}</div>
            {drawn[revealIdx].reversed && (
              <div style={{ display: "inline-block", marginTop: 6, background: "#1a0a0a", color: "#dc2626", fontSize: "7px", padding: "2px 8px", border: "2px solid #dc2626" }}>逆位</div>
            )}
          </div>

          {/* Reading area with scroll */}
          <div style={{
            maxWidth: 360, width: "100%", padding: 16,
            border: `2px solid ${drawn[revealIdx].col}33`,
            background: "#0a0a1a",
            fontSize: "16px", fontFamily: "'VT323', monospace",
            color: "#e8deff", lineHeight: 1.7, whiteSpace: "pre-line",
            minHeight: 120, maxHeight: "40vh", overflowY: "auto",
          }}>
            {isLoading ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: "14px", color: "#c084fc", animation: "loadingPulse 2s ease-in-out infinite" }}>
                  ✦ {loadingMsg} ✦
                </div>
              </div>
            ) : (
              <>
                {streamingText || readings[revealIdx] || ""}
                {!revealDone && <span style={{ animation: "blink 0.55s steps(1) infinite" }}>▌</span>}
              </>
            )}
          </div>

          {/* Progress dots */}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            {drawn.map((_, i) => (
              <div key={i} style={{
                width: 10, height: 10,
                background: i < revealIdx ? drawn[i].col : i === revealIdx ? "#fbbf24" : "#2a2244",
                border: `2px solid ${i <= revealIdx ? drawn[i].col : "#3d3570"}`,
                transition: "all 0.3s",
              }} />
            ))}
          </div>

          {/* Next button */}
          {revealDone && (
            <button onClick={nextReveal} style={{
              background: "#7c3aed", color: "#fbbf24",
              border: "3px solid #fbbf24", boxShadow: "3px 3px 0 #000",
              padding: "10px 28px", fontSize: "9px", fontFamily: "inherit",
              cursor: "pointer", letterSpacing: "0.05em", marginTop: 8,
              animation: "fadeUp 0.3s ease forwards",
            }}>
              {revealIdx < drawn.length - 1 ? "▶ 下一张" : "✦ 查看结果"}
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: "center", paddingTop: 16 }}>
        <div style={{ fontSize: "8px", color: "#c084fc", letterSpacing: "0.2em", animation: "blink 3s steps(1) infinite" }}>✦ PIXEL TAROT ✦</div>
        <div style={{ marginTop: 10, display: "flex", justifyContent: "center" }}><IconEye style={{ width: 56, height: 56, color: "#c084fc" }} /></div>
        <div style={{ fontSize: "12px", color: "#e8deff", marginTop: 8 }}>塔罗</div>
        <div style={{ fontSize: "7px", color: "#555", marginTop: 6 }}>提出问题，寻找答案</div>
      </div>

      {phase === "idle" && (
        <>
          <Panel label="输入你的问题">
            <textarea value={q} onChange={e => setQ(e.target.value)} placeholder="想问什么……" rows={3}
              style={{ width: "100%", background: "#080812", color: "#e8deff", border: "none", outline: "none", padding: "12px", fontSize: "17px", fontFamily: "'VT323', monospace", resize: "none", lineHeight: 1.5 }} />
          </Panel>

          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            {([1, 3] as const).map(n => (
              <button key={n} onClick={() => setDrawCount(n)} style={{
                flex: 1, padding: "10px 0", background: drawCount === n ? "#7c3aed" : "transparent",
                border: `3px solid ${drawCount === n ? "#fbbf24" : "#3d3570"}`,
                color: drawCount === n ? "#fbbf24" : "#7766bb",
                fontSize: "8px", fontFamily: "inherit", cursor: "pointer",
                boxShadow: drawCount === n ? "3px 3px 0 #000" : "none", letterSpacing: "0.05em",
              }}>{n === 1 ? "✦ 单牌占卜" : "✦ 三牌阵"}</button>
            ))}
          </div>

          <PixelBtn onClick={draw} full disabled={!q.trim()}>
            {q.trim() ? `✦ 抽取${drawCount === 1 ? "命运之牌" : "三张牌"} ✦` : "请先输入你的问题"}
          </PixelBtn>

          <div style={{ position: "relative", height: 150, width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{
                position: "absolute", width: 88, height: 130,
                background: "repeating-conic-gradient(#12122a 0% 25%, #1c1040 0% 50%) 0 0 / 12px 12px",
                border: `3px solid ${i === 4 ? "#7c3aed" : "#3d2a6a"}`,
                boxShadow: i === 4 ? "3px 3px 0 #000, 0 0 24px #7c3aed66" : "none",
                transform: `rotate(${(i - 2) * 3}deg)`, zIndex: i,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: i === 4 ? "28px" : "0", color: "#fbbf24",
              }}>{i === 4 ? "✦" : ""}</div>
            ))}
          </div>
          <div style={{ fontSize: "7px", color: "#3d3570", marginTop: -8 }}>22张大阿卡纳 · 随机抽取</div>
        </>
      )}

      {phase === "shuffling" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "40px 0", width: "100%" }}>
          <div style={{ fontSize: "8px", color: "#c084fc", animation: "blink 1s ease infinite" }}>
            ✦ {animPhase === "spread" ? "展开牌组" : animPhase === "gather" ? "收拢牌组" : animPhase === "shuffle" ? "洗牌中" : animPhase === "draw" ? "抽牌中" : "命运已定"} ✦
          </div>

          <div style={{ position: "relative", height: 200, width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
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
                  style={{
                    position: "absolute", width: 72, height: 106,
                    background: "repeating-conic-gradient(#12122a 0% 25%, #1c1040 0% 50%) 0 0 / 10px 10px",
                    border: `3px solid ${isGlowing && cardCol ? cardCol : isDrawn ? "#c084fc" : "#3d2a6a"}`,
                    boxShadow: isGlowing && cardCol ? `0 0 16px ${cardCol}88, 0 0 32px ${cardCol}44, 3px 3px 0 #000`
                      : isDrawn ? "0 0 12px #c084fc66, 3px 3px 0 #000" : "2px 2px 0 #000",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "20px", color: "#fbbf24", zIndex: isDrawn ? 100 : idx,
                  }}>✦</motion.div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {(["spread", "gather", "shuffle", "draw", "glow"] as const).map((p, i) => (
              <div key={i} style={{ width: 8, height: 8, background: animPhase === p ? "#fbbf24" : "#3d3570", transition: "background 0.3s" }} />
            ))}
          </div>
        </div>
      )}

      {phase === "revealed" && drawn.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, width: "100%", animation: "fadeUp 0.4s ease forwards" }}>
          <div style={{ fontSize: "8px", color: "#fbbf24", animation: "blink 2s steps(1) infinite" }}>✦ 命运之牌揭晓 ✦</div>

          <div style={{ maxWidth: 340, width: "100%", padding: "10px 14px", background: "#12122a", border: "2px solid #3d3570" }}>
            <div style={{ fontSize: "7px", color: "#555", marginBottom: 4 }}>你的问题</div>
            <div style={{ fontSize: "16px", fontFamily: "'VT323', monospace", color: "#e8deff", lineHeight: 1.5 }}>{q}</div>
          </div>

          {drawn.map((card, idx) => (
            <div key={card.id + "-" + idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: "100%", animation: `fadeUp 0.4s ease ${idx * 0.15}s both` }}>
              {drawCount === 3 && (
                <div style={{ fontSize: "7px", color: "#555", letterSpacing: "0.1em" }}>✦ 第 {idx + 1} 张 ✦</div>
              )}
              <MiniCard card={card} reversed={card.reversed} size="lg" />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "14px", color: card.col }}>{card.name}</div>
                <div style={{ fontSize: "7px", color: "#7766bb", marginTop: 4 }}>{card.en}</div>
                {card.reversed && (
                  <div style={{ display: "inline-block", marginTop: 6, background: "#1a0a0a", color: "#dc2626", fontSize: "7px", padding: "2px 8px", border: "2px solid #dc2626" }}>逆位</div>
                )}
              </div>
              <Panel label={drawCount === 3 ? `解读 · 第${idx + 1}张` : "塔罗解读"} color={card.col}>
                <div style={{ padding: 14, fontSize: "17px", fontFamily: "'VT323', monospace", color: "#e8deff", lineHeight: 1.7, whiteSpace: "pre-line", minHeight: 60 }}>
                  {readings[idx] || "等待解读..."}
                </div>
              </Panel>
            </div>
          ))}

          {/* Combined reading for 3-card spread */}
          {drawCount === 3 && (
            <Panel label="✦ 综合解读" color="#fbbf24">
              <div style={{ padding: 14, fontSize: "16px", fontFamily: "'VT323', monospace", color: "#e8deff", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                {combinedLoading ? (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "14px", color: "#c084fc", animation: "loadingPulse 2s ease-in-out infinite" }}>
                      ✦ {loadingMsg} ✦
                    </div>
                  </div>
                ) : (
                  <>
                    {combinedReading || "综合解读生成中..."}
                    {!combinedDone && combinedReading && <span style={{ animation: "blink 0.55s steps(1) infinite" }}>▌</span>}
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
