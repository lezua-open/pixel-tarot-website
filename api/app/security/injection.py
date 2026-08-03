"""Prompt 注入检测"""

import re
import unicodedata
from typing import Optional

from .logger import security_logger

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


def _normalize_unicode(text: str) -> str:
    """Unicode 标准化，防止编码绕过。"""
    return unicodedata.normalize("NFKC", text)


def detect_prompt_injection(text: str) -> Optional[str]:
    """
    检测 Prompt 注入攻击。
    返回匹配的模式描述，如果安全则返回 None。
    """
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
