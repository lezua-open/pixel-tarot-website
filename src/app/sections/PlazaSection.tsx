import { useState } from "react";
import { PLAZA } from "../data";
import { MiniCard } from "../components/ui/MiniCard";
import { CardIcon } from "../components/ui/CardIcon";

export function PlazaSection() {
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
        <span style={{ fontSize: "10px", color: "#f97316" }}>▲</span>
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
                <CardIcon id={p.card.id} size={14} color={p.card.col} />
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
