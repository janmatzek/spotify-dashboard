from datetime import datetime, timedelta
from typing import Protocol

from sqlalchemy import Date, cast, func
from sqlalchemy.engine import Engine
from sqlmodel import (
    Session,
    col,
    select,
)

from src.db.schemas.artist_data import ArtistsData
from src.db.schemas.top_artists import TopArtists
from src.db.schemas.top_genres import TopGenres
from src.db.schemas.track_data import Tracks
from src.db.schemas.tracks_average_utc import (
    TracksAverageUTC,
    TracksAverageUTCLast24,
)
from src.db.schemas.tracks_last_24_hours import TracksLast24Hours
from src.db.schemas.unique_artists import UniqueArtists
from src.utils.logging import get_logger

logger = get_logger(__name__)


class DatabaseProtocol(Protocol):
    engine: Engine


class Queries:
    """Class to handle the regular  database queries.

    The class gathers all the public methods (aka queries) and exposes them as a
    list of functions.
    """

    def __init__(self, db: DatabaseProtocol) -> None:
        self.db = db
        self.queries = [
            getattr(self, method)
            for method in dir(self)
            if callable(getattr(self, method)) and not method.startswith("_")
        ]

    def reload_unique_artists(self) -> None:
        """Reload the UniqueArtists table."""
        with Session(self.db.engine) as session:
            # Delete existing unique artists in UniqueArtists table
            existing_artists = session.exec(select(UniqueArtists)).all()
            for artist in existing_artists:
                session.delete(artist)

            # Get all unique artist IDs from TrackData table
            unique_artists = session.exec(
                select(Tracks.track_artists_id).distinct()
            )
            unique_artists_list = list(unique_artists)

            # Insert new unique artists into UniqueArtists table
            artists_to_insert = [
                UniqueArtists(artist_id=artist_id)
                for artist_id in unique_artists_list
            ]
            session.add_all(artists_to_insert)

            # Commit the changes to the database
            session.commit()

            logger.info(
                f"UniqueArtists refreshed with {len(artists_to_insert)} artists"
            )

    def reload_top_genres(self) -> None:
        """Reload the TopGenres table."""
        with Session(self.db.engine) as session:
            # Remove existing data from TopGenres table
            existing_data = session.exec(select(TopGenres)).all()
            for row in existing_data:
                session.delete(row)

            # Get the count of tracks per artist
            count_tracks_by_atist_id = select(
                Tracks.track_artists_id,
                func.count(col(Tracks.track_id)).label("count_tracks"),
            ).group_by(Tracks.track_artists_id)

            # Join with genre to get unaggregated tracks per genre
            tracks_per_genre = select(
                ArtistsData.main_genre,
                count_tracks_by_atist_id.c.count_tracks,
            ).where(
                ArtistsData.id == count_tracks_by_atist_id.c.track_artists_id
            )

            # Aggregate the tracks per genre
            agg_tracks_per_genre = (
                select(
                    tracks_per_genre.c.main_genre.label("genre"),
                    func.sum(tracks_per_genre.c.count_tracks).label(
                        "count_tracks"
                    ),
                )
                .where(tracks_per_genre.c.main_genre.isnot(None))
                .group_by(tracks_per_genre.c.main_genre)
                .order_by(func.sum(tracks_per_genre.c.count_tracks).desc())
            )

            # Insert the top genres into the TopGenres table
            top_genres = session.exec(agg_tracks_per_genre).all()
            top_genres_to_insert = [
                TopGenres(genre=genre, count_tracks=count_tracks)
                for genre, count_tracks in top_genres
            ]
            session.add_all(top_genres_to_insert)

            # Commit the changes to the database
            session.commit()

            logger.info(f"TopGenres refreshed with {len(top_genres)} genres")

    def reload_top_artists(self) -> None:
        """Reload the TopArtists table."""
        with Session(self.db.engine) as session:
            # Remove existing data from TopArtists table
            existing_data = session.exec(select(TopArtists)).all()
            for row in existing_data:
                session.delete(row)

            # Get the count of tracks per artist
            count_tracks_by_artist_id = select(
                Tracks.track_artists_id,
                func.count(col(Tracks.track_id)).label("count_tracks"),
            ).group_by(Tracks.track_artists_id)

            # Join with artist data to get all artist fields plus track count
            tracks_per_artist = (
                select(
                    ArtistsData,
                    count_tracks_by_artist_id.c.count_tracks,
                )
                .where(
                    ArtistsData.id
                    == count_tracks_by_artist_id.c.track_artists_id
                )
                .order_by(count_tracks_by_artist_id.c.count_tracks.desc())
                .limit(5)
            )

            # Execute the query
            top_artists_results = session.exec(tracks_per_artist).all()

            # Prepare the data for insertion
            top_artists_to_insert = []
            for artist_data, count_tracks in top_artists_results:
                # Create TopArtists with all artist fields plus count_tracks
                top_artist = TopArtists(
                    **artist_data.model_dump(),
                    count_tracks=count_tracks,
                )
                top_artists_to_insert.append(top_artist)

            # Insert the top artists into the TopArtists table
            session.add_all(top_artists_to_insert)

            # Commit the changes to the database
            session.commit()

            logger.info(
                f"TopArtists refreshed with {len(top_artists_to_insert)} artists"
            )

    def reload_tracks_last_24(self) -> None:
        """Reload the TracksLast24Hours table."""
        with Session(self.db.engine) as session:
            # Remove existing data from TracksLast24Hours table
            existing_data = session.exec(select(TracksLast24Hours)).all()
            for row in existing_data:
                session.delete(row)

            # Query the last 24 hours of tracks
            last_24_hours = session.exec(
                select(Tracks).where(
                    Tracks.played_at >= datetime.now() - timedelta(hours=24)
                )
            ).all()

            # Prepare the data for insertion
            validated_data = []
            for track in last_24_hours:
                validated_data.append(
                    TracksLast24Hours(
                        **track.model_dump(),
                    )
                )

            session.add_all(validated_data)
            session.commit()
            logger.info(
                f"TracksLast24Hours refreshed with {len(validated_data)} tracks"
            )

    def reload_tracks_average_utc(self) -> None:
        """Reload the TracksAverageUTC table."""
        with Session(self.db.engine) as session:
            # Remove existing data
            existing_data = session.exec(select(TracksAverageUTC)).all()
            for row in existing_data:
                session.delete(row)

            # First query: count tracks per date and hour
            daily_hourly_counts = (
                select(
                    cast(func.date(Tracks.played_at), Date).label(
                        "date_played_at"
                    ),
                    func.extract("hour", col(Tracks.played_at)).label(
                        "hour_played_at"
                    ),
                    func.count(col(Tracks.track_id)).label("track_count"),
                ).group_by(
                    cast(func.date(Tracks.played_at), Date),
                    func.extract("hour", col(Tracks.played_at)),
                )
            ).subquery()

            # Second query: average counts per hour across all days
            avg_by_hour = (
                select(
                    daily_hourly_counts.c.hour_played_at,
                    func.avg(daily_hourly_counts.c.track_count).label(
                        "avg_tracks"
                    ),
                )
                .group_by(daily_hourly_counts.c.hour_played_at)
                .order_by(daily_hourly_counts.c.hour_played_at)
            )

            # Execute the query
            avg_results = session.exec(avg_by_hour).all()
            avg_dict = {int(hour): float(avg) for hour, avg in avg_results}

            # Fill missing hours (0–23) with 0
            rows_to_insert = []
            for hour in range(24):
                avg_tracks = avg_dict.get(hour, 0.0)
                rows_to_insert.append(
                    TracksAverageUTC(
                        hour_played_at=hour, track_count=avg_tracks
                    )
                )

            # Insert into TracksAverageUTC table
            session.add_all(rows_to_insert)
            session.commit()

            logger.info(
                f"TracksAverageUTC refreshed with {len(rows_to_insert)} rows"
            )

    def reload_hourly_tracks_count_last_24(self) -> None:
        """Reload the TracksAverageUTCLast24 table."""
        with Session(self.db.engine) as session:
            # Remove existing data
            existing_data = session.exec(select(TracksAverageUTCLast24)).all()
            for row in existing_data:
                session.delete(row)

            # Query the average tracks per hour¨
            avg_tracks_per_hour = session.exec(
                select(
                    func.extract("hour", col(Tracks.played_at)).label(
                        "hour_played_at"
                    ),
                    func.count(col(Tracks.track_id)).label("track_count"),
                )
                .where(Tracks.played_at >= datetime.now() - timedelta(hours=24))
                .group_by(func.extract("hour", col(Tracks.played_at)))
                .order_by(func.extract("hour", col(Tracks.played_at)))
            ).all()

            # Convert data to a list of dicts
            dict_list = []
            included_hours = []

            for hour, track_count in avg_tracks_per_hour:
                dict_list.append(
                    {
                        "hour_played_at": hour,
                        "track_count": track_count,
                    }
                )
                included_hours.append(hour)

            # Create a list of hours from 0 to 23
            hours = [i for i in range(24)]

            # Make sure that all hours are represented in the dict
            for hour in hours:
                if hour not in included_hours:
                    dict_list.append(
                        {
                            "hour_played_at": hour,
                            "track_count": 0,
                        }
                    )

            # Prepare the data for insertion
            validated_data = [
                TracksAverageUTCLast24(**item) for item in dict_list
            ]

            session.add_all(validated_data)

            session.commit()
