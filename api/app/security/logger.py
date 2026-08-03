"""安全日志配置"""

import logging

security_logger = logging.getLogger("security")
security_logger.setLevel(logging.WARNING)

if not security_logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(
        "[SECURITY] %(asctime)s | %(levelname)s | %(message)s"
    ))
    security_logger.addHandler(handler)
