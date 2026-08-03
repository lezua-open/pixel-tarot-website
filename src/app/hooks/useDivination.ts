import { useState, useEffect, useCallback, useRef } from "react";
import type { DrawnCard } from "../types";
import { showToast } from "../components/ui/PixelToast";
import { useDrawAnimation } from "./useDrawAnimation";
import { useReadingAPI } from "./useReadingAPI";

export type Phase = "idle" | "shuffling" | "revealed";

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

// 打字机速度（毫秒/字）
const TYPEWRITER_SPEED = 40;

/** 占卜主流程 Hook — 组合动画与 API 两个子 Hook */
export function useDivination(onPhaseChange?: (isDivining: boolean) => void) {
  const [q, setQ] = useState("");
  const [drawCount, setDrawCount] = useState<1 | 3>(1);
  const [phase, setPhase] = useState<Phase>("idle");
  const [readings, setReadings] = useState<string[]>([]);         // 最终完整文本
  const [displayReadings, setDisplayReadings] = useState<string[]>([]); // 当前显示文本（打字机）
  const [typewriterDone, setTypewriterDone] = useState(false);
  const [revealIdx, setRevealIdx] = useState(-1);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [batchReady, setBatchReady] = useState(false);

  const batchResultRef = useRef<string[] | null>(null);
  const typewriterTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const anim = useDrawAnimation();
  const api = useReadingAPI();

  // ── 清理打字机定时器 ──────────────────────────────────────────────────

  const clearTypewriter = useCallback(() => {
    if (typewriterTimerRef.current) {
      clearInterval(typewriterTimerRef.current);
      typewriterTimerRef.current = null;
    }
  }, []);

  // ── 打字机效果：逐字输出 readings[idx] 到 displayReadings[idx] ────────

  useEffect(() => {
    clearTypewriter();

    // 单牌流式模式：不走打字机，直接显示 streamingText
    if (drawCount === 1) return;

    // 三牌阵批量模式
    if (revealIdx < 0 || revealIdx >= readings.length) return;
    const fullText = readings[revealIdx];
    if (!fullText) return;

    // 重置当前牌的显示文本
    setDisplayReadings(prev => {
      const next = [...prev];
      next[revealIdx] = "";
      return next;
    });
    setTypewriterDone(false);

    let charIdx = 0;
    typewriterTimerRef.current = setInterval(() => {
      charIdx++;
      setDisplayReadings(prev => {
        const next = [...prev];
        next[revealIdx] = fullText.slice(0, charIdx);
        return next;
      });
      if (charIdx >= fullText.length) {
        clearTypewriter();
        setTypewriterDone(true);
      }
    }, TYPEWRITER_SPEED);

    return clearTypewriter;
  }, [revealIdx, readings, drawCount]);

  // ── 跳过打字机，直接显示完整文本 ──────────────────────────────────────

  const skipTypewriter = useCallback(() => {
    clearTypewriter();
    if (revealIdx >= 0 && revealIdx < readings.length) {
      setDisplayReadings(prev => {
        const next = [...prev];
        next[revealIdx] = readings[revealIdx];
        return next;
      });
    }
    setTypewriterDone(true);
  }, [revealIdx, readings, clearTypewriter]);

  // ── 副作用 ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!api.isLoading && !api.combinedLoading) return;
    const pick = () => LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
    setLoadingMsg(pick());
    const t = setInterval(() => setLoadingMsg(pick()), 2500);
    return () => clearInterval(t);
  }, [api.isLoading, api.combinedLoading]);

  useEffect(() => {
    onPhaseChange?.(phase !== "idle" || api.validating);
  }, [phase, api.validating, onPhaseChange]);

  // ── 操作 ──────────────────────────────────────────────────────────────

  const draw = useCallback(async () => {
    if (!q.trim() || phase !== "idle") return;

    const trimmed = q.trim();
    if (trimmed.length < 3 || /^\d+$/.test(trimmed) || /^[a-z]+$/.test(trimmed.toLowerCase()) || /^[!@#$%^&*]+$/.test(trimmed)) {
      showToast("请描述你的问题，而不是随便输入", "error");
      return;
    }

    const ok = await api.validate(trimmed);
    if (!ok) return;

    setPhase("shuffling");
    setReadings([]);
    setDisplayReadings([]);
    setRevealIdx(-1);
    setBatchReady(false);
    setTypewriterDone(false);
    batchResultRef.current = null;
    clearTypewriter();
    api.resetReading();

    anim.startDraw(
      drawCount,
      (picked) => {
        if (drawCount === 3) {
          api.batchFetchReadings(q, picked).then((results) => {
            batchResultRef.current = results;
            setBatchReady(true);
            setReadings(results);
            setDisplayReadings(results.map(() => ""));
          });
        }
      },
      (picked) => {
        if (drawCount === 3) {
          setRevealIdx(0);
        } else {
          setPhase("revealed");
          api.fetchCardReading(
            q, picked[0], 0, 1, picked, [],
            (updated) => { setReadings(updated); setDisplayReadings(updated); },
          );
        }
      },
    );
  }, [q, phase, drawCount, anim, api, clearTypewriter]);

  const nextReveal = useCallback(() => {
    clearTypewriter();
    // 先确保当前牌显示完整
    if (revealIdx >= 0 && revealIdx < readings.length) {
      setDisplayReadings(prev => {
        const next = [...prev];
        next[revealIdx] = readings[revealIdx];
        return next;
      });
    }

    if (revealIdx < anim.drawn.length - 1) {
      setRevealIdx(revealIdx + 1);
    } else {
      setRevealIdx(-1);
      setPhase("revealed");
      api.fetchCombinedReading(q, anim.drawn, readings);
    }
  }, [revealIdx, anim.drawn, readings, q, api, clearTypewriter]);

  const reset = useCallback(() => {
    clearTypewriter();
    setPhase("idle");
    setQ("");
    setReadings([]);
    setDisplayReadings([]);
    setRevealIdx(-1);
    setBatchReady(false);
    setTypewriterDone(false);
    batchResultRef.current = null;
    anim.resetAnimation();
    api.resetReading();
  }, [anim, api, clearTypewriter]);

  const handleSave = useCallback(async () => {
    const ok = await api.save({
      question: q, draw_count: drawCount,
      cards: anim.drawn.map((c, i) => ({
        card_id: c.id, card_name: c.name, card_en: c.en, reversed: c.reversed,
        reading_text: readings[i] || "",
      })),
      combined_reading: api.combinedReading || undefined,
    });
    if (ok) reset();
  }, [q, drawCount, anim.drawn, readings, api, reset]);

  return {
    q, setQ,
    drawCount, setDrawCount,
    phase,
    animPhase: anim.animPhase,
    drawn: anim.drawn,
    drawnIdx: anim.drawnIdx,
    sparkles: anim.sparkles,
    readings,               // 完整文本（用于保存）
    displayReadings,        // 显示文本（打字机效果）
    revealIdx,
    typewriterDone,         // 当前牌打字机是否完成
    revealDone: batchReady || api.revealDone,
    isLoading: drawCount === 1 && api.isLoading,
    loadingMsg,
    streamingText: api.streamingText,
    saving: api.saving,
    validating: api.validating,
    combinedReading: api.combinedReading,
    combinedLoading: api.combinedLoading,
    combinedDone: api.combinedDone,
    draw, nextReveal, reset, handleSave, skipTypewriter,
  };
}
