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

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
