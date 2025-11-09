import os
from enum import StrEnum
from pathlib import Path

from dotenv import load_dotenv


class EnvType(StrEnum):
    PROD = "prod"
    DEV = "dev"


ENVIRONMENT: EnvType = EnvType(os.getenv("ENVIRONMENT", "prod"))

if ENVIRONMENT == EnvType.DEV:
    # Load local .env for developer convenience but do not override
    # values already provided via the environment (e.g., docker-compose)
    dotenv_path = Path(__file__).resolve().parent.parent.parent / ".env"
    load_dotenv(dotenv_path=dotenv_path, override=False)
else:
    # If we are in prod, load the env variables directly from the environment
    pass


def get_env_var(variable_name: str, default_value: str | None = None) -> str:
    """
    Loads a variable from the environment.
    Returns the variable as string.
    Raises a value error if varaible value is None and no default value is provided.
    """
    value = os.getenv(variable_name)

    if value is None:
        if default_value is None:
            raise ValueError(f"Environment variable {variable_name} not set")
        else:
            return default_value

    return value


class SpotifyConfig:
    """Spotify API secrets."""

    client_id: str = get_env_var("SPOTIFY_CLIENT_ID")
    client_secret: str = get_env_var("SPOTIFY_CLIENT_SECRET")
    refresh_token: str = get_env_var("REFRESH_TOKEN")


class Config:
    """Configuration for the backend API."""

    environment: EnvType = ENVIRONMENT
    frontend_port: int = int(get_env_var("FRONTEND_PORT"))
