from sqlmodel import Field, SQLModel


class TracksAverageUTC(SQLModel, table=True):
    """Table to store average number of tracks played per hour of day."""

    hour_played_at: int = Field(primary_key=True)
    track_count: float


class TracksAverageUTCLast24(SQLModel, table=True):
    """Table to store the count of tracks played per hour of day during last 24 hours."""

    hour_played_at: int = Field(primary_key=True)
    track_count: float
