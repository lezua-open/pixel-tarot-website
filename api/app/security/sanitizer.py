"""输入/输出清洗"""

import re
import unicodedata

STRIP_PATTERNS = [
    r"<script[^>]*>.*?</script>",
    r"<[^>]+>",
    r"javascript:",
    r"data:text/html",
    r"vbscript:",
    r"data:application/",
]


def _normalize_unicode(text: str) -> str:
    return unicodedata.normalize("NFKC", text)


def sanitize_input(text: str) -> str:
    """清洗用户输入，移除潜在危险内容。"""
    result = _normalize_unicode(text).strip()

    for pattern in STRIP_PATTERNS:
        result = re.sub(pattern, "", result, flags=re.IGNORECASE | re.DOTALL)

    # 移除控制字符（保留换行和空格）
    result = "".join(
        ch for ch in result
        if ch in ("\n", "\r", "\t", " ") or not unicodedata.category(ch).startswith("C")
    )

    result = re.sub(r"\s+", " ", result).strip()
    return result


def sanitize_response(text: str) -> str:
    """清洗 LLM 响应，防止 XSS。在返回给前端前调用。"""
    if not text:
        return text

    result = re.sub(r"<script[^>]*>.*?</script>", "", text, flags=re.IGNORECASE | re.DOTALL)
    result = re.sub(r"<[^>]+>", "", result)
    result = re.sub(r"javascript:", "", result, flags=re.IGNORECASE)

    return result
