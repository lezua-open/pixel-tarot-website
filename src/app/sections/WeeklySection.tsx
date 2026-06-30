import { useState } from "react";
import { WEEKLY } from "../data";
import { MiniCard } from "../components/ui/MiniCard";
import { Panel } from "../components/ui/Panel";
import { genReading } from "../utils";

export function WeeklySection() {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [detailEntry, setDetailEntry] = useState<typeof WEEKLY[number] | null>(null);
  const [detailReading, setDetailReading] = useState("");

  const openDetail = (entry: typeof WEEKLY[number]) => {
    setDetailEntry(entry);
    setDetailReading(genReading(entry.card, entry.reversed));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, padding: "16px 16px 100px" }}>
      <div style={{ textAlign: "center", paddingTop: 16, marginBottom: 16 }}>
        <div style={{ fontSize: "8px", color: "#c084fc", letterSpacing: "0.15em" }}>✦ WEEKLY LOG ✦</div>
        <div style={{ fontSize: "12px", color: "#e8deff", marginTop: 8 }}>近七日问题记录</div>
      </div>

      {/* Accordion by day */}
      {WEEKLY.map((entry, i) => {
        const isOpen = expandedDay === entry.day;
        const isToday = entry.day === "SUN";
        return (
          <div key={entry.day} style={{ borderBottom: i < WEEKLY.length - 1 ? "1px solid #1a1a2e" : "none" }}>
            <button onClick={() => setExpandedDay(isOpen ? null : entry.day)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "12px", background: isOpen ? "#12122a" : "transparent",
              border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
            }}>
              <span style={{ fontSize: "8px", color: isToday ? "#fbbf24" : "#555", minWidth: 32 }}>
                {isToday ? "★ " : ""}{entry.day}
              </span>
              <span style={{ fontSize: "6px", color: "#3d3570", minWidth: 36 }}>{entry.date}</span>
              <span style={{
                fontSize: "14px", fontFamily: "'VT323', monospace", color: "#e8deff", flex: 1,
                overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
              }}>{entry.q}</span>
              <span style={{
                fontSize: "10px", color: isOpen ? "#c084fc" : "#3d3570",
                transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s",
              }}>▶</span>
            </button>

            {isOpen && (
              <div style={{ padding: "0 12px 12px", animation: "fadeUp 0.2s ease" }}>
                <div
                  onClick={() => openDetail(entry)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                    background: "#0a0a1a", border: `2px solid ${entry.card.col}33`,
                    cursor: "pointer", transition: "border-color 0.2s",
                  }}
                >
                  <span style={{
                    fontSize: "15px", fontFamily: "'VT323', monospace", color: "#e8deff", flex: 1,
                    overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
                  }}>{entry.q}</span>
                  <span style={{ fontSize: "7px", color: entry.card.col, flexShrink: 0 }}>{entry.card.name}</span>
                  {entry.reversed && <span style={{ fontSize: "6px", color: "#dc2626", flexShrink: 0 }}>逆</span>}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Detail modal — same layout as DrawSection revealed */}
      {detailEntry && (
        <div onClick={() => setDetailEntry(null)} style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(5,5,15,0.96)",
          display: "flex", flexDirection: "column", alignItems: "center",
          overflowY: "auto", padding: "24px 16px", gap: 14, cursor: "pointer",
          animation: "fadeUp 0.3s ease forwards",
        }}>
          <div style={{ fontSize: "7px", color: "#555" }}>
            ✦ {detailEntry.day} · {detailEntry.date} ✦
          </div>

          {/* Question */}
          <div style={{ maxWidth: 340, width: "100%", padding: "10px 14px", background: "#12122a", border: "2px solid #3d3570" }}>
            <div style={{ fontSize: "7px", color: "#555", marginBottom: 4 }}>问题</div>
            <div style={{ fontSize: "16px", fontFamily: "'VT323', monospace", color: "#e8deff", lineHeight: 1.5 }}>{detailEntry.q}</div>
          </div>

          <MiniCard card={detailEntry.card} reversed={detailEntry.reversed} size="lg" />

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "16px", color: detailEntry.card.col, fontFamily: "'VT323', monospace" }}>{detailEntry.card.name}</div>
            <div style={{ fontSize: "8px", color: "#7766bb", marginTop: 4 }}>{detailEntry.card.en}</div>
            {detailEntry.reversed && (
              <div style={{ display: "inline-block", marginTop: 6, background: "#1a0a0a", color: "#dc2626", fontSize: "7px", padding: "2px 8px", border: "2px solid #dc2626" }}>逆位</div>
            )}
          </div>

          <Panel label="塔罗解读" color={detailEntry.card.col}>
            <div style={{ padding: 14, fontSize: "16px", fontFamily: "'VT323', monospace", color: "#e8deff", lineHeight: 1.7, whiteSpace: "pre-line" }}>
              {detailReading}
            </div>
          </Panel>

          <div style={{ fontSize: "7px", color: "#3d3570" }}>点击关闭</div>
        </div>
      )}
    </div>
  );
}
