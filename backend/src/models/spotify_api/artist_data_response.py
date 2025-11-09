from pydantic import BaseModel

from src.models.spotify_api.external_urls import ExternalUrls
from src.models.spotify_api.image import Image


class Followers(BaseModel):
    href: str | None = None
    total: int


class Artist(BaseModel):
    external_urls: ExternalUrls
    followers: Followers
    genres: list[str] | None = None
    href: str | None = None
    id: str
    images: list[Image] | None = None
    name: str
    popularity: int
    type: str
    uri: str


class ArtistDataResponse(BaseModel):
    """Wrapper model for the Spotify API artists data response."""

    artists: list[Artist]
