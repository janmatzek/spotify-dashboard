"""Helper module to run the app in debug mode."""

import os

import uvicorn


def run_prod(port: int) -> None:
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)


if __name__ == "__main__":
    port = int(os.environ["BACKEND_PORT"])

    run_prod(port)
