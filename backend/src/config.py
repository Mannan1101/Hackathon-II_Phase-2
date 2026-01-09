"""
Database configuration module.

Loads database connection settings from environment variables.
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    """Application settings loaded from environment variables."""

    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "")

    def __init__(self):
        if not self.DATABASE_URL:
            raise ValueError(
                "DATABASE_URL environment variable is required. "
                "Please set it in your .env file."
            )

        if not self.JWT_SECRET:
            raise ValueError(
                "JWT_SECRET environment variable is required. "
                "Please set it in your .env file."
            )

        if len(self.JWT_SECRET) < 32:
            raise ValueError(
                "JWT_SECRET must be at least 32 characters long for HS256 security. "
                "Generate a strong secret using: openssl rand -base64 32"
            )

# Global settings instance
settings = Settings()
