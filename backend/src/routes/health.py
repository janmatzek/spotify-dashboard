from fastapi import APIRouter, Response
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest

health = APIRouter(tags=["health"])


@health.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}


@health.get("/readyz")
def readyz() -> dict[str, str]:
    # For a real readiness probe, add checks (DB ping, external deps, etc.)
    return {"status": "ready"}


@health.get("/metrics")
def metrics() -> Response:
    data = generate_latest()
    return Response(content=data, media_type=CONTENT_TYPE_LATEST)

