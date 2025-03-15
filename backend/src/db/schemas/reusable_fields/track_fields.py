import datetime

import sqlmodel


class TrackFields:
    """Fields common to all track tables."""

    track_name: str
    track_explicit: bool
    track_popularity: int
    track_id: str
    track_track_number: int
    track_type: str
    played_at: datetime.datetime
    context_type: str = sqlmodel.Field(default="algorithm")
    context_external_urls_spotify: str | None
    track_artists_id: str | None
    track_artists_name: str | None
    track_artists_type: str | None
    track_album_album_type: str | None
    track_album_id: str | None
    track_album_images_url: str | None
    track_album_images_height: int | None
    track_album_name: str | None
    track_album_release_date: str | None
    track_album_release_date_precision: str | None
    track_album_total_tracks: int | None
    track_duration_ms: int
    queried_at: datetime.datetime
