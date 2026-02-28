from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    host: str = "0.0.0.0"
    port: int = 8083
    cors_origins: list[str] = ["http://localhost:3000"]
    window_size: int = 30
    warning_cooldown_seconds: float = 5.0

    class Config:
        env_prefix = "VISION_"
        env_file = ".env"


settings = Settings()
