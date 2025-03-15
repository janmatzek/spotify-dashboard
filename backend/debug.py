"""Helper module to run the app in debug mode."""

import os

import uvicorn


def run_dev() -> None:
    uvicorn.run("app:app", host="0.0.0.0", port=8040, reload=True)


if __name__ == "__main__":
    os.environ["ENVIRONMENT"] = "dev"
    run_dev()
