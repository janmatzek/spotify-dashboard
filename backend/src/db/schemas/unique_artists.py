from sqlmodel import Field, SQLModel


class UniqueArtists(SQLModel, table=True):
    """Table to store unique artist IDs."""

    artist_id: str = Field(primary_key=True)
