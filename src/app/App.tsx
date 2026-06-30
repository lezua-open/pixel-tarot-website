import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ── Types ──────────────────────────────────────────────────────────────────────
type TCard = {
  id: number; name: string; en: string; emoji: string;
  light: string; dark: string; energy: "light" | "neutral" | "dark"; col: string;
};
type DrawnCard = TCard & { reversed: boolean };

// ── Data ───────────────────────────────────────────────────────────────────────
const CARDS: TCard[] = [
  { id: 0, name: "愚者", en: "THE FOOL", emoji: "🃏", light: "新的开始与冒险", dark: "鲁莽与缺乏方向", energy: "light", col: "#fbbf24" },
  { id: 1, name: "魔术师", en: "THE MAGICIAN", emoji: "🎩", light: "意志力与创造", dark: "操纵与欺骗", energy: "light", col: "#a855f7" },
  { id: 2, name: "女祭司", en: "HIGH PRIESTESS", emoji: "🌙", light: "直觉与神秘智慧", dark: "隐藏的秘密", energy: "neutral", col: "#60a5fa" },
  { id: 3, name: "女皇", en: "THE EMPRESS", emoji: "🌸", light: "丰盛与创造力", dark: "依赖与过度", energy: "light", col: "#f472b6" },
  { id: 4, name: "皇帝", en: "THE EMPEROR", emoji: "👑", light: "权威与稳定", dark: "专制与僵化", energy: "light", col: "#f59e0b" },
  { id: 5, name: "教皇", en: "THE HIEROPHANT", emoji: "⛪", light: "传统与精神指引", dark: "教条与保守", energy: "neutral", col: "#818cf8" },
  { id: 6, name: "恋人", en: "THE LOVERS", emoji: "💕", light: "爱情与深层联结", dark: "冲突与选择困难", energy: "light", col: "#f43f5e" },
  { id: 7, name: "战车", en: "THE CHARIOT", emoji: "⚔️", light: "胜利与掌控", dark: "失控与侵略", energy: "light", col: "#06b6d4" },
  { id: 8, name: "力量", en: "STRENGTH", emoji: "🦁", light: "内在力量与耐心", dark: "软弱与自我怀疑", energy: "light", col: "#f59e0b" },
  { id: 9, name: "隐者", en: "THE HERMIT", emoji: "🏮", light: "内省与智慧", dark: "孤立与封闭", energy: "neutral", col: "#94a3b8" },
  { id: 10, name: "命运之轮", en: "WHEEL OF FORTUNE", emoji: "🎡", light: "好运与转机", dark: "厄运与阻力", energy: "neutral", col: "#8b5cf6" },
  { id: 11, name: "正义", en: "JUSTICE", emoji: "⚖️", light: "公正与真相", dark: "不公与逃避", energy: "neutral", col: "#6366f1" },
  { id: 12, name: "倒吊人", en: "THE HANGED MAN", emoji: "🙃", light: "暂停与新视角", dark: "固执与拖延", energy: "neutral", col: "#22c55e" },
  { id: 13, name: "死神", en: "DEATH", emoji: "💀", light: "转变与重生", dark: "抗拒改变", energy: "dark", col: "#64748b" },
  { id: 14, name: "节制", en: "TEMPERANCE", emoji: "⚗️", light: "平衡与调和", dark: "过度与失衡", energy: "light", col: "#14b8a6" },
  { id: 15, name: "恶魔", en: "THE DEVIL", emoji: "😈", light: "看见束缚", dark: "沉溺与上瘾", energy: "dark", col: "#dc2626" },
  { id: 16, name: "塔", en: "THE TOWER", emoji: "⚡", light: "突破与启示", dark: "崩溃与混乱", energy: "dark", col: "#f97316" },
  { id: 17, name: "星星", en: "THE STAR", emoji: "⭐", light: "希望与灵感", dark: "绝望与失去方向", energy: "light", col: "#a3e635" },
  { id: 18, name: "月亮", en: "THE MOON", emoji: "🌕", light: "直觉与潜意识", dark: "恐惧与幻觉", energy: "dark", col: "#c084fc" },
  { id: 19, name: "太阳", en: "THE SUN", emoji: "☀️", light: "喜悦与成功", dark: "过度乐观", energy: "light", col: "#fbbf24" },
  { id: 20, name: "审判", en: "JUDGEMENT", emoji: "📯", light: "觉醒与重生", dark: "自我怀疑与错判", energy: "light", col: "#f0abfc" },
  { id: 21, name: "世界", en: "THE WORLD", emoji: "🌍", light: "完成与整合", dark: "未完成与停滞", energy: "light", col: "#34d399" },
];

