"""
Module to load environment variables and app configuration
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI

from src.db.db import Database
from src.scheduler.scheduler import Scheduler
from src.spotify_api.spotify_api import SpotifyAPI
from src.utils.environment import (
    Config,
    SpotifyConfig,
    get_db_connection_string,
)
from src.utils.logging import get_logger
from src.utils.responses import ResponseManager

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan for the FastAPI app."""

    # Application startup
    app.state.db = Database(get_db_connection_string())
    app.state.spotify_secrets = SpotifyConfig()
    app.state.config = Config()
    app.state.response_manager = ResponseManager(config=app.state.config)
    app.state.spotify_api = SpotifyAPI(db=app.state.db, config=app.state.config)

    app.state.scheduler = Scheduler(app.state.spotify_api)

    logger.info(
        f"Application startup complete. Environment: {app.state.config.environment}"
    )

    yield

    # Application shutdown
    app.state.scheduler.stop_execution_loop()
