import { useState, useCallback, useEffect } from "react";
import type { DrawnCard } from "../types";
import { CARDS } from "../data";

export type AnimPhase = "spread" | "gather" | "shuffle" | "draw" | "glow" | null;

/** 管理洗牌/抽牌动画编排 */
export function useDrawAnimation() {
  const [animPhase, setAnimPhase] = useState<AnimPhase>(null);
  const [drawnIdx, setDrawnIdx] = useState(-1);
  const [drawn, setDrawn] = useState<DrawnCard[]>([]);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; col: string }[]>([]);

  /** 重置动画状态 */
  const resetAnimation = useCallback(() => {
    setAnimPhase(null);
    setDrawnIdx(-1);
    setDrawn([]);
    setSparkles([]);
  }, []);

  /**
   * 启动完整的抽牌动画序列。
   * @param drawCount 抽牌数量
   * @param onStart 牌选好后立即调用（动画期间可发起 API 请求）
   * @param onComplete 动画结束后调用
   */
  const startDraw = useCallback((
    drawCount: 1 | 3,
    onStart: (cards: DrawnCard[]) => void,
    onComplete: (cards: DrawnCard[]) => void,
  ) => {
    resetAnimation();
    setAnimPhase("spread");

    // 预选牌
    const picked: DrawnCard[] = [];
    const available = [...CARDS];
    for (let i = 0; i < drawCount; i++) {
      const idx = Math.floor(Math.random() * available.length);
      const card = available.splice(idx, 1)[0];
      picked.push({ ...card, reversed: Math.random() > 0.72 });
    }
    setDrawn(picked);

    // ★ 立即通知外部：牌已选好，可以开始请求
    onStart(picked);

    // 星尘特效
    const palette = ["#fbbf24", "#c084fc", "#60a5fa", "#f43f5e", "#34d399", "#a3e635"];
    setSparkles(Array.from({ length: 18 }, (_, i) => ({
      id: Date.now() + i,
      x: 5 + Math.random() * 90,
      y: 5 + Math.random() * 90,
      col: palette[Math.floor(Math.random() * palette.length)],
    })));
    setTimeout(() => setSparkles([]), 5000);

    // 动画阶段编排
    setTimeout(() => setAnimPhase("gather"), 1000);
    setTimeout(() => setAnimPhase("shuffle"), 1800);
    setTimeout(() => { setAnimPhase("draw"); setDrawnIdx(0); }, 3200);
    if (drawCount >= 2) setTimeout(() => setDrawnIdx(1), 3900);
    if (drawCount >= 3) setTimeout(() => setDrawnIdx(2), 4600);
    setTimeout(() => setAnimPhase("glow"), 3200 + drawCount * 700);

    // 动画结束
    setTimeout(() => {
      setAnimPhase(null);
      onComplete(picked);
    }, 4200 + drawCount * 700);
  }, [resetAnimation]);

  return {
    animPhase,
    drawnIdx,
    drawn,
    sparkles,
    startDraw,
    resetAnimation,
    setAnimPhase,
    setDrawnIdx,
    setDrawn,
  };
}
