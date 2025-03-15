from fastapi.responses import JSONResponse

from src.utils.environment import Config
from src.utils.logging import get_logger

logger = get_logger(__name__)


class ResponseManager:
    """Handles creation of JSON reponses."""

    def __init__(self, config: Config):
        self.config = config

    def create_response(
        self, status_code: int, message: str, e: Exception | None = None
    ) -> JSONResponse:
        """
        Creates a HTTP response dict.
        Args:
            status_code (int): HTTP status
            message (str): message in the body of the response
            e (Exception) : optional, error description
        """
        if e:
            appendix = f"\n{e}"
        else:
            appendix = ""

        message = f"{message}{appendix}"

        response = JSONResponse(
            status_code=status_code,
            content=message,
        )
        logger.info(message)
        return response
