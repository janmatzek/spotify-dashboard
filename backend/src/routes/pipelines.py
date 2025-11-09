from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from src.spotify_api.spotify_api import SpotifyAPI
from src.utils.logging import get_logger

logger = get_logger(__name__)

pipelines = APIRouter(prefix="/pipelines", tags=["pipelines"])


@pipelines.get("/track_data")
async def get_track_data(request: Request) -> JSONResponse:
    """Retrieves, validates and stores data for recently played tracks."""
    logger.info(f"Endpoint called: {request.url.path}")
    spotify_api: SpotifyAPI = request.app.state.spotify_api
    response = await spotify_api.get_track_data()
    return response


@pipelines.get("/artist_data")
async def get_artists_data(request: Request) -> JSONResponse:
    """Retrieves, validates and stores data for artists."""
    logger.info(f"Endpoint called: {request.url.path}")
    spotify_api: SpotifyAPI = request.app.state.spotify_api
    response = await spotify_api.get_artists_data()
    return response
