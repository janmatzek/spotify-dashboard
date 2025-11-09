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


def get_secret(secret_name: str) -> str | None:
    """
    Read a Docker secret from /run/secrets/<secret_name>.
    Returns None if the secret file doesn't exist.
    """
    secret_path = Path("/run/secrets") / secret_name
    if secret_path.exists():
        return secret_path.read_text().strip()
    return None


def get_env_var(variable_name: str, default_value: str | None = None) -> str:
    """
    Loads a variable from the environment or Docker secrets.
    In production, tries to read from Docker secrets first, then falls
    back to environment variables.
    Returns the variable as string.
    Raises a value error if variable value is None and no default value
    is provided.
    """
    value = None

    # In production, try Docker secrets first
    if ENVIRONMENT == EnvType.PROD:
        value = get_secret(variable_name.lower())

    # Fall back to environment variable
    if value is None:
        value = os.getenv(variable_name)

    if value is None:
        if default_value is None:
            raise ValueError(
                f"Environment variable {variable_name} not set"
            )
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
    backend_port: int = int(get_env_var("BACKEND_PORT"))


def get_db_connection_string() -> str:
    """
    Get the database connection string.
    In production, builds the connection string using the db_password
    Docker secret.
    In development, uses the DB_CONNECTION_STRING environment variable.
    """
    if ENVIRONMENT == EnvType.PROD:
        # In production, build connection string from secrets
        db_password = get_secret("db_password")
        if db_password is None:
            raise ValueError("db_password secret not found")
        return (
            f"postgresql://postgres:{db_password}@db:5432/spotify_data"
        )
    else:
        # In development, use environment variable
        return get_env_var("DB_CONNECTION_STRING")
