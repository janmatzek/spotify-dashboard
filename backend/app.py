"""FastAPI backend for Janne's Spotify Dashboard web application"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routes.charts import charts
from src.routes.health import health
from src.routes.pipelines import pipelines
from src.utils.environment import Config
from src.utils.lifespan import lifespan
from src.utils.logging import setup_logging
from src.utils.metrics import instrument_request

setup_logging()


app: FastAPI = FastAPI(
    title="Spotify Dashboard Backend API",
    description="App to extract, transform and store spotify listening data.",
    summary="Backend API",
    docs_url="/",
    redoc_url=None,
    lifespan=lifespan,
    root_path="/api/v1",
)

app.include_router(charts)
app.include_router(pipelines)
app.include_router(health)


# TODO: revise CORS origins, load from ENV or config
origins: list[str] = [
    "http://localhost",
    f"http://localhost:{Config.frontend_port}",
]

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)


# Lightweight metrics middleware
@app.middleware("http")
async def metrics_middleware(request, call_next):
    return await instrument_request(call_next, request)
