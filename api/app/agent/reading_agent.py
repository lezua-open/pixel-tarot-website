from collections.abc import AsyncGenerator

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage

from ..config import settings
from ..security import sanitize_input, detect_prompt_injection, security_logger
from .prompts import (
    MODERATION_PROMPT,
    QUESTION_VALIDATION_PROMPT,
    SYSTEM_PROMPT,
    build_single_prompt,
    build_card_prompt,
    build_combined_prompt,
    build_all_cards_prompt,
)

# ── 22 张大阿卡纳牌义 ────────────────────────────────────────────────────────

CARD_MEANINGS = {
    0: {"name": "愚者", "en": "THE FOOL", "light": "新的开始与冒险", "dark": "鲁莽与缺乏方向"},
    1: {"name": "魔术师", "en": "THE MAGICIAN", "light": "意志力与创造", "dark": "操纵与欺骗"},
    2: {"name": "女祭司", "en": "HIGH PRIESTESS", "light": "直觉与神秘智慧", "dark": "隐藏的秘密"},
    3: {"name": "女皇", "en": "THE EMPRESS", "light": "丰盛与创造力", "dark": "依赖与过度"},
    4: {"name": "皇帝", "en": "THE EMPEROR", "light": "权威与稳定", "dark": "专制与僵化"},
    5: {"name": "教皇", "en": "THE HIEROPHANT", "light": "传统与精神指引", "dark": "教条与保守"},
    6: {"name": "恋人", "en": "THE LOVERS", "light": "爱情与深层联结", "dark": "冲突与选择困难"},
    7: {"name": "战车", "en": "THE CHARIOT", "light": "胜利与掌控", "dark": "失控与侵略"},
    8: {"name": "力量", "en": "STRENGTH", "light": "内在力量与耐心", "dark": "软弱与自我怀疑"},
    9: {"name": "隐者", "en": "THE HERMIT", "light": "内省与智慧", "dark": "孤立与封闭"},
    10: {"name": "命运之轮", "en": "WHEEL OF FORTUNE", "light": "好运与转机", "dark": "厄运与阻力"},
    11: {"name": "正义", "en": "JUSTICE", "light": "公正与真相", "dark": "不公与逃避"},
    12: {"name": "倒吊人", "en": "THE HANGED MAN", "light": "暂停与新视角", "dark": "固执与拖延"},
    13: {"name": "死神", "en": "DEATH", "light": "转变与重生", "dark": "抗拒改变"},
    14: {"name": "节制", "en": "TEMPERANCE", "light": "平衡与调和", "dark": "过度与失衡"},
    15: {"name": "恶魔", "en": "THE DEVIL", "light": "看见束缚", "dark": "沉溺与上瘾"},
    16: {"name": "塔", "en": "THE TOWER", "light": "突破与启示", "dark": "崩溃与混乱"},
    17: {"name": "星星", "en": "THE STAR", "light": "希望与灵感", "dark": "绝望与失去方向"},
    18: {"name": "月亮", "en": "THE MOON", "light": "直觉与潜意识", "dark": "恐惧与幻觉"},
    19: {"name": "太阳", "en": "THE SUN", "light": "喜悦与成功", "dark": "过度乐观"},
    20: {"name": "审判", "en": "JUDGEMENT", "light": "觉醒与重生", "dark": "自我怀疑与错判"},
    21: {"name": "世界", "en": "THE WORLD", "light": "完成与整合", "dark": "未完成与停滞"},
}


# ── 工具函数 ──────────────────────────────────────────────────────────────────

def _extract_text(response) -> str:
    """从 LLM 响应中提取文本内容（兼容字符串和数组格式）"""
    raw = response.content
    if isinstance(raw, str):
        return raw
    if isinstance(raw, list):
        parts = [item.get("text", "") for item in raw if isinstance(item, dict) and item.get("type") == "text"]
        return "".join(parts)
    return ""


def _get_card_info(card: dict) -> dict:
    """从牌面数据中提取信息"""
    card_id = card.get("card_id", 0)
    info = CARD_MEANINGS.get(card_id, CARD_MEANINGS[0])
    orient = "逆位" if card.get("reversed", False) else "正位"
    meaning = info["dark"] if card.get("reversed", False) else info["light"]
    return {"name": info["name"], "en": info["en"], "orient": orient, "meaning": meaning}


_llm_cache: dict[tuple[float, int], ChatAnthropic] = {}


def _get_llm(temperature: float = 0.7, max_tokens: int = 800) -> ChatAnthropic:
    """获取 LLM 实例（带缓存）"""
    key = (temperature, max_tokens)
    if key not in _llm_cache:
        _llm_cache[key] = ChatAnthropic(
            model=settings.mimo_model_name,
            api_key=settings.mimo_api_key,
            base_url=settings.mimo_api_base,
            temperature=temperature,
            max_tokens=max_tokens,
        )
    return _llm_cache[key]


