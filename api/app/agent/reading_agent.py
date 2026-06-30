from collections.abc import AsyncGenerator

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage

from ..config import settings

# 22 张大阿卡纳牌义
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

SYSTEM_PROMPT = """你是一位精通塔罗牌的神秘占卜师。你的风格是：
- 用解读牌面的方式来回答用户的问题
- 结合正位/逆位含义给出深度分析
- 不要有太过于虚幻空洞的描述
- 尽可能不使用表情
- 结论保持克制，不要过于绝对化
- 句子保持精炼，能用少数文字表达意思就不要有多数文字
- 不要有废话
- 使用中文回答"""


def _build_prompt(
    question: str,
    cards: list[dict],
    total_cards: int = 1,
    current_index: int = 0,
    is_combined: bool = False,
) -> str:
    """构建 Agent 提示词"""

    # 综合解读：列出所有牌
    if is_combined and len(cards) > 1:
        card_lines = []
        for i, card in enumerate(cards):
            card_id = card.get("card_id", 0)
            card_info = CARD_MEANINGS.get(card_id, CARD_MEANINGS[0])
            orient = "逆位" if card.get("reversed", False) else "正位"
            meaning = card_info["dark"] if card.get("reversed", False) else card_info["light"]
            reading = card.get("reading_text", "")
            card_lines.append(
                f"第{i+1}张：{card_info['name']}（{card_info['en']}），{orient}。\n牌义：{meaning}\n之前的解读：{reading}"
            )
        cards_text = "\n\n".join(card_lines)
        return f"""用户的问题：{question}

这是一个多牌占卜的【综合解读】环节。用户抽到了以下{len(cards)}张牌：

{cards_text}

你的任务是：综合分析以上所有{len(cards)}张牌，给出一个完整的总结。
注意：
1. 你是在做综合总结，不是在解读某一张牌
2. 需要串联所有牌的含义，找出它们之间的关联
3. 给出明确的总结"""

    # 单牌占卜
    current_card = cards[0] if cards else {}
    card_id = current_card.get("card_id", 0)
    card_info = CARD_MEANINGS.get(card_id, CARD_MEANINGS[0])
    orient = "逆位" if current_card.get("reversed", False) else "正位"
    meaning = card_info["dark"] if current_card.get("reversed", False) else card_info["light"]

    if total_cards == 1:
        return f"""用户的问题：{question}

用户抽到的是：{card_info['name']}（{card_info['en']}），{orient}。
牌义：{meaning}

请基于这张牌给出完整的解读。
重要：你解读的就是{card_info['name']}，不要说成其他牌。"""
    else:
        # 多牌占卜 - 单张解读
        is_last = current_index == total_cards - 1
        if is_last:
            return f"""用户的问题：{question}

这是多牌占卜（共{total_cards}张），当前是最后一张（第{current_index + 1}张）。

用户抽到的是：{card_info['name']}（{card_info['en']}），{orient}。
牌义：{meaning}

请解读这张{card_info['name']}的含义，可以简要提及与前面牌的关联。
重要：你解读的就是{card_info['name']}，不要说成其他牌。"""
        else:
            return f"""用户的问题：{question}

这是多牌占卜（共{total_cards}张），当前是第{current_index + 1}张，还有{total_cards - current_index - 1}张未抽。

用户抽到的是：{card_info['name']}（{card_info['en']}），{orient}。
牌义：{meaning}

请只解读这张{card_info['name']}的含义。
重要：
1. 你解读的就是{card_info['name']}，不要说成其他牌
2. 不要下最终结论，等待后续牌面"""


def _get_llm() -> ChatAnthropic:
    """获取 LLM 实例"""
    return ChatAnthropic(
        model=settings.mimo_model_name,
        api_key=settings.mimo_api_key,
        base_url=settings.mimo_api_base,
        temperature=0.7,    # 稍低一点，减少随机性
        max_tokens=800,     # 单张牌解读不需要太长
    )


async def generate_reading(question: str, cards: list[dict]) -> str:
    """一次性生成完整解读"""
    llm = _get_llm()
    prompt = _build_prompt(question, cards)

    response = await llm.ainvoke([
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=prompt),
    ])
    return response.content


async def generate_reading_stream(
    question: str,
    cards: list[dict],
    total_cards: int = 1,
    current_index: int = 0,
    is_combined: bool = False,
) -> AsyncGenerator[str, None]:
    """流式生成解读（SSE 用）"""
    # 综合解读用更多 token
    if is_combined:
        llm = ChatAnthropic(
            model=settings.mimo_model_name,
            api_key=settings.mimo_api_key,
            base_url=settings.mimo_api_base,
            temperature=0.7,
            max_tokens=1500,
        )
    else:
        llm = _get_llm()
    prompt = _build_prompt(question, cards, total_cards, current_index, is_combined)

    async for chunk in llm.astream([
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=prompt),
    ]):
        if hasattr(chunk, 'content') and chunk.content:
            if isinstance(chunk.content, str):
                yield chunk.content
            elif isinstance(chunk.content, list):
                for item in chunk.content:
                    if isinstance(item, dict) and item.get('type') == 'content':
                        yield item.get('text', '')
