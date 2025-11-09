import asyncio

from src.spotify_api.spotify_api import SpotifyAPI
from src.utils.logging import get_logger

logger = get_logger(__name__)


class Scheduler:
    """Task manager for the backend API.

    Creates an executuion loop that will call periodic tasks.
    """

    running: bool
    sleep_time: int

    def __init__(self, spotify_api: SpotifyAPI) -> None:
        self.spotify_api: SpotifyAPI = spotify_api
        self.start_execution_loop()

        # Sleep time in seconds
        if self.spotify_api.config.environment == "prod":
            # 1 hour in seconds for prod
            self.sleep_time = 60 * 60
        else:
            self.sleep_time = 60 * 5

    def start_execution_loop(self) -> None:
        """Starts the execution loop."""
        logger.info("Starting the execution loop")
        self.running = True
        asyncio.create_task(self.execution_loop())

    def stop_execution_loop(self) -> None:
        """Stops the execution loop."""
        logger.info("Stopping the execution loop")
        self.running = False

    async def execution_loop(self) -> None:
        """Execution loop for the backend API.

        Periodically fetches data from Spotify API and executes queries to prepare
        the data for the frontend charts.
        """
        while self.running:
            logger.info("Executing the execution loop")

            # Run scheduled queries
            for query in self.spotify_api.db.queries.queries:
                query()

            # Run API calls
            await asyncio.gather(
                self.spotify_api.get_track_data(),
                self.spotify_api.get_artists_data(),
            )

            # Sleep for 1 hour
            await asyncio.sleep(self.sleep_time)