const WEEKLY = [
  { day: "MON", date: "6/24", card: CARDS[17], q: "今天适合开始新项目吗？", reversed: false },
  { day: "TUE", date: "6/25", card: CARDS[6], q: "感情方面有什么需要注意？", reversed: false },
  { day: "WED", date: "6/26", card: CARDS[12], q: "该继续等待还是主动出击？", reversed: true },
  { day: "THU", date: "6/27", card: CARDS[7], q: "谈判能获得好结果吗？", reversed: false },
  { day: "FRI", date: "6/28", card: CARDS[10], q: "本周财运如何？", reversed: false },
  { day: "SAT", date: "6/29", card: CARDS[16], q: "突变该如何应对？", reversed: false },
  { day: "SUN", date: "6/30", card: CARDS[18], q: "如何从迷茫中走出？", reversed: true },
];

const TREND_DATA = [
  { name: "星星", count: 12, col: "#a3e635", emoji: "⭐" },
  { name: "太阳", count: 9, col: "#fbbf24", emoji: "☀️" },
  { name: "恋人", count: 8, col: "#f43f5e", emoji: "💕" },
  { name: "战车", count: 7, col: "#06b6d4", emoji: "⚔️" },
  { name: "月亮", count: 6, col: "#c084fc", emoji: "🌕" },
  { name: "正义", count: 5, col: "#6366f1", emoji: "⚖️" },
  { name: "死神", count: 4, col: "#64748b", emoji: "💀" },
];

const PLAZA = [
  { id: 1, user: "PIXEL_WITCH", q: "撑了三年了，该换工作吗？", card: CARDS[16], reversed: false, likes: 42, time: "2H AGO" },
  { id: 2, user: "MOON_RIDER", q: "他还会回来吗", card: CARDS[18], reversed: true, likes: 38, time: "3H AGO" },
  { id: 3, user: "STAR_SEEKER", q: "创业的时机到了吗？", card: CARDS[1], reversed: false, likes: 31, time: "5H AGO" },
  { id: 4, user: "TAROT_CAT", q: "这段友谊还值得维持吗？", card: CARDS[11], reversed: false, likes: 27, time: "6H AGO" },
  { id: 5, user: "VOID_MAGE", q: "什么时候能遇到真正适合的人？", card: CARDS[6], reversed: false, likes: 89, time: "8H AGO" },
  { id: 6, user: "CRYSTAL_FOX", q: "今年考研能过吗？", card: CARDS[8], reversed: false, likes: 24, time: "12H AGO" },
  { id: 7, user: "NEON_SEER", q: "要不要接受那个offer？", card: CARDS[7], reversed: false, likes: 19, time: "1D AGO" },
];

const READING_TEMPLATES = [
  "命运之轮已转动。{CARD}现身于你的问题之前。\n\n【{POS} · {ASPECT}】\n\n此刻宇宙低语：{ASPECT}。不必强求，顺势而为。你已拥有所需的一切力量，只是尚未察觉。\n\n✦ 行动建议：静下心来，听从内心最深处的那个声音。",
  "星辰已为你校准方向。{CARD}带来了宇宙的答案。\n\n【{POS} · {ASPECT}】\n\n这张牌揭示的能量是{ASPECT}。接受它，与之共舞，而非对抗。\n\n✦ 行动建议：不必急于求成，时机到来时一切自然显现。",
  "神秘之门已为你开启。{CARD}向你低声述说。\n\n【{POS} · {ASPECT}】\n\n宇宙的信息清晰而坚定：{ASPECT}。在混沌之中寻找秩序，在黑暗之中寻找那一点光。\n\n✦ 行动建议：信任你的直觉，它比任何逻辑都更接近真相。",
];

