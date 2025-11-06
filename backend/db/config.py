from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database Configuration
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/tutor_system"
    DB_POOL_MIN_SIZE: int = 5
    DB_POOL_MAX_SIZE: int = 20
    DB_COMMAND_TIMEOUT: int = 60

    # Server Configuration
    HOST: str = "127.0.0.1"
    PORT: int = 3001
    DEBUG: bool = True
    RELOAD: bool = True

    # API Configuration
    API_TITLE: str = "Tutor Support System API"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "API for managing tutoring sessions and users"

    # CORS Configuration
    ALLOWED_ORIGINS: str = "http://localhost:5173"

    # Use model_config instead of Config class (Pydantic v2)
    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore"
    }

    @property
    def server_url(self) -> str:
        """Get the full server URL"""
        return f"http://{self.HOST}:{self.PORT}"

    @property
    def docs_url(self) -> str:
        """Get the API documentation URL"""
        return f"{self.server_url}/docs"

    @property
    def redoc_url(self) -> str:
        """Get the ReDoc documentation URL"""
        return f"{self.server_url}/redoc"

    @property
    def allowed_origins_list(self) -> List[str]:
        """Convert ALLOWED_ORIGINS string to list"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


settings = Settings()