# ── LLM 输入审核 ─────────────────────────────────────────────────────────────

async def moderate_with_llm(question: str) -> tuple[bool, str]:
    """用 LLM 审核用户输入安全性。返回 (是否安全, 原因)。"""
    try:
        llm = _get_llm(temperature=0.1, max_tokens=100)
        response = await llm.ainvoke([
            SystemMessage(content=MODERATION_PROMPT),
            HumanMessage(content=f"用户输入：{question}"),
        ])

        import json
        content = _extract_text(response)
        try:
            result = json.loads(content.strip())
            is_safe = result.get("safe", True)
            reason = result.get("reason", "")
            if not is_safe:
                security_logger.warning(f"LLM moderation blocked: reason='{reason}', input='{question[:50]}...'")
            return is_safe, reason
        except json.JSONDecodeError:
            security_logger.warning(f"LLM moderation parse failed: response='{content}'")
            return True, ""
    except Exception as e:
        security_logger.error(f"LLM moderation error: {e}")
        return True, ""


# ── 问题有效性验证 ─────────────────────────────────────────────────────────────

async def validate_question_with_llm(question: str) -> tuple[bool, str]:
    """用 LLM 验证问题是否值得占卜。返回 (是否有效, 提示信息)。"""
    try:
        llm = _get_llm(temperature=0.1, max_tokens=150)
        response = await llm.ainvoke([
            SystemMessage(content=QUESTION_VALIDATION_PROMPT),
            HumanMessage(content=f"用户输入：{question}"),
        ])

        import json
        content = _extract_text(response)
        try:
            result = json.loads(content.strip())
            is_valid = result.get("valid", True)
            if not is_valid:
                security_logger.info(f"Question validation rejected: input='{question[:50]}'")
            return is_valid, ""
        except json.JSONDecodeError:
            security_logger.warning(f"Question validation parse failed: response='{content}'")
            return True, ""
    except Exception as e:
        security_logger.error(f"Question validation error: {e}")
        return True, ""


# ── 构建 Prompt ───────────────────────────────────────────────────────────────

def _build_prompt(
    question: str,
    cards: list[dict],
    total_cards: int = 1,
    current_index: int = 0,
    is_combined: bool = False,
) -> str:
    """根据场景构建 User Prompt"""
    # 安全检查
    question = sanitize_input(question)
    injection = detect_prompt_injection(question)
    if injection:
        question = "请为我解读这张牌"

    # 综合解读
    if is_combined and len(cards) > 1:
        cards_info = []
        for card in cards:
            info = _get_card_info(card)
            info["reading"] = card.get("reading_text", "")
            cards_info.append(info)
        return build_combined_prompt(question, cards_info)

    # 单张牌
    card_info = _get_card_info(cards[0] if cards else {})

    if total_cards == 1:
        return build_single_prompt(question, card_info["name"], card_info["en"], card_info["orient"], card_info["meaning"])
    else:
        return build_card_prompt(question, card_info["name"], card_info["en"], card_info["orient"], card_info["meaning"], current_index)


# ── 生成解读 ──────────────────────────────────────────────────────────────────

async def generate_reading(question: str, cards: list[dict]) -> str:
    """一次性生成完整解读"""
    llm = _get_llm()
    prompt = _build_prompt(question, cards)
    response = await llm.ainvoke([
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=prompt),
    ])
    return _extract_text(response)


async def generate_reading_stream(
    question: str,
    cards: list[dict],
    total_cards: int = 1,
    current_index: int = 0,
    is_combined: bool = False,
) -> AsyncGenerator[str, None]:
    """流式生成解读（SSE 用）"""
    llm = _get_llm(max_tokens=1500) if is_combined else _get_llm()
    prompt = _build_prompt(question, cards, total_cards, current_index, is_combined)

    async for chunk in llm.astream([
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=prompt),
    ]):
        text = _extract_text(chunk)
        if text:
            yield text


# ── 批量生成（一次返回所有牌的解读）──────────────────────────────────────────

SEPARATOR = "===CARD_SEPARATOR==="


async def generate_all_readings(question: str, cards: list[dict]) -> list[str]:
    """
    一次 LLM 调用返回所有牌的解读。
    返回与 cards 等长的字符串列表。
    """
    question = sanitize_input(question)
    cards_info = [_get_card_info(c) for c in cards]
    prompt = build_all_cards_prompt(question, cards_info)

    llm = _get_llm(max_tokens=1200)
    response = await llm.ainvoke([
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=prompt),
    ])
    full_text = _extract_text(response)

    # 按分隔符拆分
    parts = [p.strip() for p in full_text.split(SEPARATOR)]
    parts = [p for p in parts if p]  # 去空

    # 兜底：如果拆分结果数量不对，尽量补齐
    while len(parts) < len(cards):
        parts.append("（解读生成异常）")

    return parts[:len(cards)]
