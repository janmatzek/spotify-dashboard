import datetime

import sqlalchemy
from sqlmodel import Field, SQLModel

from src.db.schemas.reusable_fields.track_fields import TrackFields


class TracksLast24Hours(TrackFields, SQLModel, table=True):
    """Table to store tracks played in the last 24 hours."""

    row_id: int | None = Field(default=None, primary_key=True)
    played_at: datetime.datetime = Field(
        sa_column=sqlalchemy.Column(
            sqlalchemy.DateTime(timezone=True), nullable=False
        )
    )
    queried_at: datetime.datetime = Field(
        sa_column=sqlalchemy.Column(
            sqlalchemy.DateTime(timezone=True), nullable=False
        )
    )