function genReading(card: TCard, reversed: boolean): string {
  const t = READING_TEMPLATES[Math.floor(Math.random() * READING_TEMPLATES.length)];
  return t
    .replace(/{CARD}/g, card.name)
    .replace(/{POS}/g, reversed ? "逆位" : "正位")
    .replace(/{ASPECT}/g, reversed ? card.dark : card.light);
}

// ── Shared components ──────────────────────────────────────────────────────────
function MiniCard({ card, reversed, size = "md" }: { card: TCard; reversed: boolean; size?: "sm" | "md" | "lg" }) {
  const w = size === "sm" ? 52 : size === "lg" ? 110 : 72;
  const h = size === "sm" ? 78 : size === "lg" ? 165 : 108;
  const emojiSize = size === "sm" ? "1.4rem" : size === "lg" ? "3.2rem" : "2rem";
  const nameSize = size === "sm" ? "5px" : size === "lg" ? "9px" : "6px";
  return (
    <div style={{
      width: w, height: h,
      border: `3px solid ${card.col}`,
      boxShadow: `3px 3px 0 #000, 0 0 14px ${card.col}55`,
      background: "#0a0a1a",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
      transform: reversed ? "rotate(180deg)" : undefined,
      flexShrink: 0, position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.14) 3px, rgba(0,0,0,0.14) 4px)", pointerEvents: "none" }} />
      <span style={{ fontSize: emojiSize, lineHeight: 1 }}>{card.emoji}</span>
      <span style={{ fontSize: nameSize, color: card.col, textAlign: "center", padding: "0 4px", lineHeight: 1.3, fontFamily: "inherit" }}>{card.name}</span>
    </div>
  );
}

function CardBack() {
  return (
    <div style={{
      width: 88, height: 130,
      background: "repeating-conic-gradient(#12122a 0% 25%, #1c1040 0% 50%) 0 0 / 12px 12px",
      border: "3px solid #7c3aed",
      boxShadow: "3px 3px 0 #000, 0 0 20px #7c3aed66",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "28px", color: "#fbbf24",
    }}>✦</div>
  );
}

function Panel({ children, label, color = "#3d3570" }: { children: ReactNode; label?: string; color?: string }) {
  return (
    <div style={{ border: `3px solid ${color}`, boxShadow: "4px 4px 0 #000", background: "#0a0a1a", width: "100%" }}>
      {label && (
        <div style={{ padding: "6px 12px", background: "#12122a", borderBottom: `2px solid ${color}` }}>
          <span style={{ fontSize: "8px", color: "#c084fc" }}>▶ {label}</span>
        </div>
      )}
      {children}
    </div>
  );
}

function PixelBtn({ children, onClick, variant = "primary", full = false, disabled = false }: {
  children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost"; full?: boolean; disabled?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  const active = !disabled && pressed;
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onPointerDown={() => !disabled && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        background: variant === "primary" ? (disabled ? "#2a2244" : "#7c3aed") : "transparent",
        color: variant === "primary" ? (disabled ? "#554477" : "#fbbf24") : "#7766bb",
        border: `3px solid ${variant === "primary" ? (disabled ? "#3d2a6a" : "#fbbf24") : "#3d3570"}`,
        boxShadow: active ? "none" : "4px 4px 0 #000",
        transform: active ? "translate(4px,4px)" : undefined,
        padding: "11px 20px",
        fontSize: "9px",
        fontFamily: "inherit",
        cursor: disabled ? "not-allowed" : "pointer",
        width: full ? "100%" : undefined,
        transition: "box-shadow 0.05s, transform 0.05s",
        letterSpacing: "0.05em",
      }}
    >{children}</button>
  );
}

// ── Global animations ──────────────────────────────────────────────────────────
const GLOBAL_STYLES = `
  @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spkFloat { 0% { transform: scale(1); opacity: 1; } 100% { transform: translateY(-90px) scale(0); opacity: 0; } }
  @keyframes pulse { 0%,100% { box-shadow: 0 0 8px currentColor; } 50% { box-shadow: 0 0 24px currentColor; } }
  textarea::placeholder { color: #3d3570; font-family: 'VT323', monospace; font-size: 16px; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: #0a0a1a; }
  ::-webkit-scrollbar-thumb { background: #3d3570; border: 1px solid #000; }
  * { box-sizing: border-box; }
`;

