import base64
import traceback
from datetime import datetime, timezone
from typing import Type

import requests
from fastapi.responses import JSONResponse
from sqlmodel import Session, func, select

from src.db.db import Database
from src.db.schemas.artist_data import ArtistsData
from src.db.schemas.track_data import Tracks
from src.db.schemas.unique_artists import UniqueArtists
from src.models.spotify_api.artist_data_response import ArtistDataResponse
from src.models.spotify_api.track_data_response import TrackDataResponse
from src.utils.environment import Config, SpotifyConfig
from src.utils.logging import get_logger
from src.utils.responses import ResponseManager

logger = get_logger(__name__)


class SpotifyAPI:
    """Handles interactions with the Spotify API."""

    def __init__(self, db: Database, config: Config) -> None:
        self.config: Config = config
        self.spotify_config: SpotifyConfig = SpotifyConfig()
        self.db: Database = db
        self.response_manager: ResponseManager = ResponseManager(config=config)

    async def get_track_data(self) -> JSONResponse:
        """Wrapper for the _get_track_data method to handle exceptions and return a response."""
        try:
            response = await self._get_track_data()
            return response
        except Exception as e:
            logger.error(f"Error in get_track_data: {e}")
            return self.response_manager.create_response(
                500, "An error occurred while processing track data.", e
            )

    async def get_artists_data(self) -> JSONResponse:
        """Wrapper for the _get_artists_data method to handle exceptions and return a response."""
        try:
            response = await self._get_artists_data()
            return response
        except Exception as e:
            logger.error(f"Error in get_artists_data: {e}")
            logger.error(traceback.format_exc())
            return self.response_manager.create_response(
                500, "An error occurred while processing artists data.", e
            )

    async def _get_track_data(self) -> JSONResponse:
        """Retrieves, validates and stores data for recently played tracks."""
        # Determine the last query date to use in the API call
        query_from: float = await self.get_query_from_timestamp()

        # Use refresh token to get a short-lived access token
        token: str = self.get_access_token()

        # Get the recently played tracks from Spotify API
        track_data: TrackDataResponse = self.get_recently_played_tracks(
            token, query_from
        )

        current_datetime: datetime = self.get_current_datetime()
        validated_data: list[Tracks] = self.validate_track_data(
            track_data,
            Tracks,
            current_datetime,
            query_from,
        )

        # Insert the data into the database
        await self.insert_track_data(validated_data)

        formatted_query_from = datetime.fromtimestamp(
            query_from, tz=timezone.utc
        ).strftime("%Y-%m-%d %H:%M:%S %Z")

        return self.response_manager.create_response(
            200,
            f"You have listened to {len(validated_data)} songs since {formatted_query_from}.",
        )

    async def insert_track_data(self, track_data: list[Tracks]) -> None:
        """Inserts track data into the database."""
        with Session(self.db.engine) as session:
            session.add_all(track_data)
            session.commit()

    async def get_query_from_timestamp(self) -> float:
        """Retrieves the last queried timestamp from the database."""
        with Session(self.db.engine) as session:
            statement = select(func.max(Tracks.played_at))
            timestamp = session.exec(statement).first()

        query_from: float = timestamp.timestamp() if timestamp else 1

        return query_from

    @staticmethod
    def get_current_datetime() -> datetime:
        """Returns the current UTC timestamp."""
        return datetime.now(tz=timezone.utc)

    def get_recently_played_tracks(
        self, access_token: str, query_from: float
    ) -> TrackDataResponse:
        """Makes the actual call to the Spotify API to retrieve the response."""

        url = f"https://api.spotify.com/v1/me/player/recently-played?limit=50&after={int(query_from)}"

        headers = {"Authorization": f"Bearer {access_token}"}

        response = requests.get(url=url, headers=headers, timeout=30)
        if not response.ok:
            raise Exception(
                f"Failed to retrieve data from Spotify API: {response.status_code} - {response.text}"
            )
        track_data = TrackDataResponse(**response.json())

        return track_data

    def validate_track_data(
        self,
        track_data: TrackDataResponse,
        output_model: Type[Tracks],
        current_datetime: datetime,
        query_from: float,
    ) -> list[Tracks]:
        """Creates a list of validated track data."""
        validated_items: list[Tracks] = []

        # Use unix timestamp for comparisons
        for item in track_data.items:
            # Get unix timestamp of played_at
            played_at_timestamp = datetime.fromisoformat(
                item.played_at
            ).timestamp()

            # Skip items that are older than the last queried timestamp
            if played_at_timestamp <= query_from:
                continue

            # Create a TrackDataSchema instance
            validated_item = output_model(
                track_name=item.track.name,
                track_explicit=item.track.explicit,
                track_popularity=item.track.popularity,
                track_id=item.track.id,
                track_track_number=item.track.track_number,
                track_type=item.track.type,
                played_at=datetime.fromisoformat(item.played_at),
                context_type=item.context.type if item.context else None,
                context_external_urls_spotify=item.context.external_urls.spotify
                if item.context
                else None,
                track_artists_id=item.track.artists[0].id,
                track_artists_name=item.track.artists[0].name,
                track_artists_type=item.track.artists[0].type,
                track_album_album_type=item.track.album.album_type,
                track_album_id=item.track.album.id,
                track_album_images_url=item.track.album.images[0].url,
                track_album_images_height=item.track.album.images[0].height,
                track_album_name=item.track.album.name,
                track_album_release_date=item.track.album.release_date,
                track_album_release_date_precision=item.track.album.release_date_precision,
                track_album_total_tracks=item.track.album.total_tracks,
                track_duration_ms=item.track.duration_ms,
                queried_at=current_datetime,
            )

            validated_items.append(validated_item)

        return validated_items

    def get_access_token(self) -> str:
        """Retrieve a short-lived access token from Spotify API.

        The token expires in 1 hour, so it is refreshed on every request as the
        data is fetched hourly.
        """

        url = "https://accounts.spotify.com/api/token"

        encoded_credentials = base64.b64encode(
            self.spotify_config.client_id.encode()
            + b":"
            + self.spotify_config.client_secret.encode()
        ).decode("utf-8")

        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": f"Basic {encoded_credentials}",
        }

        body = {
            "grant_type": "refresh_token",
            "refresh_token": self.spotify_config.refresh_token,
            "client_id": self.spotify_config.client_id,
        }

        response = requests.post(url, data=body, headers=headers, timeout=10)

        if not response.ok:
            raise Exception(f"Failed to refresh access token: {response.text}")

        response_data = response.json()

        token: str = response_data["access_token"]

        return token

    async def _get_artists_data(self) -> JSONResponse:
        """Fetch artists data from Spotify API."""

        artists_ids: list[str] = self.get_artist_ids()

        if len(artists_ids) == 0:
            return self.response_manager.create_response(
                202, "No new data to upload"
            )

        url = f"https://api.spotify.com/v1/artists?ids={','.join(artists_ids)}"

        access_token = self.get_access_token()

        headers = {"Authorization": f"Bearer {access_token}"}

        response = requests.get(url=url, headers=headers, timeout=10)
        raw_data: dict = response.json()
        data: ArtistDataResponse = ArtistDataResponse(**raw_data)

        current_datetime: datetime = self.get_current_datetime()

        processed_data: list[ArtistsData] = self.transform_spotify_artists_data(
            data, current_datetime
        )

        # insert data to the database
        with Session(self.db.engine) as session:
            session.add_all(processed_data)
            session.commit()

        return self.response_manager.create_response(
            200, f"Uploaded data about {len(processed_data)} artists"
        )

    def get_artist_ids(self) -> list[str]:
        """Retrieves artists ids from the database."""

        with Session(self.db.engine) as session:
            unique_artist_query = select(UniqueArtists.artist_id)
            result_unique_artists = session.exec(unique_artist_query).all()

            known_artists_query = select(ArtistsData.id)
            results_known_artists = session.exec(known_artists_query).all()

        unique_artist_ids: set[str] = set(result_unique_artists)
        known_artists_ids: set[str] = set(results_known_artists)

        unknown_artist_ids: set[str] = unique_artist_ids - known_artists_ids

        return list(unknown_artist_ids)

    def transform_spotify_artists_data(
        self, data: ArtistDataResponse, current_datetime: datetime
    ) -> list[ArtistsData]:
        """Transforms the data in the response model to the table model."""
        tabular_data: list[ArtistsData] = []
        for artist in data.artists:
            tabular_data.append(
                ArtistsData(
                    external_urls_spotify=artist.external_urls.spotify,
                    followers_total=artist.followers.total,
                    genres=artist.genres,
                    id=artist.id,
                    images_height=artist.images[0].height
                    if artist.images
                    else None,
                    images_url=artist.images[0].url if artist.images else None,
                    name=artist.name,
                    popularity=artist.popularity,
                    type=artist.type,
                    main_genre=artist.genres[0] if artist.genres else None,
                    queried_at=current_datetime,
                )
            )

        return tabular_data
