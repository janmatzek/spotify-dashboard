import datetime

import sqlalchemy
from sqlmodel import Field, SQLModel

from src.db.schemas.reusable_fields.track_fields import TrackFields


class Tracks(TrackFields, SQLModel, table=True):
    """Table to store recently played tracks."""

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
