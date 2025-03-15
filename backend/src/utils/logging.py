import logging
import logging.config


class ColoredFormatter(logging.Formatter):
    """Custom formatter that adds colors to log levels"""

    # ANSI color codes
    COLORS = {
        "DEBUG": "\033[36m",  # Cyan
        # "INFO": "\033[32m",  # Green
        "WARNING": "\033[33m",  # Yellow
        "ERROR": "\033[31m",  # Red
        "CRITICAL": "\033[35m",  # Magenta
    }
    RESET = "\033[0m"  # Reset color

    def format(self, record: logging.LogRecord) -> str:
        # Get the original formatted message
        log_message = super().format(record)

        # Add color based on log level
        if record.levelname in self.COLORS:
            color = self.COLORS[record.levelname]
            log_message = f"{color}{log_message}{self.RESET}"

        return log_message


LOG_FORMAT = "%(levelname)s: %(name)s: %(message)s"

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": LOG_FORMAT,
        },
        "colored": {
            "()": ColoredFormatter,
            "format": LOG_FORMAT,
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "colored",
        },
    },
    "root": {
        "level": "INFO",
        "handlers": ["console"],
    },
}


def setup_logging() -> None:
    logging.config.dictConfig(LOGGING_CONFIG)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
