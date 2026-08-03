import { useState, useRef, useCallback } from "react";
import type { DrawnCard } from "../types";
import { showToast } from "../components/ui/PixelToast";
import { saveReading, streamAgentReading, validateQuestion, batchReading } from "../api/client";
import type { SaveReadingPayload, CardReadingPayload } from "../types/client";

/** 管理所有与后端 API 的交互：验证、流式解读、保存 */
export function useReadingAPI() {
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const streamTextRef = useRef("");
  const [revealDone, setRevealDone] = useState(false);
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [combinedReading, setCombinedReading] = useState("");
  const [combinedLoading, setCombinedLoading] = useState(false);
  const [combinedDone, setCombinedDone] = useState(false);

  /** 验证问题是否合法 */
  const validate = useCallback(async (question: string): Promise<boolean> => {
    setValidating(true);
    const result = await validateQuestion(question.trim());
    setValidating(false);
    if (!result.valid) {
      showToast(result.message || "请想清楚后再问", "error");
      return false;
    }
    return true;
  }, []);

  /** 重置解读状态 */
  const resetReading = useCallback(() => {
    setIsLoading(false);
    setStreamingText("");
    streamTextRef.current = "";
    setRevealDone(false);
    setCombinedReading("");
    setCombinedDone(false);
    setCombinedLoading(false);
  }, []);

  /** 流式获取单张牌的解读 */
  const fetchCardReading = useCallback(async (
    question: string,
    card: DrawnCard,
    cardIdx: number,
    drawCount: 1 | 3,
    drawn: DrawnCard[],
    currentReadings: string[],
    onAllReadingsReady: (readings: string[]) => void,
  ) => {
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
        setRevealDone(true);
        setIsLoading(false);

        // 更新 readings 数组并通知外部
        const updated = [...currentReadings];
        updated[cardIdx] = finalText;
        onAllReadingsReady(updated);

        // 如果是三牌阵最后一张，触发综合解读
        if (drawCount === 3 && cardIdx === drawn.length - 1) {
          fetchCombinedReading(question, drawn, updated);
        }
      },
      (err) => {
        console.error("Agent error:", err);
        setIsLoading(false);
        setRevealDone(true);
        showToast(err.message || "解读失败，请重试", "error");
      },
      drawCount,
      cardIdx,
    );
  }, []);

  /** 流式获取三牌阵综合解读 */
  const fetchCombinedReading = useCallback(async (
    question: string,
    cards: DrawnCard[],
    readings: string[],
  ) => {
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
      3, 2, true,
    );
  }, []);

  /** 批量预取所有牌的解读（动画期间调用） */
  const batchFetchReadings = useCallback(async (
    question: string,
    cards: DrawnCard[],
  ): Promise<string[]> => {
    const payloads: CardReadingPayload[] = cards.map(c => ({
      card_id: c.id, card_name: c.name, card_en: c.en,
      reversed: c.reversed, reading_text: "",
    }));

    try {
      return await batchReading(question, payloads);
    } catch (err) {
      console.error("Batch reading error:", err);
      showToast("解读预取失败，将使用逐张解读", "error");
      return [];
    }
  }, []);

  /** 保存占卜记录 */
  const save = useCallback(async (payload: SaveReadingPayload): Promise<boolean> => {
    if (saving) return false;
    setSaving(true);
    try {
      await saveReading(payload);
      showToast("已保存到牌案！");
      return true;
    } catch (e) {
      console.error(e);
      showToast("保存失败", "error");
      return false;
    } finally {
      setSaving(false);
    }
  }, [saving]);

  return {
    // 状态
    isLoading, streamingText, revealDone,
    validating, saving,
    combinedReading, combinedLoading, combinedDone,
    // 操作
    validate, fetchCardReading, fetchCombinedReading, batchFetchReadings, save, resetReading,
    // setter（供外部精细控制）
    setIsLoading, setRevealDone, setCombinedReading, setCombinedDone, setCombinedLoading,
  };
}
