"""安全模块：输入过滤、Prompt 注入检测、SQL 注入防护、响应清洗、日志审计"""

import re
import logging
import unicodedata
from typing import Optional

# ── 安全日志 ─────────────────────────────────────────────────────────────────

security_logger = logging.getLogger("security")
security_logger.setLevel(logging.WARNING)

# 如果没有 handler，添加一个
if not security_logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(
        "[SECURITY] %(asctime)s | %(levelname)s | %(message)s"
    ))
    security_logger.addHandler(handler)


# ── Prompt 注入检测 ──────────────────────────────────────────────────────────

INJECTION_PATTERNS = [
    # 直接指令覆盖
    r"忽略(之前|以上|所有|之前的)(的)?(规则|指令|提示|约束)",
    r"ignore\s+(all\s+)?(previous|above|prior)\s+(rules|instructions|prompts)",
    r"forget\s+(all\s+)?(previous|above|prior)\s+(rules|instructions)",
    r"disregard\s+(all\s+)?(previous|above)\s+(instructions|rules)",
    r"override\s+(all\s+)?(previous|above)\s+(instructions|rules)",

    # 角色劫持
    r"你现在是(一个)?(?!塔罗|占卜|神秘)",
    r"你不再是",
    r"从现在起你是",
    r"act\s+as\s+(?:a\s+)?(?!tarot|fortune|mystic)",
    r"pretend\s+(?:to\s+be|you(?:'re|\s+are))\s+(?!a\s+tarot)",
    r"you\s+are\s+now\s+(?:a\s+)?(?!tarot)",

    # 系统信息提取
    r"(你的|你的)(系统|后台|服务器|数据库|密码|密钥|key|token|secret)",
    r"(show|reveal|tell|give)\s+(me\s+)?(your|the)\s+(system|backend|server|database|password|key|token|secret|prompt)",
    r"(输出|显示|打印|告诉我)(你的|系统的|后台的)(prompt|指令|规则|配置)",
    r"what\s+(?:is|are)\s+your\s+(?:system\s+)?(?:prompt|instructions|rules)",

    # 代码注入
    r"<script[^>]*>",
    r"javascript:",
    r"on\w+\s*=",
    r"eval\s*\(",
    r"exec\s*\(",
    r"__import__",
    r"subprocess",

    # SQL 注入
    r"'\s*(OR|AND)\s+'",
    r"'\s*;\s*(DROP|DELETE|UPDATE|INSERT|ALTER)",
    r"UNION\s+SELECT",
    r"--\s*$",
    r"/\*.*\*/",

    # 越狱尝试
    r"DAN\s+mode",
    r"do\s+anything\s+now",
    r"jailbreak",
    r"bypass\s+(?:all\s+)?(?:safety|content|filter)",
    r"(?:假装|假设|模拟)(?:你)?(?:没有|不存在)(?:任何)?(?:限制|规则|约束)",

    # 编码绕过尝试
    r"\\u[0-9a-fA-F]{4}",
    r"\\x[0-9a-fA-F]{2}",
    r"%[0-9a-fA-F]{2}",
]

# 需要移除的危险字符/标签
STRIP_PATTERNS = [
    r"<script[^>]*>.*?</script>",
    r"<[^>]+>",
    r"javascript:",
    r"data:text/html",
    r"vbscript:",
    r"data:application/",
]


def _normalize_unicode(text: str) -> str:
    """Unicode 标准化，防止编码绕过。"""
    # NFKC 标准化：兼容分解后再标准组合
    return unicodedata.normalize("NFKC", text)


def detect_prompt_injection(text: str) -> Optional[str]:
    """
    检测 Prompt 注入攻击。
    返回匹配的模式描述，如果安全则返回 None。
    """
    # 先做 Unicode 标准化
    normalized = _normalize_unicode(text)
    text_lower = normalized.lower().strip()

    for pattern in INJECTION_PATTERNS:
        match = re.search(pattern, text_lower)
        if match:
            security_logger.warning(
                f"Prompt injection detected: pattern={pattern}, match='{match.group()}', input='{text[:100]}...'"
            )
            return f"检测到可疑内容: {match.group()}"

    return None


# ── 输入清洗 ─────────────────────────────────────────────────────────────────

