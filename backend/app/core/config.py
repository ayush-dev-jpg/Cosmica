# app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb://localhost:27017/cosmica"
    SECRET_KEY: str = "cosmica-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    OPENAI_API_KEY: str = ""
    CHROMA_DB_PATH: str = "./chroma_db"

    class Config:
        env_file = ".env"
        extra = "ignore"          # ← this line is the fix

settings = Settings()