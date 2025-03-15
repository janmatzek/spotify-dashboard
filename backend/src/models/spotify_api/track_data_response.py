from pydantic import BaseModel

from src.models.spotify_api.external_urls import ExternalUrls
from src.models.spotify_api.image import Image


class Album(BaseModel):
    album_type: str
    id: str
    name: str
    release_date: str
    release_date_precision: str
    total_tracks: int
    images: list[Image]


class Artist(BaseModel):
    id: str
    name: str
    type: str


class Track(BaseModel):
    name: str
    explicit: bool
    duration_ms: int
    popularity: int
    id: str
    track_number: int
    type: str
    album: Album
    artists: list[Artist]


class Context(BaseModel):
    type: str
    external_urls: ExternalUrls


class Item(BaseModel):
    track: Track
    played_at: str
    context: Context | None = None


class TrackDataResponse(BaseModel):
    """Wrapper model for the Spotify API recently played tracks response."""

    items: list[Item]
