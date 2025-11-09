FROM python:3.13-slim
COPY --from=ghcr.io/astral-sh/uv:0.8.13 /uv /uvx /bin/
COPY backend/ app/
WORKDIR /app
RUN uv sync --locked
ENTRYPOINT ["uv", "run", "python", "prod.py"]
