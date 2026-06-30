import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { TCard, DrawnCard } from "../types";
import { CARDS } from "../data";
import { DECK_COUNT } from "../constants";
import { genReading } from "../utils";
import { MiniCard } from "../components/ui/MiniCard";
import { Panel } from "../components/ui/Panel";
import { PixelBtn } from "../components/ui/PixelBtn";
import { Eye as IconEye } from "pixelarticons/react";

export function DrawSection() {
  const [q, setQ] = useState("");
  const [drawCount, setDrawCount] = useState<1 | 3>(1);
  const [phase, setPhase] = useState<"idle" | "shuffling" | "revealed">("idle");
  const [animPhase, setAnimPhase] = useState<"spread" | "gather" | "shuffle" | "draw" | "glow" | null>(null);
  const [drawn, setDrawn] = useState<DrawnCard[]>([]);
  const [drawnIdx, setDrawnIdx] = useState(-1); // how many cards drawn so far
  const [readings, setReadings] = useState<string[]>([]);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; col: string }[]>([]);

  // Modal reveal state
  const [revealIdx, setRevealIdx] = useState(-1);
  const [revealText, setRevealText] = useState("");
  const [revealDone, setRevealDone] = useState(false);

  const POSITIONS = ["过去", "现在", "未来"];

  const draw = () => {
    if (!q.trim() || phase !== "idle") return;
    setPhase("shuffling");
    setAnimPhase("spread");
    setDrawn([]);
    setDrawnIdx(-1);
    setReadings([]);
    setRevealIdx(-1);
    setRevealText("");
    setRevealDone(false);

    // Pre-pick the cards
    const picked: DrawnCard[] = [];
    const available = [...CARDS];
    for (let i = 0; i < drawCount; i++) {
      const idx = Math.floor(Math.random() * available.length);
      const card = available.splice(idx, 1)[0];
      picked.push({ ...card, reversed: Math.random() > 0.72 });
    }
    setDrawn(picked);
    setReadings(picked.map(c => genReading(c, c.reversed)));

    const palette = ["#fbbf24", "#c084fc", "#60a5fa", "#f43f5e", "#34d399", "#a3e635"];
    setSparkles(Array.from({ length: 18 }, (_, i) => ({
      id: Date.now() + i,
      x: 5 + Math.random() * 90, y: 5 + Math.random() * 90,
      col: palette[Math.floor(Math.random() * palette.length)],
    })));
    setTimeout(() => setSparkles([]), 5000);

    // 5-phase animation: spread → gather → shuffle → draw → glow
    setTimeout(() => setAnimPhase("gather"), 1000);
    setTimeout(() => setAnimPhase("shuffle"), 1800);
    // Draw cards one by one
    setTimeout(() => {
      setAnimPhase("draw");
      setDrawnIdx(0);
    }, 3200);
    if (drawCount >= 2) setTimeout(() => setDrawnIdx(1), 3900);
    if (drawCount >= 3) setTimeout(() => setDrawnIdx(2), 4600);
    // Glow phase
    setTimeout(() => setAnimPhase("glow"), 3200 + drawCount * 700);
    // Open modal (3-card) or go directly to result (1-card)
    setTimeout(() => {
      setAnimPhase(null);
      if (drawCount === 3) {
        setRevealIdx(0);
      } else {
        setPhase("revealed");
      }
    }, 4200 + drawCount * 700);
  };

  // Typewriter effect in modal — sequential per card
  useEffect(() => {
    if (revealIdx < 0 || revealIdx >= drawn.length) return;
    const full = readings[revealIdx];
    if (!full) return;
    let i = 0;
    setRevealText("");
    setRevealDone(false);
    const t = setInterval(() => {
      if (i < full.length) {
        setRevealText(full.slice(0, ++i));
      } else {
        clearInterval(t);
        setRevealDone(true);
      }
    }, 28);
    return () => clearInterval(t);
  }, [revealIdx, readings, drawn.length]);

  // Advance to next card or close modal
  const nextReveal = () => {
    if (revealIdx < drawn.length - 1) {
      setRevealIdx(revealIdx + 1);
    } else {
      setRevealIdx(-1);
      setPhase("revealed");
    }
  };

  const reset = () => {
    setPhase("idle"); setAnimPhase(null); setDrawn([]); setQ("");
    setReadings([]); setRevealIdx(-1); setRevealText(""); setRevealDone(false);
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

      {/* ── Full-screen reveal modal ── */}
      {revealIdx >= 0 && revealIdx < drawn.length && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(5,5,15,0.96)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: 24, gap: 16,
          animation: "fadeUp 0.4s ease forwards",
        }}>
          {/* Position label */}
          {drawCount === 3 && (
            <div style={{ fontSize: "8px", color: "#555", letterSpacing: "0.15em" }}>
              ✦ {POSITIONS[revealIdx]} ✦
            </div>
          )}

          {/* Card image */}
          <MiniCard card={drawn[revealIdx]} reversed={drawn[revealIdx].reversed} size="lg" />

          {/* Card info */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "16px", color: drawn[revealIdx].col, fontFamily: "'VT323', monospace" }}>{drawn[revealIdx].name}</div>
            <div style={{ fontSize: "8px", color: "#7766bb", marginTop: 4 }}>{drawn[revealIdx].en}</div>
            {drawn[revealIdx].reversed && (
              <div style={{ display: "inline-block", marginTop: 6, background: "#1a0a0a", color: "#dc2626", fontSize: "7px", padding: "2px 8px", border: "2px solid #dc2626" }}>逆位</div>
            )}
          </div>

          {/* Reading with typewriter */}
          <div style={{
            maxWidth: 360, width: "100%", padding: 16,
            border: `2px solid ${drawn[revealIdx].col}33`,
            background: "#0a0a1a",
            fontSize: "16px", fontFamily: "'VT323', monospace",
            color: "#e8deff", lineHeight: 1.7, whiteSpace: "pre-line",
            minHeight: 100,
          }}>
            {revealText}
            {!revealDone && <span style={{ animation: "blink 0.55s steps(1) infinite" }}>▌</span>}
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

          {/* Next button — only after typing finishes */}
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

              // Check if this card is one of the drawn cards
              const drawIdx = DECK_COUNT - 1 - idx; // 0 = top, 1 = second, 2 = third
              const isDrawn = animPhase === "draw" && drawnIdx >= drawIdx;
              const isGlowing = animPhase === "glow" && drawnIdx >= drawIdx;

              let x = 0, y = 0, rot = 0, scale = 1;
              let spring = { stiffness: 200, damping: 25 };

              if (animPhase === "spread") {
                x = spreadX;
                rot = spreadRot;
                spring = { stiffness: 180, damping: 18 };
              } else if (animPhase === "gather") {
                // Return to stack with slight offset
                x = (idx - DECK_COUNT / 2) * 1.5;
                rot = (idx - DECK_COUNT / 2) * 0.3;
                spring = { stiffness: 200, damping: 22 };
              } else if (animPhase === "shuffle") {
                // Each card moves to a random position
                x = shufX;
                y = shufY;
                rot = shufRot;
                spring = { stiffness: 160, damping: 18 };
              } else if (animPhase === "draw") {
                if (isDrawn) {
                  // Drawn card flies up and to the side
                  const offset = drawIdx * 80 - (drawnIdx) * 40;
                  x = offset;
                  y = -70;
                  scale = 1.15;
                  spring = { stiffness: 120, damping: 14 };
                } else {
                  // Remaining cards stay in stack
                  x = (idx - DECK_COUNT / 2) * 1.5;
                  rot = (idx - DECK_COUNT / 2) * 0.3;
                }
              } else if (animPhase === "glow") {
                if (isGlowing) {
                  const offset = drawIdx * 80 - (drawnIdx) * 40;
                  x = offset;
                  y = -70;
                  scale = 1.15;
                } else {
                  x = (idx - DECK_COUNT / 2) * 1.5;
                  rot = (idx - DECK_COUNT / 2) * 0.3;
                }
              }

              const cardCol = isGlowing && drawn[drawIdx] ? drawn[drawIdx].col : undefined;

              return (
                <motion.div
                  key={idx}
                  animate={{ x, y, rotate: rot, scale }}
                  transition={{ type: "spring", ...spring, delay }}
                  style={{
                    position: "absolute", width: 72, height: 106,
                    background: "repeating-conic-gradient(#12122a 0% 25%, #1c1040 0% 50%) 0 0 / 10px 10px",
                    border: `3px solid ${isGlowing && cardCol ? cardCol : isDrawn ? "#c084fc" : "#3d2a6a"}`,
                    boxShadow: isGlowing && cardCol
                      ? `0 0 16px ${cardCol}88, 0 0 32px ${cardCol}44, 3px 3px 0 #000`
                      : isDrawn
                        ? "0 0 12px #c084fc66, 3px 3px 0 #000"
                        : "2px 2px 0 #000",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "20px", color: "#fbbf24",
                    zIndex: isDrawn ? 100 : idx,
                  }}
                >✦</motion.div>
              );
            })}
          </div>

          {/* Progress dots */}
          <div style={{ display: "flex", gap: 8 }}>
            {(["spread", "gather", "shuffle", "draw", "glow"] as const).map((p, i) => (
              <div key={i} style={{
                width: 8, height: 8,
                background: animPhase === p ? "#fbbf24" : "#3d3570",
                transition: "background 0.3s",
              }} />
            ))}
          </div>
        </div>
      )}

      {phase === "revealed" && drawn.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, width: "100%", animation: "fadeUp 0.4s ease forwards" }}>
          <div style={{ fontSize: "8px", color: "#fbbf24", animation: "blink 2s steps(1) infinite" }}>✦ 命运之牌揭晓 ✦</div>

          {/* Show the question */}
          <div style={{ maxWidth: 340, width: "100%", padding: "10px 14px", background: "#12122a", border: "2px solid #3d3570" }}>
            <div style={{ fontSize: "7px", color: "#555", marginBottom: 4 }}>你的问题</div>
            <div style={{ fontSize: "16px", fontFamily: "'VT323', monospace", color: "#e8deff", lineHeight: 1.5 }}>{q}</div>
          </div>

          {drawn.map((card, idx) => (
            <div key={card.id + "-" + idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: "100%", animation: `fadeUp 0.4s ease ${idx * 0.15}s both` }}>
              {drawCount === 3 && (
                <div style={{ fontSize: "7px", color: "#555", letterSpacing: "0.1em" }}>✦ {POSITIONS[idx]} ✦</div>
              )}
              <MiniCard card={card} reversed={card.reversed} size="lg" />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "14px", color: card.col }}>{card.name}</div>
                <div style={{ fontSize: "7px", color: "#7766bb", marginTop: 4 }}>{card.en}</div>
                {card.reversed && (
                  <div style={{ display: "inline-block", marginTop: 6, background: "#1a0a0a", color: "#dc2626", fontSize: "7px", padding: "2px 8px", border: "2px solid #dc2626" }}>逆位</div>
                )}
              </div>
              <Panel label={drawCount === 3 ? `解读 · ${POSITIONS[idx]}` : "塔罗解读"} color={card.col}>
                <div style={{ padding: 14, fontSize: "17px", fontFamily: "'VT323', monospace", color: "#e8deff", lineHeight: 1.7, whiteSpace: "pre-line", minHeight: 60 }}>
                  {readings[idx]}
                </div>
              </Panel>
            </div>
          ))}

          {drawCount === 3 && (
            <Panel label="✦ 综合解读" color="#fbbf24">
              <div style={{ padding: 14, fontSize: "16px", fontFamily: "'VT323', monospace", color: "#e8deff", lineHeight: 1.7 }}>
                三张牌共同揭示了你问题的全貌。
                <span style={{ color: drawn[0].col }}>{drawn[0].name}</span>代表过去的根基，
                <span style={{ color: drawn[1].col }}>{drawn[1].name}</span>揭示当下的能量，
                <span style={{ color: drawn[2].col }}>{drawn[2].name}</span>指向未来的方向。
                <br /><br />
                ✦ 信任这个过程，答案已经在你心中。
              </div>
            </Panel>
          )}

          <PixelBtn onClick={() => {
            // TODO: 接入 API，将数据存入数据库
            const record = {
              question: q,
              cards: drawn.map((c, i) => ({ name: c.name, en: c.en, reversed: c.reversed, position: drawCount === 3 ? POSITIONS[i] : undefined })),
              readings,
              drawCount,
              timestamp: new Date().toISOString(),
            };
            console.log("牌案归册:", record);
          }} full>✦ 牌案归册 ✦</PixelBtn>

          <PixelBtn onClick={reset} variant="ghost" full>↩ 再问一次</PixelBtn>
        </div>
      )}
    </div>
  );
}
