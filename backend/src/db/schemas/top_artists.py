from sqlmodel import Field, SQLModel

from src.db.schemas.reusable_fields.artist_fields import ArtistFields


class TopArtists(ArtistFields, SQLModel, table=True):
    """Table to store top artists data."""

    row_id: int | None = Field(default=None, primary_key=True)
    count_tracks: int