def sanitize_input(text: str) -> str:
    """清洗用户输入，移除潜在危险内容。"""
    # Unicode 标准化
    result = _normalize_unicode(text)
    result = result.strip()

    # 移除 HTML 标签和脚本
    for pattern in STRIP_PATTERNS:
        result = re.sub(pattern, "", result, flags=re.IGNORECASE | re.DOTALL)

    # 移除控制字符（保留换行和空格）
    result = "".join(
        ch for ch in result
        if ch in ("\n", "\r", "\t", " ") or not unicodedata.category(ch).startswith("C")
    )

    # 移除多余空白
    result = re.sub(r"\s+", " ", result).strip()

    return result


# ── 响应清洗 ─────────────────────────────────────────────────────────────────

def sanitize_response(text: str) -> str:
    """
    清洗 LLM 响应，防止 XSS。
    在返回给前端前调用。
    """
    if not text:
        return text

    # 移除可能的脚本标签
    result = re.sub(r"<script[^>]*>.*?</script>", "", text, flags=re.IGNORECASE | re.DOTALL)
    result = re.sub(r"<[^>]+>", "", result)

    # 移除 javascript: 协议
    result = re.sub(r"javascript:", "", result, flags=re.IGNORECASE)

    return result


# ── 内容过滤 ─────────────────────────────────────────────────────────────────

# 敏感词库（可根据需要扩展）
SENSITIVE_PATTERNS = [
    r"(?:自杀|轻生|结束生命|不想活)",
    r"(?:杀人|伤害他人|暴力)",
    r"(?:赌博|博彩|彩票预测)",
    r"(?:政治|领导人|敏感事件)",
]


def check_content_safety(text: str) -> tuple[bool, str]:
    """
    检查内容安全性。
    返回 (是否安全, 警告信息)。
    """
    text_lower = text.lower()

    for pattern in SENSITIVE_PATTERNS:
        if re.search(pattern, text_lower):
            security_logger.warning(f"Sensitive content detected: {pattern}")
            return False, "您的问题涉及敏感内容，请重新提问"

    return True, ""


# ── 输入验证 ─────────────────────────────────────────────────────────────────

def validate_question(text: str) -> tuple[bool, str]:
    """
    验证用户问题是否合法。
    返回 (是否合法, 错误信息)。
    """
    # 长度检查
    if not text or len(text.strip()) == 0:
        return False, "问题不能为空"

    if len(text) > 500:
        return False, "问题过长，请控制在500字以内"

    # 清洗
    cleaned = sanitize_input(text)

    # 注入检测
    injection = detect_prompt_injection(cleaned)
    if injection:
        return False, "输入内容包含不允许的内容，请重新提问"

    # 内容安全检查
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

    # card_id 范围检查
    if not isinstance(card["card_id"], int) or not (0 <= card["card_id"] <= 21):
        return False, "无效的牌面 ID"

    # reversed 类型检查
    if not isinstance(card["reversed"], bool):
        return False, "reversed 字段必须是布尔值"

    # 字符串长度检查
    for str_field in ["card_name", "card_en"]:
        if len(str(str_field)) > 50:
            return False, f"{str_field} 过长"

    return True, ""


# ── 速率限制 ─────────────────────────────────────────────────────────────────

from collections import defaultdict
import time

_request_counts: dict[str, list[float]] = defaultdict(list)

RATE_LIMIT_WINDOW = 60  # 秒
RATE_LIMIT_MAX = 30     # 窗口内最大请求数


def check_rate_limit(client_ip: str) -> tuple[bool, str]:
    """
    检查速率限制。
    返回 (是否允许, 错误信息)。
    """
    now = time.time()
    window_start = now - RATE_LIMIT_WINDOW

    # 清理过期记录
    _request_counts[client_ip] = [
        t for t in _request_counts[client_ip] if t > window_start
    ]

    # 检查是否超限
    if len(_request_counts[client_ip]) >= RATE_LIMIT_MAX:
        security_logger.warning(f"Rate limit exceeded: ip={client_ip}")
        return False, "请求过于频繁，请稍后再试"

    # 记录本次请求
    _request_counts[client_ip].append(now)

    return True, ""
