FROM python:3.12-slim

WORKDIR /app

# 安装依赖
COPY pyproject.toml .
RUN pip install --no-cache-dir fastapi uvicorn sqlalchemy pymysql pydantic-settings langchain-anthropic

# 复制代码
COPY . .

# 暴露端口（Zeabur 会通过 PORT 环境变量指定）
EXPOSE ${PORT:-8000}

# 启动命令（使用环境变量 PORT）
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
