"""Prometheus metrics and instrumentation helpers."""

from time import perf_counter
from typing import Callable

from prometheus_client import Counter, Histogram

http_requests_total = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "path", "status"],
)

http_request_duration_seconds = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration in seconds",
    buckets=(
        0.005,
        0.01,
        0.025,
        0.05,
        0.1,
        0.25,
        0.5,
        1.0,
        2.5,
        5.0,
        10.0,
    ),
    labelnames=("method", "path"),
)


async def instrument_request(call_next: Callable, request):
    start = perf_counter()
    response = await call_next(request)

    duration = perf_counter() - start
    method = request.method
    # Use template path when available to reduce label cardinality
    path = getattr(request.scope.get("route"), "path", request.url.path)
    status = str(response.status_code)

    http_requests_total.labels(method=method, path=path, status=status).inc()
    http_request_duration_seconds.labels(method=method, path=path).observe(
        duration
    )

    return response