// ── Draw Section ───────────────────────────────────────────────────────────────
function DrawSection() {
  const [q, setQ] = useState("");
  const [phase, setPhase] = useState<"idle" | "shuffling" | "revealed">("idle");
  const [drawn, setDrawn] = useState<DrawnCard | null>(null);
  const [fullReading, setFullReading] = useState("");
  const [shownReading, setShownReading] = useState("");
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; col: string }[]>([]);

  const draw = () => {
    if (!q.trim() || phase !== "idle") return;
    setPhase("shuffling");
    setDrawn(null);
    setShownReading("");
    const palette = ["#fbbf24", "#c084fc", "#60a5fa", "#f43f5e", "#34d399", "#a3e635"];
    setSparkles(Array.from({ length: 14 }, (_, i) => ({
      id: Date.now() + i,
      x: 5 + Math.random() * 90,
      y: 5 + Math.random() * 90,
      col: palette[Math.floor(Math.random() * palette.length)],
    })));
    setTimeout(() => setSparkles([]), 2500);
    setTimeout(() => {
      const card = CARDS[Math.floor(Math.random() * CARDS.length)];
      const reversed = Math.random() > 0.72;
      setDrawn({ ...card, reversed });
      setFullReading(genReading(card, reversed));
      setPhase("revealed");
    }, 1900);
  };

  useEffect(() => {
    if (phase !== "revealed" || !fullReading) return;
    let i = 0;
    setShownReading("");
    const t = setInterval(() => {
      if (i < fullReading.length) { setShownReading(fullReading.slice(0, ++i)); }
      else clearInterval(t);
    }, 20);
    return () => clearInterval(t);
  }, [fullReading, phase]);

  const reset = () => { setPhase("idle"); setDrawn(null); setQ(""); setShownReading(""); setFullReading(""); };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "16px 16px 100px", position: "relative" }}>
      {/* Sparkles */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 99 }}>
        {sparkles.map(s => (
          <div key={s.id} style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`, width: 8, height: 8, background: s.col, boxShadow: `0 0 6px ${s.col}`, animation: "spkFloat 2.2s ease-out forwards" }} />
        ))}
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", paddingTop: 16 }}>
        <div style={{ fontSize: "8px", color: "#c084fc", letterSpacing: "0.2em", animation: "blink 3s steps(1) infinite" }}>✦ PIXEL TAROT ✦</div>
        <div style={{ fontSize: "32px", marginTop: 10 }}>🔮</div>
        <div style={{ fontSize: "12px", color: "#e8deff", marginTop: 8 }}>神秘占卜</div>
        <div style={{ fontSize: "7px", color: "#555", marginTop: 6 }}>提出问题，聆听宇宙的回答</div>
      </div>

      {phase === "idle" && (
        <>
          <Panel label="输入你的问题">
            <textarea
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="你想问宇宙什么……"
              rows={3}
              style={{ width: "100%", background: "#080812", color: "#e8deff", border: "none", outline: "none", padding: "12px", fontSize: "17px", fontFamily: "'VT323', monospace", resize: "none", lineHeight: 1.5 }}
            />
          </Panel>

          <PixelBtn onClick={draw} full disabled={!q.trim()}>
            {q.trim() ? "✦ 抽取命运之牌 ✦" : "请先输入你的问题"}
          </PixelBtn>

          {/* Deck */}
          <div style={{ position: "relative", height: 150, width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{
                position: "absolute",
                width: 88, height: 130,
                background: "repeating-conic-gradient(#12122a 0% 25%, #1c1040 0% 50%) 0 0 / 12px 12px",
                border: `3px solid ${i === 4 ? "#7c3aed" : "#3d2a6a"}`,
                boxShadow: i === 4 ? "3px 3px 0 #000, 0 0 24px #7c3aed66" : "none",
                transform: `rotate(${(i - 2) * 3}deg)`,
                zIndex: i,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: i === 4 ? "28px" : "0",
                color: "#fbbf24",
              }}>{i === 4 ? "✦" : ""}</div>
            ))}
          </div>
          <div style={{ fontSize: "7px", color: "#3d3570", marginTop: -8 }}>22张大阿卡纳 · 随机抽取</div>
        </>
      )}

      {phase === "shuffling" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: "60px 0" }}>
          <div style={{ fontSize: "8px", color: "#c084fc", animation: "blink 0.4s steps(1) infinite" }}>✦ 宇宙正在回应 ✦</div>
          <div style={{ fontSize: "52px", animation: "spin 0.7s steps(8) infinite" }}>🔮</div>
          <div style={{ display: "flex", gap: 8 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ width: 8, height: 8, background: "#7c3aed", animation: `blink 0.5s steps(1) ${i * 0.1}s infinite` }} />
            ))}
          </div>
          <div style={{ fontSize: "8px", color: "#3d3570" }}>洗牌中……</div>
        </div>
      )}

      {phase === "revealed" && drawn && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, width: "100%", animation: "fadeUp 0.4s ease forwards" }}>
          <div style={{ fontSize: "8px", color: "#fbbf24", animation: "blink 2s steps(1) infinite" }}>✦ 命运之牌揭晓 ✦</div>

          <MiniCard card={drawn} reversed={drawn.reversed} size="lg" />

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "14px", color: drawn.col }}>{drawn.name}</div>
            <div style={{ fontSize: "7px", color: "#7766bb", marginTop: 4 }}>{drawn.en}</div>
            {drawn.reversed && (
              <div style={{ display: "inline-block", marginTop: 6, background: "#1a0a0a", color: "#dc2626", fontSize: "7px", padding: "2px 8px", border: "2px solid #dc2626" }}>
                逆位
              </div>
            )}
          </div>

          <Panel label="塔罗解读" color={drawn.col}>
            <div style={{ padding: 14, fontSize: "17px", fontFamily: "'VT323', monospace", color: "#e8deff", lineHeight: 1.7, whiteSpace: "pre-line", minHeight: 120 }}>
              {shownReading}
              {shownReading.length < fullReading.length && (
                <span style={{ animation: "blink 0.55s steps(1) infinite" }}>▌</span>
              )}
            </div>
          </Panel>

          <PixelBtn onClick={reset} variant="ghost" full>↩ 再问一次</PixelBtn>
        </div>
      )}
    </div>
  );
}

// ── Weekly Section ─────────────────────────────────────────────────────────────
function WeeklySection() {
  const [selected, setSelected] = useState(WEEKLY[6]);

  const energyCounts = WEEKLY.reduce((acc, d) => {
    const key = d.reversed ? "dark" : d.card.energy;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const energyConfig: Record<string, { col: string; label: string }> = {
    light: { col: "#a3e635", label: "光明" },
    neutral: { col: "#c084fc", label: "中性" },
    dark: { col: "#dc2626", label: "阴影" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "16px 16px 100px" }}>
      <div style={{ textAlign: "center", paddingTop: 16 }}>
        <div style={{ fontSize: "8px", color: "#c084fc", letterSpacing: "0.15em" }}>✦ WEEKLY LOG ✦</div>
        <div style={{ fontSize: "12px", color: "#e8deff", marginTop: 8 }}>近七日问题总结</div>
      </div>

      {/* Day strip */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
        {WEEKLY.map((day) => {
          const isSel = selected.day === day.day;
          const isToday = day.day === "SUN";
          return (
            <button key={day.day} onClick={() => setSelected(day)} style={{
              flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
              padding: "10px 8px", minWidth: 58,
              background: isSel ? "#1e1a3a" : "#0a0a1a",
              border: `3px solid ${isSel ? day.card.col : "#2a2244"}`,
              boxShadow: isSel ? `3px 3px 0 #000, 0 0 16px ${day.card.col}44` : "2px 2px 0 #000",
              cursor: "pointer", fontFamily: "inherit",
            }}>
              <span style={{ fontSize: "6px", color: isToday ? "#fbbf24" : "#7766bb" }}>{isToday ? "★" : ""}{day.day}</span>
              <span style={{ fontSize: "5px", color: "#555" }}>{day.date}</span>
              <span style={{ fontSize: "22px" }}>{day.card.emoji}</span>
              {day.reversed && <span style={{ fontSize: "5px", color: "#dc2626", border: "1px solid #dc2626", padding: "1px 3px" }}>逆</span>}
            </button>
          );
        })}
      </div>

      {/* Selected detail */}
      <Panel label={`${selected.day} · ${selected.date}`} color={selected.card.col}>
        <div style={{ padding: 14, display: "flex", gap: 14, alignItems: "flex-start" }}>
          <MiniCard card={selected.card} reversed={selected.reversed} size="md" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "16px", fontFamily: "'VT323', monospace", color: "#e8deff", marginBottom: 10, lineHeight: 1.5 }}>
              "{selected.q}"
            </div>
            <div style={{ fontSize: "11px", fontFamily: "'VT323', monospace", color: selected.card.col }}>
              {selected.card.name} · {selected.reversed ? "逆位" : "正位"}
            </div>
            <div style={{ fontSize: "13px", fontFamily: "'VT323', monospace", color: "#7766bb", marginTop: 4, lineHeight: 1.4 }}>
              {selected.reversed ? selected.card.dark : selected.card.light}
            </div>
          </div>
        </div>
      </Panel>

      {/* Energy bar */}
      <Panel label="本周能量分析">
        <div style={{ padding: 14 }}>
          <div style={{ display: "flex", height: 20, border: "2px solid #2a2244", overflow: "hidden", marginBottom: 12 }}>
            {Object.entries(energyCounts).map(([key, count]) => (
              <div key={key} style={{ width: `${(count / 7) * 100}%`, background: energyConfig[key]?.col || "#555" }} />
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {Object.entries(energyCounts).map(([key, count]) => {
              const cfg = energyConfig[key];
              if (!cfg) return null;
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, background: cfg.col, border: "2px solid #000" }} />
                  <span style={{ fontSize: "7px", color: "#7766bb" }}>{cfg.label}</span>
                  <span style={{ fontSize: "9px", color: cfg.col }}>{count}天</span>
                </div>
              );
            })}
          </div>
        </div>
      </Panel>

      {/* Log list */}
      <Panel label="问题日志">
        <div>
          {WEEKLY.map((d, i) => (
            <button key={d.day} onClick={() => setSelected(d)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px",
              background: selected.day === d.day ? "#1e1a3a" : "transparent",
              border: "none", borderBottom: i < WEEKLY.length - 1 ? "1px solid #1a1a2e" : "none",
              cursor: "pointer", textAlign: "left", fontFamily: "inherit",
            }}>
              <span style={{ fontSize: "7px", color: "#555", minWidth: 28 }}>{d.day}</span>
              <span style={{ fontSize: "18px" }}>{d.card.emoji}</span>
              <span style={{ fontSize: "15px", fontFamily: "'VT323', monospace", color: "#e8deff", flex: 1, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                {d.q}
              </span>
              {d.reversed && <span style={{ fontSize: "6px", color: "#dc2626", flexShrink: 0 }}>逆</span>}
              <span style={{ fontSize: "7px", color: d.card.col, flexShrink: 0 }}>{d.card.name}</span>
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ── Trends Section ─────────────────────────────────────────────────────────────
function TrendsSection() {
  const energyDist = [
    { name: "光明", value: 14, col: "#a3e635" },
    { name: "中性", value: 8, col: "#c084fc" },
    { name: "阴影", value: 6, col: "#dc2626" },
  ];
  const total = energyDist.reduce((a, b) => a + b.value, 0);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: typeof TREND_DATA[0] }[] }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: "#12122a", border: "3px solid #3d3570", boxShadow: "4px 4px 0 #000", padding: "8px 12px", fontFamily: "'Press Start 2P', monospace" }}>
        <div style={{ fontSize: "8px", color: d.col }}>{d.emoji} {d.name}</div>
        <div style={{ fontSize: "10px", color: "#e8deff", marginTop: 4 }}>{d.count} 次</div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "16px 16px 100px" }}>
      <div style={{ textAlign: "center", paddingTop: 16 }}>
        <div style={{ fontSize: "8px", color: "#c084fc", letterSpacing: "0.15em" }}>✦ TREND ANALYSIS ✦</div>
        <div style={{ fontSize: "12px", color: "#e8deff", marginTop: 8 }}>塔罗牌趋势总结</div>
      </div>

      {/* Bar chart */}
      <Panel label="本周最常出现的牌">
        <div style={{ padding: "12px 4px 8px" }}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={TREND_DATA} margin={{ top: 4, right: 8, left: -24, bottom: 4 }}>
              <XAxis dataKey="emoji" tick={{ fontFamily: "'VT323', monospace", fill: "#7766bb", fontSize: 18 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ffffff08" }} />
              <Bar dataKey="count" radius={0} maxBarSize={28}>
                {TREND_DATA.map((d) => <Cell key={d.name} fill={d.col} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* Energy distribution */}
      <Panel label="能量类型分布">
        <div style={{ padding: 14 }}>
          <div style={{ display: "flex", height: 24, border: "2px solid #2a2244", overflow: "hidden", marginBottom: 12 }}>
            {energyDist.map(e => (
              <div key={e.name} style={{ width: `${(e.value / total) * 100}%`, background: e.col }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {energyDist.map(e => (
              <div key={e.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 12, height: 12, background: e.col, border: "2px solid #000" }} />
                <span style={{ fontSize: "7px", color: "#7766bb" }}>{e.name}</span>
                <span style={{ fontSize: "10px", color: e.col }}>{e.value}</span>
                <span style={{ fontSize: "7px", color: "#555" }}>次</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {/* Ranking */}
      <Panel label="牌面详细排行">
        <div>
          {TREND_DATA.map((d, i) => (
            <div key={d.name} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px",
              borderBottom: i < TREND_DATA.length - 1 ? "1px solid #1a1a2e" : "none",
            }}>
              <span style={{ fontSize: "7px", color: i < 3 ? "#fbbf24" : "#3d3570", minWidth: 18 }}>
                {i < 3 ? ["①", "②", "③"][i] : `#${i + 1}`}
              </span>
              <span style={{ fontSize: "20px" }}>{d.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "9px", color: "#e8deff" }}>{d.name}</div>
                <div style={{ width: `${(d.count / 12) * 100}%`, height: 6, background: d.col, border: "1px solid #000", marginTop: 4, maxWidth: 120 }} />
              </div>
              <span style={{ fontSize: "12px", color: d.col }}>{d.count}次</span>
            </div>
          ))}
        </div>
      </Panel>

      {/* AI Insight */}
      <Panel label="趋势洞察" color="#fbbf24">
        <div style={{ padding: 14, fontSize: "16px", fontFamily: "'VT323', monospace", color: "#e8deff", lineHeight: 1.7 }}>
          本周能量以<span style={{ color: "#a3e635" }}>光明牌</span>为主导，希望与成功的主题反复出现。
          <br /><br />
          ⭐ <span style={{ color: "#fbbf24" }}>星星牌</span>连续三天显现，集体意识正处于觉醒与疗愈的关键转折点。
          <br /><br />
          🌕 警惕<span style={{ color: "#c084fc" }}>月亮牌</span>带来的集体焦虑，内心真相正待被看见与接纳。
        </div>
      </Panel>
    </div>
  );
}

// ── Plaza Section ──────────────────────────────────────────────────────────────
function PlazaSection() {
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const toggle = (id: number) => setLiked(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "16px 16px 100px" }}>
      <div style={{ textAlign: "center", paddingTop: 16 }}>
        <div style={{ fontSize: "8px", color: "#c084fc", letterSpacing: "0.15em" }}>✦ QUESTION PLAZA ✦</div>
        <div style={{ fontSize: "12px", color: "#e8deff", marginTop: 8 }}>问题广场</div>
        <div style={{ fontSize: "7px", color: "#555", marginTop: 6 }}>大家都在向宇宙提问什么？</div>
      </div>

      {/* Hot badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", border: "2px solid #f97316", boxShadow: "3px 3px 0 #000", background: "#120a00" }}>
        <span style={{ fontSize: "16px" }}>🔥</span>
        <span style={{ fontSize: "7px", color: "#f97316" }}>今日最多人共鸣：</span>
        <span style={{ fontSize: "14px", fontFamily: "'VT323', monospace", color: "#e8deff" }}>什么时候能遇到真正适合的人？</span>
      </div>

      {PLAZA.map((p, i) => (
        <div key={p.id} style={{ border: "3px solid #3d3570", boxShadow: "4px 4px 0 #000", background: "#0a0a1a", animation: `fadeUp 0.3s ease ${i * 0.06}s both` }}>
          {/* Header */}
          <div style={{ padding: "8px 12px", background: "#12122a", borderBottom: "2px solid #2a2244", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "7px", color: "#a855f7" }}>@{p.user}</span>
            <span style={{ fontSize: "7px", color: "#3d3570" }}>{p.time}</span>
          </div>

          {/* Body */}
          <div style={{ padding: 12, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <MiniCard card={p.card} reversed={p.reversed} size="sm" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "17px", fontFamily: "'VT323', monospace", color: "#e8deff", lineHeight: 1.5, marginBottom: 8 }}>
                "{p.q}"
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: "14px" }}>{p.card.emoji}</span>
                <span style={{ fontSize: "8px", color: p.card.col }}>{p.card.name}</span>
                {p.reversed && (
                  <span style={{ fontSize: "6px", color: "#dc2626", border: "1px solid #dc2626", padding: "1px 4px" }}>逆位</span>
                )}
              </div>
              <div style={{ fontSize: "13px", fontFamily: "'VT323', monospace", color: "#7766bb", marginTop: 4 }}>
                {p.reversed ? p.card.dark : p.card.light}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: "8px 12px", borderTop: "1px solid #1a1a2e", display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => toggle(p.id)} style={{
              background: "transparent",
              border: `2px solid ${liked.has(p.id) ? "#f43f5e" : "#2a2244"}`,
              color: liked.has(p.id) ? "#f43f5e" : "#555",
              padding: "4px 12px", fontSize: "9px",
              fontFamily: "inherit", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              boxShadow: "2px 2px 0 #000",
            }}>
              {liked.has(p.id) ? "♥" : "♡"} {p.likes + (liked.has(p.id) ? 1 : 0)}
            </button>
            <span style={{ fontSize: "7px", color: "#3d3570" }}>共鸣</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── App Shell ──────────────────────────────────────────────────────────────────
const TABS = [
  { label: "占卜", icon: "🔮" },
  { label: "周记", icon: "📅" },
  { label: "趋势", icon: "📊" },
  { label: "广场", icon: "🌐" },
];

const STAR_POSITIONS = Array.from({ length: 32 }, (_, i) => ({
  w: i % 3 === 0 ? 4 : 2,
  x: ((i * 37 + 13) % 97) + 1,
  y: ((i * 53 + 7) % 97) + 1,
  col: ["#c084fc", "#60a5fa", "#fbbf24", "#ffffff", "#a3e635"][i % 5],
  dur: 1 + (i % 3) * 0.8,
  delay: i * 0.15,
}));

export default function App() {
  const [tab, setTab] = useState(0);

  return (
    <div style={{ fontFamily: "'Press Start 2P', monospace", background: "#0a0a1a", minHeight: "100vh", maxWidth: 430, margin: "0 auto", position: "relative", overflowX: "hidden" }}>
      <style>{GLOBAL_STYLES}</style>

      {/* Pixel starfield */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden", maxWidth: 430, margin: "0 auto" }}>
        {STAR_POSITIONS.map((s, i) => (
          <div key={i} style={{
            position: "absolute",
            width: s.w, height: s.w,
            background: s.col,
            left: `${s.x}%`, top: `${s.y}%`,
            animation: `blink ${s.dur}s steps(1) ${s.delay}s infinite`,
          }} />
        ))}
        {/* Subtle scanlines over whole bg */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,0,0,0.06) 4px, rgba(0,0,0,0.06) 5px)", pointerEvents: "none" }} />
      </div>

      {/* Page content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {tab === 0 && <DrawSection />}
        {tab === 1 && <WeeklySection />}
        {tab === 2 && <TrendsSection />}
        {tab === 3 && <PlazaSection />}
      </div>

      {/* Bottom nav */}
      <nav style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430,
        background: "#080812",
        borderTop: "3px solid #3d3570",
        boxShadow: "0 -4px 0 #000",
        display: "flex", zIndex: 100,
      }}>
        {TABS.map((t, i) => (
          <button key={t.label} onClick={() => setTab(i)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            padding: "10px 0 16px",
            background: tab === i ? "#12122a" : "transparent",
            border: "none",
            borderTop: `3px solid ${tab === i ? "#9d4edd" : "transparent"}`,
            color: tab === i ? "#fbbf24" : "#3d3570",
            cursor: "pointer", fontFamily: "inherit",
            transition: "color 0.1s, border-color 0.1s",
          }}>
            <span style={{ fontSize: "20px" }}>{t.icon}</span>
            <span style={{ fontSize: "6px" }}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
