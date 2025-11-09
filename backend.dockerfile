FROM python:3.13-slim

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser -m -d /home/appuser appuser

# Copy uv from official image
COPY --from=ghcr.io/astral-sh/uv:0.8.13 /uv /uvx /bin/

# Set working directory and copy files
WORKDIR /app
COPY --chown=appuser:appuser backend/ .

# Install dependencies as root
RUN uv sync --locked

# Create cache directory and set ownership
RUN mkdir -p /home/appuser/.cache && \
    chown -R appuser:appuser /home/appuser/.cache

# Switch to non-root user
USER appuser

# Run application
ENTRYPOINT ["uv", "run", "python", "prod.py"]
