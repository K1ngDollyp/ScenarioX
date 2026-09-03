from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "ScenarioX"
    PROJECT_TITLE: str = "ScenarioX: An AI-Powered Scenario Simulation and Decision Support Platform"
    TAGLINE: str = "Simulate Decisions. Understand Outcomes."
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    PORT: int = 8000
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/scenariox"
    
    # Supabase Auth
    SUPABASE_URL: str = "https://your-supabase-project.supabase.co"
    SUPABASE_ANON_KEY: str = "your-supabase-anon-key"
    SUPABASE_SERVICE_ROLE_KEY: str = "your-supabase-service-role-key"
    SUPABASE_JWT_SECRET: str = "your-supabase-jwt-secret-key-placeholder"
    
    # AI Provider
    AI_PROVIDER: str = "gemini"
    AI_API_KEY: Optional[str] = None
    AI_MODEL: str = "gemini-1.5-pro"
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "*",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
