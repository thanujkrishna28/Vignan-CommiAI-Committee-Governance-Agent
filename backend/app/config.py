from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Vignan CommiAI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = ""

    # JWT
    JWT_SECRET_KEY: str = "change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # Email (Brevo SMTP & REST API)
    BREVO_API_KEY: str = ""
    BREVO_SMTP_SERVER: str = "smtp-relay.brevo.com"
    BREVO_SMTP_PORT: int = 587
    BREVO_SMTP_LOGIN: str = "9f54d6001@smtp-brevo.com"
    BREVO_SMTP_KEY: str = ""
    EMAIL_FROM: str = "thanujkrishna22@gmail.com"
    EMAIL_FROM_NAME: str = "Vignan University"

    # Gemini
    GEMINI_API_KEY: str = ""

    # LangSmith
    LANGCHAIN_TRACING_V2: bool = True
    LANGCHAIN_API_KEY: str = ""
    LANGCHAIN_PROJECT: str = "vignan-commiai"

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,https://vignan-commiai-frontend-nxe3rvrm1n.vercel.app,*"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
