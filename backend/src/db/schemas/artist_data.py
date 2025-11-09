from datetime import datetime

import sqlalchemy
from sqlmodel import Field, SQLModel

from src.db.schemas.reusable_fields.artist_fields import ArtistFields


class ArtistsData(ArtistFields, SQLModel, table=True):
    """Table to store artist data."""

    row_id: int | None = Field(default=None, primary_key=True)
    queried_at: datetime = Field(
        sa_column=sqlalchemy.Column(
            sqlalchemy.DateTime(timezone=True), nullable=False
        )
    )
