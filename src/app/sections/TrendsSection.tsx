import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CARDS, TREND_DATA } from "../data";
import { MiniCard } from "../components/ui/MiniCard";
import { Panel } from "../components/ui/Panel";

export function TrendsSection() {
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
        <div style={{ fontSize: "8px", color: d.col, display: "flex", alignItems: "center", gap: 6 }}>
          {(() => { const card = CARDS.find(c => c.name === d.name); return card ? <img src={card.img} alt={card.name} style={{ width: 18, height: 26, objectFit: "cover", border: `1px solid ${d.col}` }} /> : null; })()}
          {d.name}
        </div>
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
              <XAxis dataKey="name" tick={{ fontFamily: "'VT323', monospace", fill: "#7766bb", fontSize: 10 }} axisLine={false} tickLine={false} />
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
              {(() => { const card = CARDS.find(c => c.name === d.name); return card ? <MiniCard card={card} reversed={false} size="sm" /> : null; })()}
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
