from sqlmodel import Field, SQLModel


class TopGenres(SQLModel, table=True):
    """Table to store top genres."""

    row_id: int | None = Field(default=None, primary_key=True)
    genre: str
    count_tracks: int
