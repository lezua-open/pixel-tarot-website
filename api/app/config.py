import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    database_url: str

    # MiMo Model
    mimo_api_key: str
    mimo_api_base: str
    mimo_model_name: str = "mimo-7b"

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # LangSmith
    langchain_tracing_v2: str = "false"
    langchain_api_key: str = ""
    langchain_project: str = "tarot-app"
    langchain_endpoint: str = "https://api.smith.langchain.com"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

# 设置 LangSmith 环境变量（LangChain 会自动读取）
if settings.langchain_tracing_v2.lower() == "true" and settings.langchain_api_key:
    os.environ["LANGCHAIN_TRACING_V2"] = "true"
    os.environ["LANGCHAIN_API_KEY"] = settings.langchain_api_key
    os.environ["LANGCHAIN_PROJECT"] = settings.langchain_project
    os.environ["LANGCHAIN_ENDPOINT"] = settings.langchain_endpoint
