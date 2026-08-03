"""内存速率限制"""

import time
from collections import defaultdict

from .logger import security_logger

_request_counts: dict[str, list[float]] = defaultdict(list)

RATE_LIMIT_WINDOW = 60  # 秒
RATE_LIMIT_MAX = 30     # 窗口内最大请求数


def check_rate_limit(client_ip: str) -> tuple[bool, str]:
    """检查速率限制。返回 (是否允许, 错误信息)。"""
    now = time.time()
    window_start = now - RATE_LIMIT_WINDOW

    _request_counts[client_ip] = [
        t for t in _request_counts[client_ip] if t > window_start
    ]

    if len(_request_counts[client_ip]) >= RATE_LIMIT_MAX:
        security_logger.warning(f"Rate limit exceeded: ip={client_ip}")
        return False, "请求过于频繁，请稍后再试"

    _request_counts[client_ip].append(now)
    return True, ""
