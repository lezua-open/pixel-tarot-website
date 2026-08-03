"""内容安全过滤"""

import re

from .logger import security_logger
from .injection import detect_prompt_injection
from .sanitizer import sanitize_input

SENSITIVE_PATTERNS = [
    r"(?:自杀|轻生|结束生命|不想活)",
    r"(?:杀人|伤害他人|暴力)",
    r"(?:赌博|博彩|彩票预测)",
    r"(?:政治|领导人|敏感事件)",
]


def check_content_safety(text: str) -> tuple[bool, str]:
    """检查内容安全性。返回 (是否安全, 警告信息)。"""
    text_lower = text.lower()

    for pattern in SENSITIVE_PATTERNS:
        if re.search(pattern, text_lower):
            security_logger.warning(f"Sensitive content detected: {pattern}")
            return False, "您的问题涉及敏感内容，请重新提问"

    return True, ""


def validate_question(text: str) -> tuple[bool, str]:
    """验证用户问题是否合法。返回 (是否合法, 错误信息)。"""
    if not text or len(text.strip()) == 0:
        return False, "问题不能为空"

    if len(text) > 500:
        return False, "问题过长，请控制在500字以内"

    cleaned = sanitize_input(text)

    injection = detect_prompt_injection(cleaned)
    if injection:
        return False, "输入内容包含不允许的内容，请重新提问"

    safe, msg = check_content_safety(cleaned)
    if not safe:
        return False, msg

    return True, ""


def validate_card_data(card: dict) -> tuple[bool, str]:
    """验证牌面数据是否合法。"""
    required_fields = ["card_id", "card_name", "card_en", "reversed"]

    for field in required_fields:
        if field not in card:
            return False, f"缺少必要字段: {field}"

    if not isinstance(card["card_id"], int) or not (0 <= card["card_id"] <= 21):
        return False, "无效的牌面 ID"

    if not isinstance(card["reversed"], bool):
        return False, "reversed 字段必须是布尔值"

    for str_field in ["card_name", "card_en"]:
        if len(str(str_field)) > 50:
            return False, f"{str_field} 过长"

    return True, ""
